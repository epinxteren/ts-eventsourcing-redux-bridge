import { ServerGatewayInterface } from '../ServerGatewayInterface';
import { Socket } from 'socket.io';
import { EMPTY, fromEvent, Observable, Subject } from 'rxjs';
import { catchError, finalize, map, mapTo, share, switchMap, takeUntil } from 'rxjs/operators';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { SerializableAction } from '../../Redux/SerializableAction';
import { ServerGatewayMessage } from '../ValueObject/ServerGatewayMessage';
import { NodeJSEventEmitterGateway } from '../node.js/NodeJSEventEmitterGateway';

export interface ServerSocketIOGatewayMetadata {
  client: Socket;
  clientGateway: ServerGatewayInterface<ServerSocketIOGatewayMetadata>;
}

export type ServerSocketIOGatewayMessage = ServerGatewayMessage<ServerSocketIOGatewayMetadata>;

/**
 * Connect to different clients, client errors will be passed to the error stream.
 */
export class ServerSocketIOGateway implements ServerGatewayInterface<ServerSocketIOGatewayMetadata> {

  private readonly warnings$: Subject<Error> = new Subject();
  private readonly message$: Observable<ServerGatewayMessage<ServerSocketIOGatewayMetadata>>;
  private readonly broadcastGateway: NodeJSEventEmitterGateway;
  private readonly connections$: Observable<ServerSocketIOGatewayMetadata>;
  private readonly disconnect$: Observable<ServerSocketIOGatewayMetadata>;

  constructor(emitter: NodeJS.EventEmitter, serializer: SerializerInterface) {
    this.connections$ = fromEvent<Socket>(emitter, 'connection')
      .pipe(
        map((socket) => {
          const metadata: ServerSocketIOGatewayMetadata = { client: socket, clientGateway: undefined } as any;
          const clientGateway = new NodeJSEventEmitterGateway(emitter, serializer, metadata);
          metadata.clientGateway = clientGateway as any;
          return metadata as any;
        }),
        share(),
      );

    this.disconnect$ = this.connections$.pipe(
      switchMap((metadata: ServerSocketIOGatewayMetadata) => {
        return fromEvent(metadata.client, 'disconnect').pipe(
          mapTo(metadata),
        );
      }),
      share(),
    );

    this.message$ = this.connections$.pipe(
      switchMap((metadata: ServerSocketIOGatewayMetadata) => {
        const subscription = metadata.clientGateway.warnings().subscribe(this.warnings$);
        return metadata.clientGateway
          .listen()
          .pipe(
            takeUntil(fromEvent(metadata.client, 'disconnect')),
            finalize(() => {
              subscription.unsubscribe();
              metadata.client.disconnect();
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

  public listen(): Observable<ServerSocketIOGatewayMessage> {
    return this.message$;
  }

  public connections(): Observable<ServerSocketIOGatewayMetadata> {
    return this.connections$;
  }

  public disconnects(): Observable<ServerSocketIOGatewayMetadata> {
    return this.disconnect$;
  }

  public warnings(): Observable<Error> {
    return this.warnings$;
  }

}
