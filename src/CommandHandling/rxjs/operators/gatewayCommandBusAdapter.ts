import { CommandBus } from 'ts-eventsourcing/CommandHandling/CommandBus';
import { Observable } from 'rxjs';
import { ServerGatewayMessage } from '../../../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../../../Gateway/ValueObject/ServerGatewayMetadata';
import { dispatchClientCommandOnCommandBus } from './dispatchClientCommandOnCommandBus';
import { emitCommandHandlerResponseOrErrorToClientGateway } from './emitCommandHandlerResponseOrErrorToClientGateway';

/**
 * Dispatch on command bus and emit success or error on client gateway.
 */
export function gatewayCommandBusAdapter(commandBus: CommandBus) {
  return (input: Observable<ServerGatewayMessage<ServerGatewayMetadata<any>>>) => {
    return input.pipe(
        emitCommandHandlerResponseOrErrorToClientGateway(
          dispatchClientCommandOnCommandBus(commandBus),
        ),
    );
  };
}
