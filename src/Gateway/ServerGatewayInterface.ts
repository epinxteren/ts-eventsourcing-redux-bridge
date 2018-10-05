import { Observable } from 'rxjs';
import { SerializableAction } from '../Redux/SerializableAction';
import { ServerGatewayMessage } from './ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from './ValueObject/ServerGatewayMetadata';

export interface ServerGatewayInterface<Metadata extends ServerGatewayMetadata<ServerGatewayInterface<Metadata>> = ServerGatewayMetadata<ServerGatewayInterface<Metadata>>> {
  emit(action: SerializableAction): Promise<void>;
  listen(): Observable<ServerGatewayMessage<Metadata>>;
  warnings(): Observable<Metadata & { error: Error }>;
}
