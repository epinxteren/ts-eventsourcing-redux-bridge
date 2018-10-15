import { CommandBus } from 'ts-eventsourcing/CommandHandling/CommandBus';
import { Observable } from 'rxjs';
import { ServerGatewayMessage } from '../../../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../../../Gateway/ValueObject/ServerGatewayMetadata';
import { mergeMap } from 'rxjs/operators';

/**
 * Dispatch gateway messages to the command bus.
 */
export function dispatchClientCommandOnCommandBus(commandBus: CommandBus) {
  return (input: Observable<ServerGatewayMessage<ServerGatewayMetadata<any>>>): Observable<unknown> => {
    return input.pipe(
      mergeMap(async (message) => {
        return await commandBus.dispatch(message.command);
      }),
    );
  };
}
