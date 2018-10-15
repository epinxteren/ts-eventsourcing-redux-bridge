import { Observable, of } from 'rxjs';
import { catchError, mergeMap, share } from 'rxjs/operators';
import { commandHandledFailed, commandHandledSuccessfully } from '../../../Redux/Action/commandActions';
import { ServerGatewayMessage } from '../../../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../../../Gateway/ValueObject/ServerGatewayMetadata';
import { fromClientCommand } from './fromClientCommand';

/**
 * Emit success or error action on client gateway.
 */
export function emitCommandHandlerResponseOrErrorToClientGateway<T extends ServerGatewayMessage<ServerGatewayMetadata<any>>>(
  handleMessages$: (input: Observable<T>) => Observable<unknown>,
) {
  return (input: Observable<T>) => {
    return input.pipe(
      fromClientCommand((clientGateway, message) => {
        return () => {
          const response$ = handleMessages$(of(message)).pipe(share());
          return response$
            .pipe(
              mergeMap(async (response: unknown) => {
                const successAction = commandHandledSuccessfully(
                  message.command,
                  message.metadata.entity ? message.metadata.entity : 'UNKNOWN',
                  response,
                );
                await clientGateway.emit(successAction);
                return of(successAction);
              }),
              catchError(async (error) => {
                const failedAction = commandHandledFailed(
                  message.command,
                  message.metadata.entity ? message.metadata.entity : 'UNKNOWN',
                  error,
                );
                await clientGateway.emit(failedAction);
                return of(failedAction);
              }),
            );
        };
      }),
    );
  };
}
