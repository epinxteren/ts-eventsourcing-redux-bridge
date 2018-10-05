import { ServerGatewayInterface } from '../ServerGatewayInterface';
import { Socket } from 'socket.io';
import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { EMPTY, fromEvent, Observable, Subject } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { SerializableAction } from '../../Redux/SerializableAction';
import { deserializeCommand } from '../rxjs/operators/deserializeCommand';

export class ServerSocketIOGateway implements ServerGatewayInterface {

  private warnings$: Subject<Error> = new Subject();
  private connections$: Observable<Socket>;

  constructor(private emitter: NodeJS.EventEmitter, private serializer: SerializerInterface) {
    this.connections$ = fromEvent<Socket>(emitter, 'connection');
  }

  public async emit(command: SerializableAction): Promise<void> {
    const serialized = this.serializer.serialize(command);
    this.emitter.emit('command', serialized);
  }

  public listen(): Observable<SerializableCommand> {
    return this.connections$.pipe(
      switchMap((socket) => {
        return fromEvent<string>(socket, 'command')
          .pipe(
            deserializeCommand(this.serializer),
            takeUntil(fromEvent(socket, 'disconnect')),
            finalize(() => {
              socket.disconnect();
            }),
            catchError((e) => {
              this.warnings$.next(e);
              return EMPTY;
            }),
          );
      }),
    );
  }

  public warnings(): Observable<Error> {
    return this.warnings$;
  }

}
