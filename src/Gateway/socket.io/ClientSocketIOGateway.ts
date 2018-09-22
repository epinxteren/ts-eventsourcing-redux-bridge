import { ClientGatewayInterface } from '../ClientGatewayInterface';
import { Observable } from 'rxjs';
import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { isSerializableAction, SerializableAction } from '../../Redux/SerializableAction';
import { SerializerInterface } from '../../Serializer';
import { DeserializationError, MalformedSerializableActionError, SerializationError } from '../Error';

export class ClientSocketIOGateway implements ClientGatewayInterface {

  constructor(private socket: SocketIOClient.Socket,
              private serializer: SerializerInterface) {

  }

  /**
   *
   */
  public listen(): Observable<SerializableAction> {
    return new Observable((subscriber) => {
      const messageListener = (json: string) => {
        let action;
        try {
          action = this.serializer.deserialize(json);
        } catch (e) {
          subscriber.error(DeserializationError.eventCouldNotBeDeSerialized(json, e));
          return;
        }
        if (!isSerializableAction(action)) {
          subscriber.error(MalformedSerializableActionError.notASerializableAction(action));
          return;
        }
        subscriber.next(action);
      };
      this.socket.addEventListener('action', messageListener);
      return () => {
        this.socket.removeEventListener('action', messageListener);
      };
    });
  }

  public async emit(command: SerializableCommand): Promise<void> {
    let serialized;
    try {
      serialized = this.serializer.serialize(command);
    } catch (e) {
      return Promise.reject(SerializationError.commandCouldNotBeSerialized(command, e));
    }
    this.socket.emit('command', serialized);
  }

}
