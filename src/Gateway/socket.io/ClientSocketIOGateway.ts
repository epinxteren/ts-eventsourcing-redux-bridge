import { fromEvent, merge, Observable, of, throwError } from 'rxjs';
import { SerializableCommand } from '../../CommandHandling/SerializableCommand';
import { SerializableAction } from '../../Redux/SerializableAction';

import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { SerializationError } from '../Error/SerializationError';
import { ClientGatewayInterface } from '../ClientGatewayInterface';
import { MalformedSerializableCommandError } from '../Error/MalformedSerializableCommandError';
import { filter, first, mapTo, mergeMap, share } from 'rxjs/operators';
import { deserializeAction } from '../Operators/deserializeAction';
import { EntityMetadata } from '../../Redux/EntityMetadata';

export class ClientSocketIOGateway implements ClientGatewayInterface {

  private readonly actions$: Observable<SerializableAction>;
  private readonly connected$: Observable<Observable<SerializableAction>>;

  constructor(private socket: SocketIOClient.Socket,
              private serializer: SerializerInterface) {
    const serializedAction$ = fromEvent<string>(this.socket, 'action');
    const errors$ = merge(
      fromEvent<unknown>(this.socket, 'error'),
    ).pipe(
      mergeMap((error) => throwError(error)),
      share(),
    );

    this.actions$ = merge(
      errors$,
      serializedAction$.pipe(
        deserializeAction(serializer),
        share(),
      ),
    );

    this.connected$ = merge(
      of(this.socket.connected).pipe(filter(connected => connected)),
      fromEvent<unknown>(this.socket, 'connect').pipe(),
      errors$,
    )
      .pipe(
        first(),
        mapTo(this.actions$),
      );
  }

  public listen(): Promise<Observable<SerializableAction>> {
    return this.connected$.toPromise();
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
