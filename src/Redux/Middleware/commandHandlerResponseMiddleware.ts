import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import { CommandAction, isCommandAction } from '../CommandAction';
import {
  COMMAND_FAILED, COMMAND_LISTEN,
  COMMAND_SUCCEEDED,
  COMMAND_TRANSMISSION_FAILED, COMMAND_TRANSMITTED_SUCCESSFULLY, COMMAND_TRANSMITTING,
} from '../Action/commandActions';
import { from, PartialObserver, Subject, Subscribable, Subscription, Unsubscribable } from 'rxjs';
import { Map } from 'immutable';
import { ignoreElements, timeout } from 'rxjs/operators';

export class CommandHandlerResponseSubscribable<CommandResponse> implements Subscribable<CommandResponse> {

  public readonly type: string;
  private readonly commandHandlerResponse$ = new Subject<CommandResponse>();
  private readonly resetTimeout$ = new Subject();
  private timerSubscription: Subscription | undefined;

  constructor(private command: CommandAction) {
    this.type = COMMAND_LISTEN(command.metadata.entity);
  }

  public getCommandAction() {
    return this.command;
  }

  public start(timeoutTime: number) {
    const timeout$ = this.resetTimeout$.pipe(timeout(timeoutTime), ignoreElements());
    this.timerSubscription = timeout$.subscribe(this.commandHandlerResponse$);
  }

  public error(error: unknown) {
    this.resetTimer();
    this.commandHandlerResponse$.error(error);
  }

  public response(response: CommandResponse) {
    this.resetTimer();
    this.commandHandlerResponse$.next(response);
    this.resetTimeout$.complete();
    this.commandHandlerResponse$.complete();
  }

  public resetTimer() {
    this.resetTimeout$.next();
  }

  public subscribe(observer?: PartialObserver<CommandResponse>): Unsubscribable;
  public subscribe(next?: (value: CommandResponse) => void, error?: (error: any) => void, complete?: () => void): Unsubscribable;
  public subscribe(observer?: PartialObserver<CommandResponse> | ((value: CommandResponse) => void), error?: (error: any) => void, complete?: () => void): Unsubscribable {
    return this.commandHandlerResponse$.subscribe(observer as any, error, complete).add(this.timerSubscription);
  }

  public toPromise(): Promise<CommandResponse> {
    return from(this).toPromise();
  }
}

export function isCommandStatusSubscribable<T>(action: AnyAction): action is CommandHandlerResponseSubscribable<T> {
  return action && (action instanceof CommandHandlerResponseSubscribable);
}

/**
 * Send events to command observer, so current status of a transmitted command can be watched everywhere in the application.
 *
 * This is optional and only available when the server sends command handlers responses back.
 *
 * @see gatewayCommandBusAdapter
 */
export function commandHandlerResponseMiddleware<D extends Dispatch = Dispatch, S = any, Action extends AnyAction = AnyAction>(
  timeoutTimer: number = 5000,
) {
  let listeners  = Map<string, CommandHandlerResponseSubscribable<unknown>>();
  return (api: MiddlewareAPI<D, S>) => (next: D) => (action: Action): any => {
    next(action);
    if (isCommandStatusSubscribable(action)) {
      listeners = listeners.set(action.getCommandAction().metadata.entity, action as any);
      action.start(timeoutTimer);
      api.dispatch(action.getCommandAction());
      return;
    }
    if (!isCommandAction(action)) {
      return;
    }
    const metadata = action.metadata;
    const entity = metadata.entity;
    if (!listeners.has(entity)) {
      return;
    }
    const listener: CommandHandlerResponseSubscribable<unknown> = listeners.get(entity) as any;

    action.next(action.type);

    switch (action.type) {
      case COMMAND_TRANSMITTING(entity):
        listener.resetTimer();
        break;

      case COMMAND_TRANSMITTED_SUCCESSFULLY(entity):
        listener.resetTimer();
        break;

      case COMMAND_TRANSMISSION_FAILED(entity):
        listener.error(metadata.error);
        break;

      case COMMAND_SUCCEEDED(entity):
        listener.response(metadata.response);
        break;

      case COMMAND_FAILED(entity):
        listener.error(metadata.error);
        break;
    }
  };
}
