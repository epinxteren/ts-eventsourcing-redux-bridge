import { CommandBus } from 'ts-eventsourcing/CommandHandling/CommandBus';
import { mergeMap, share } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ServerGatewayMessage } from '../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../Gateway/ValueObject/ServerGatewayMetadata';
import { commandHandledFailed, commandHandledSuccessfully } from '../Redux/Action/commandActions';
import { ServerGatewayInterface } from '../Gateway/ServerGatewayInterface';

export function gatewayCommandBusAdapter(commandBus: CommandBus) {
  return (input: Observable<ServerGatewayMessage<ServerGatewayMetadata<any>>>) => {
    return input.pipe(
      mergeMap(async (message) => {
        const clientGateway: ServerGatewayInterface = message.metadata.clientGateway;
        try {
          await commandBus.dispatch(message.command);
        } catch (e) {
          const failedAction = commandHandledFailed(message.command, message.metadata.entity ? message.metadata.entity : 'UNKNOWN');
          await clientGateway.emit(failedAction);
          return of(failedAction);
        }
        const successAction = commandHandledSuccessfully(message.command, message.metadata.entity ? message.metadata.entity : 'UNKNOWN');
        await clientGateway.emit(successAction);
        return of(successAction);
      }),
      share(),
    );
  };
}
