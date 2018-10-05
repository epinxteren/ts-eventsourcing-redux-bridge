import { EMPTY, fromEvent, Observable } from 'rxjs';
import { isSerializableAction, SerializableAction } from '../../Redux/SerializableAction';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { MalformedSerializableActionError } from '../Error/MalformedSerializableActionError';
import { SerializationError } from '../Error/SerializationError';
import { ServerGatewayInterface } from '../ServerGatewayInterface';
import { deserializeCommand } from '../rxjs/operators/deserializeCommand';
import { map } from 'rxjs/operators';
import { ServerGatewayMessage } from '../ValueObject/ServerGatewayMessage';

export class NodeJSEventEmitterGateway<Metadata = {}> implements ServerGatewayInterface<Metadata> {
  private readonly commands$: Observable<ServerGatewayMessage<Metadata>>;

  constructor(private emitter: NodeJS.EventEmitter,
              private serializer: SerializerInterface,
              metadata: Metadata) {

    const serializedCommands$ = fromEvent<string>(this.emitter, 'command');
    this.commands$ = serializedCommands$
      .pipe(
        deserializeCommand(this.serializer),
        map((command) => {
          return {
            command,
            metadata,
          };
        }),
      )
    ;
  }

  public listen(): Observable<ServerGatewayMessage<Metadata>> {
    return this.commands$;
  }

  public warnings(): Observable<Error> {
    return EMPTY;
  }

  public async emit(action: SerializableAction): Promise<void> {
    let serialized;
    if (!isSerializableAction(action)) {
      throw MalformedSerializableActionError.notASerializableAction(action);
    }
    try {
      serialized = this.serializer.serialize(action);
    } catch (e) {
      throw SerializationError.actionCouldNotBeSerialized(action, e);
    }
    this.emitter.emit('action', serialized);
  }

}
