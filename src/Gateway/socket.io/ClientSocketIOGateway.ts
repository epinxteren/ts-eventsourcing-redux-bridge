import { fromEvent, merge, Observable, throwError } from 'rxjs';
import { SerializableCommand } from '../../CommandHandling/SerializableCommand';
import { SerializableAction } from '../../Redux/SerializableAction';

import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { SerializationError } from '../Error/SerializationError';
import { ClientGatewayInterface } from '../ClientGatewayInterface';
import { MalformedSerializableCommandError } from '../Error/MalformedSerializableCommandError';
import { mergeMap, share } from 'rxjs/operators';
import { deserializeAction } from '../Operators/deserializeAction';
import { EntityMetadata } from '../../Redux/EntityMetadata';

export class ClientSocketIOGateway implements ClientGatewayInterface {

  private readonly actions$: Observable<SerializableAction>;

  constructor(private socket: SocketIOClient.Emitter,
              private serializer: SerializerInterface) {
    const serializedAction$ = fromEvent<string>(this.socket, 'action');
    const errors$ = fromEvent<unknown>(this.socket, 'error');
    this.actions$ = merge(
      errors$.pipe(
        mergeMap((error) => throwError(error)),
      ),
      serializedAction$.pipe(
        deserializeAction(serializer),
        share(),
      ),
    );
  }

  public listen(): Observable<SerializableAction> {
    return this.actions$;
  }

  public async emit(command: SerializableCommand, metadata: EntityMetadata): Promise<void> {
    let serialized;
    if (!SerializableCommand.isSerializableCommand(command)) {
      throw MalformedSerializableCommandError.notASerializableCommand(command);
    }
    try {
      serialized = this.serializer.serialize({ command, metadata });
    } catch (e) {
      throw SerializationError.commandCouldNotBeSerialized(command, e);
    }
    this.socket.emit('command', serialized);
  }

}
