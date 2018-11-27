import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, share } from 'rxjs/operators';
import { queryHandledFailed, queryHandledSuccessfully } from '../actions';
import { ServerGatewayMessage } from '../../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../../Gateway/ValueObject/ServerGatewayMetadata';
import { fromClientQuery } from './fromClientQuery';
import { hasEntityMetadata } from '../../Redux/EntityMetadata';
import { MissingEntityMetadataError } from '../../Redux/Error/MissingEntityMetadataError';
import { QueryAction } from '../QueryAction';

/**
 * Emit success or error action on client gateway.
 */
export function emitQueryHandlerResponseOrErrorToClientGateway<T extends ServerGatewayMessage<ServerGatewayMetadata<any>>>(
  handleMessages$: (input: Observable<T>) => Observable<unknown>,
) {
  return (input: Observable<T>): Observable<QueryAction> => {
    return input.pipe(
      fromClientQuery((clientGateway, message) => {
        return () => {
          const response$ = handleMessages$(of(message)).pipe(share());
          return response$
            .pipe(
              mergeMap(async (response: unknown) => {
                if (!hasEntityMetadata(message)) {
                  throw MissingEntityMetadataError.forGatewayMessage(message);
                }
                const successAction = queryHandledSuccessfully(
                  message.payload,
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
                const failedAction = queryHandledFailed(
                  message.payload,
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
