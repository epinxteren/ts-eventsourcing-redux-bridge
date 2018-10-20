import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import { merge, Subject, of } from 'rxjs';
import { share, filter, take, takeUntil, catchError } from 'rxjs/operators';
import { EntityMetadata } from '../../Redux/EntityMetadata';
import {
  GATEWAY_CLOSE,
  GATEWAY_OPEN,
  gatewayError,
  gatewayIsClosed,
  gatewayIsOpen,
} from '../Action/gatewayActions';
import { ClientGatewayInterface } from '../ClientGatewayInterface';
import { withEntityName } from '../../Redux/Operators/EntityMetadata';
import { GatewayAction, isGatewayAction } from '../GatewayAction';

export function gatewayMiddleway<T, Metadata extends EntityMetadata = EntityMetadata, D extends Dispatch = Dispatch, S = any, Action extends AnyAction = AnyAction>(
  gatewayFactory: (gate: T, metadata: Metadata) => ClientGatewayInterface,
) {

  const gatewayActionsSubject$ = new Subject<GatewayAction<T, Metadata>>();
  const closeGatewayActions$ = gatewayActionsSubject$.pipe(
    filter((nextAction) => isGatewayAction(nextAction, GATEWAY_CLOSE)),
    share(),
  );

  return (api: MiddlewareAPI<D, S>) => (next: D) => (action: Action): any => {
    const response = next(action);
    if (isGatewayAction<T, Metadata>(action, GATEWAY_OPEN)) {
      const gateway = gatewayFactory(action.gate, action.metadata);
      const entity = action.metadata.entity;

      merge(
        of(gatewayIsOpen<T>(entity, action.gate)),
        gateway.listen().pipe(catchError((error, stream) => {
          api.dispatch(gatewayError(entity, action.gate, error));
          return stream;
        })),
      )
        .pipe(takeUntil(closeGatewayActions$.pipe(
          withEntityName(entity),
          take(1),
        )))
        .subscribe(
          (nextAction) => {
            api.dispatch(nextAction);
          },
          (error) => {
            api.dispatch(gatewayError(entity, action.gate, error));
          },
          () => {
            api.dispatch(gatewayIsClosed(entity, action.gate));
          },
        );
    }
    return response;
  };
}
