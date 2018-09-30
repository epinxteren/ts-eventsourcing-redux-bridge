import { ClientGatewayInterface } from '..';
import { Observable, Subject } from 'rxjs';
import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { isSerializableAction, SerializableAction } from '../../Redux/SerializableAction';
import { SerializerInterface } from '../../Serializer';
import {
  DeserializationError,
  MalformedSerializableActionError,
  MalformedSerializableCommandError,
  SerializationError
} from '../Error';
import { share } from 'rxjs/operators';

export class ClientSocketIOGateway implements ClientGatewayInterface {

  private readonly warningsSubject = new Subject<Error>();
  private readonly observable: Observable<SerializableAction>;

  constructor(private socket: SocketIOClient.Emitter,
              private serializer: SerializerInterface) {

    const actions$ = new Observable<SerializableAction>((subscriber) => {
      const messageListener = (json: string) => {
        let action;
        try {
          action = this.serializer.deserialize(json);
        } catch (e) {
          this.warningsSubject.next(DeserializationError.eventCouldNotBeDeSerialized(json, e));
          return;
        }
        if (!isSerializableAction(action)) {
          this.warningsSubject.next(MalformedSerializableActionError.notASerializableAction(action));
          return;
        }
        subscriber.next(action);
      };
      this.socket.addEventListener('action', messageListener);
      return () => {
        this.socket.removeEventListener('action', messageListener);
      };
    });
    this.observable = actions$.pipe(share());
  }

  public listen(): Observable<SerializableAction> {
    return this.observable;
  }

  public async emit(command: SerializableCommand): Promise<void> {
    let serialized;
    if (!SerializableCommand.isSerializableCommand(command)) {
      throw MalformedSerializableCommandError.notASerializableCommand(command);
    }
    try {
      serialized = this.serializer.serialize(command);
    } catch (e) {
      throw SerializationError.commandCouldNotBeSerialized(command, e);
    }
    this.socket.emit('command', serialized);
  }

  public warnings(): Observable<Error> {
    return this.warningsSubject;
  }

}
