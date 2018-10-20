import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, share } from 'rxjs/operators';
import { commandHandledFailed, commandHandledSuccessfully } from '../actions';
import { ServerGatewayMessage } from '../../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../../Gateway/ValueObject/ServerGatewayMetadata';
import { fromClientCommand } from './fromClientCommand';
import { hasEntityMetadata } from '../../Redux/EntityMetadata';
import { MissingEntityMetadataError } from '../../Redux/Error/MissingEntityMetadataError';
import { CommandAction } from '../CommandAction';

/**
 * Emit success or error action on client gateway.
 */
export function emitCommandHandlerResponseOrErrorToClientGateway<T extends ServerGatewayMessage<ServerGatewayMetadata<any>>>(
  handleMessages$: (input: Observable<T>) => Observable<unknown>,
) {
  return (input: Observable<T>): Observable<CommandAction> => {
    return input.pipe(
      fromClientCommand((clientGateway, message) => {
        return () => {
          const response$ = handleMessages$(of(message)).pipe(share());
          return response$
            .pipe(
              mergeMap(async (response: unknown) => {
                if (!hasEntityMetadata(message)) {
                  throw MissingEntityMetadataError.forGatewayMessage(message);
                }
                const successAction = commandHandledSuccessfully(
                  message.command,
                  message.metadata.entity,
                  response,
                );
                await clientGateway.emit(successAction);
                return of(successAction);
              }),
              catchError(async (error) => {
                if (!hasEntityMetadata(message)) {
                  throw MissingEntityMetadataError.forGatewayMessage(message);
                }
                const failedAction = commandHandledFailed(
                  message.command,
                  message.metadata.entity,
                  error,
                );
                await clientGateway.emit(failedAction);
                return of(failedAction);
              }),
              map((action) => action as any),
            );
        };
      }),
    );
  };
}
