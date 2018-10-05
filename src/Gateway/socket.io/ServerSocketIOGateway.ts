import { ServerGatewayInterface } from '../ServerGatewayInterface';
import { Socket } from 'socket.io';
import { EMPTY, fromEvent, Observable, Subject } from 'rxjs';
import { catchError, finalize, share, switchMap, takeUntil } from 'rxjs/operators';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { SerializableAction } from '../../Redux/SerializableAction';
import { ServerGatewayMessage } from '../ValueObject/ServerGatewayMessage';
import { NodeJSEventEmitterGateway } from '../node.js/NodeJSEventEmitterGateway';

export interface ServerSocketIOGatewayMetadata {
  client: Socket;
  clientGateway: ServerGatewayInterface;
}

export class ServerSocketIOGateway implements ServerGatewayInterface<ServerSocketIOGatewayMetadata> {

  private readonly warnings$: Subject<Error> = new Subject();
  private readonly message$: Observable<ServerGatewayMessage<ServerSocketIOGatewayMetadata>>;
  private readonly broadcastGateway: NodeJSEventEmitterGateway;

  constructor(emitter: NodeJS.EventEmitter, serializer: SerializerInterface) {
    const connections$ = fromEvent<Socket>(emitter, 'connection');
    this.message$ = connections$.pipe(
      switchMap((socket) => {
        const metadata: ServerSocketIOGatewayMetadata = { client: socket, clientGateway: undefined } as any;
        const clientGateway = new NodeJSEventEmitterGateway(emitter, serializer, metadata);
        metadata.clientGateway = clientGateway;
        const subscription = clientGateway.warnings().subscribe(this.warnings$);
        return clientGateway
          .listen()
          .pipe(
            takeUntil(fromEvent(socket, 'disconnect')),
            finalize(() => {
              subscription.unsubscribe();
              socket.disconnect();
            }),
            catchError((e) => {
              this.warnings$.next(e);
              return EMPTY;
            }),
          );
      }),
      // All subscriber are now also listing to previous connected sockets.
      share(),
    );
    this.broadcastGateway = new NodeJSEventEmitterGateway(emitter, serializer, {});
  }

  public async emit(action: SerializableAction): Promise<void> {
    return this.broadcastGateway.emit(action);
  }

  public listen(): Observable<ServerGatewayMessage<ServerSocketIOGatewayMetadata>> {
    return this.message$;
  }

  public warnings(): Observable<Error> {
    return this.warnings$;
  }

}
