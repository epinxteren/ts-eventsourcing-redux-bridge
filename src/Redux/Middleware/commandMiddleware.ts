import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import { isCommandActionOfType } from '../CommandAction';
import {
  COMMAND_TRANSMITTING,
  commandTransmissionFailed,
  commandTransmittedSuccessfully,
} from '../Action/commandActions';
import { ClientGatewayInterface } from '../../Gateway/ClientGatewayInterface';

export function commandMiddleware<D extends Dispatch = Dispatch, S = any, Action extends AnyAction = AnyAction>(gateway: ClientGatewayInterface) {
  return (api: MiddlewareAPI<D, S>) => (next: D) => (action: Action): any => {
    next(action);
    if (isCommandActionOfType(action, COMMAND_TRANSMITTING)) {
      gateway.emit(action.command, action.metadata)
        .then(() => {
          api.dispatch(commandTransmittedSuccessfully(action.command, action.metadata.entity, action.metadata));
        })
        .catch((error) => {
          api.dispatch(commandTransmissionFailed(action.command, action.metadata.entity, {
            ...action.metadata,
            error,
          }));
        });
    }
  };
}
