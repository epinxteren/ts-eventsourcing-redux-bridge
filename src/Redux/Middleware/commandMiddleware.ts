import { Action, Dispatch, MiddlewareAPI } from 'redux';
import { ClientGatewayInterface } from '../../Gateway';
import { isCommandAction } from '../CommandAction';
import { commandTransmissionFailed, commandTransmittedSuccessfully } from '../Action/commandActions';

export function commandMiddleware(gateway: ClientGatewayInterface) {
  return (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => (action: Action): any => {
    next(action);
    if (isCommandAction(action)) {
      gateway.emit(action.command)
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
