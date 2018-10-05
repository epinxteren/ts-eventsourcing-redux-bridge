import { fromEvent, Observable, Subject } from 'rxjs';
import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { isSerializableAction, SerializableAction } from '../../Redux/SerializableAction';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { MalformedSerializableActionError } from '../Error/MalformedSerializableActionError';
import { SerializationError } from '../Error/SerializationError';
import { ServerGatewayInterface } from '../ServerGatewayInterface';
import { deserializeCommand } from '../rxjs/operators/deserializeCommand';
import { catchError } from 'rxjs/operators';
import { MalformedSerializableCommandError } from '../Error/MalformedSerializableCommandError';

export class NodeJSEventEmitterGateway implements ServerGatewayInterface {
  private readonly commands$: Observable<SerializableCommand>;
  private readonly warningsSubject$: Subject<Error> = new Subject();

  constructor(private emitter: NodeJS.EventEmitter,
              private serializer: SerializerInterface) {

    const serializedCommands$ = fromEvent<string>(this.emitter, 'command');
    this.commands$ = serializedCommands$
      .pipe(
        deserializeCommand(this.serializer),
        catchError((e: Error, commands$) => {
          if (e instanceof SerializationError || e instanceof MalformedSerializableCommandError) {
            this.warningsSubject$.next(e);
            return commands$;
          }
          throw e;
        }),
      );
  }

  public listen(): Observable<SerializableCommand> {
    return this.commands$;
  }

  public warnings(): Observable<Error> {
    return this.warningsSubject$;
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
