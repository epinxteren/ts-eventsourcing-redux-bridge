import { Observable, Subject } from 'rxjs';
import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { isSerializableAction, SerializableAction } from '../../Redux/SerializableAction';
import { share } from 'rxjs/operators';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { MalformedSerializableActionError } from '../Error/MalformedSerializableActionError';
import { SerializationError } from '../Error/SerializationError';
import { DeserializationError } from '../Error/DeserializationError';
import { MalformedSerializableCommandError } from '../Error/MalformedSerializableCommandError';
import { ServerGatewayInterface } from '../ServerGatewayInterface';

export class NodeJSEventEmitterGateway implements ServerGatewayInterface {
  private readonly commands: Observable<SerializableCommand>;
  private readonly warningsSubject: Subject<Error> = new Subject();

  constructor(private emitter: NodeJS.EventEmitter,
              private serializer: SerializerInterface) {

    const commands = new Observable((subscriber) => {
      const messageHandler = (json: string) => {
        let command;
        try {
          command = this.serializer.deserialize(json);
        } catch (e) {
          this.warningsSubject.next(DeserializationError.commandCouldNotBeDeSerialized(json, e));
          return;
        }
        // First line of defence, we know we only can only send SerializableCommands.
        if (!SerializableCommand.isSerializableCommand(command)) {
          this.warningsSubject.next(MalformedSerializableCommandError.notASerializableCommand(command));
          return;
        }
        subscriber.next(command);
      };
      this.emitter.addListener('command', messageHandler);

      // Teardown function.
      return () => this.emitter.removeListener('command', messageHandler);
    });

    this.commands = commands.pipe(share());
  }

  public listen(): Observable<SerializableCommand> {
    return this.commands;
  }

  public warnings(): Observable<Error> {
    return this.warningsSubject;
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
