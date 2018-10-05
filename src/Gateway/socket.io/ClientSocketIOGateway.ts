import { fromEvent, Observable } from 'rxjs';
import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { SerializableAction } from '../../Redux/SerializableAction';

import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { SerializationError } from '../Error/SerializationError';
import { ClientGatewayInterface } from '../ClientGatewayInterface';
import { MalformedSerializableCommandError } from '../Error/MalformedSerializableCommandError';
import { share } from 'rxjs/operators';
import { deserializeAction } from '../rxjs/operators/deserializeAction';
import { EntityMetadata } from '../../Redux/EntityMetadata';

export class ClientSocketIOGateway implements ClientGatewayInterface {

  private readonly actions$: Observable<SerializableAction>;

  constructor(private socket: SocketIOClient.Emitter,
              private serializer: SerializerInterface) {
    const serializedAction$ = fromEvent<string>(this.socket, 'action');
    this.actions$ = serializedAction$.pipe(
      deserializeAction(serializer),
      share(),
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
