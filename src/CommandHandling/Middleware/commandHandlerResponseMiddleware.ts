import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';

import { Observable, throwError, Subject, merge } from 'rxjs';
import { timeout, filter, map, share, concatMap, take, takeUntil } from 'rxjs/operators';
import {
  COMMAND_FAILED,
  COMMAND_SUCCEEDED,
  COMMAND_TRANSMISSION_FAILED,
  COMMAND_TRANSMITTING,
} from '../actions';
import { CommandAction, isCommandAction, isCommandActionOfType } from '../CommandAction';
import { withEntityName } from '../../Redux/Operators/EntityMetadata';
import { ofType } from '../../Redux/Operators/Action';

export function isCommandStatusSubscribable<T>(action: unknown): action is CommandAction<T> {
  return isCommandActionOfType(action, COMMAND_TRANSMITTING) && action.metadata.listenToCommandHandler;
}

/**
 * Send events to command observer, so current status of a transmitted command can be watched everywhere in the application.
 *
 * This is optional and only available when the server sends command handlers responses back. {@see gatewayCommandBusAdapter}
 * how to configure this.
 */
export function commandHandlerResponseMiddleware<D extends Dispatch = Dispatch, S = any, Action extends AnyAction = AnyAction>(
  timeoutTime: number = 5000,
) {
  const handleCommandActions$ = new Subject<Action>();
  const commandActions$ = handleCommandActions$.pipe(
    filter(nextAction => isCommandAction(nextAction)),
    map((action: any) => action as CommandAction),
    share(),
  );

  return (_api: MiddlewareAPI<D, S>) => (next: D) => (action: Action): any => {

    handleCommandActions$.next(action);

    if (isCommandStatusSubscribable(action)) {
      const entity = action.metadata.entity;
      const commandsForEntity$: Observable<CommandAction> = commandActions$.pipe(
        withEntityName(entity),
        share(),
      );

      const response$ = commandsForEntity$.pipe(
        ofType(COMMAND_SUCCEEDED(entity)),
        take(1),
        map((nextCommandAction) => {
          return nextCommandAction.metadata.response;
        }),
        share(),
      );

      const errors$ = commandsForEntity$.pipe(
        // If we don't got an event in time, throw an error.
        timeout(timeoutTime),
        // Or throw when one of the following event are given.
        ofType(
          COMMAND_TRANSMISSION_FAILED(entity),
          COMMAND_FAILED(entity),
        ),
        concatMap((nextCommandAction) => {
          return throwError(nextCommandAction.metadata.error);
        }),
        takeUntil(response$),
      );

      const promise = merge(errors$, response$).toPromise();
      next(action);
      return promise;
    }

    return next(action);
  };
}
