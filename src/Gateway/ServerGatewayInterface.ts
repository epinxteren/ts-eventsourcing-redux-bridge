import { Observable } from 'rxjs';
import { SerializableAction } from '../Redux/SerializableAction';
import { ServerGatewayMessage } from './ValueObject/ServerGatewayMessage';

export interface ServerGatewayInterface<Metadata = {}> {
  emit(command: SerializableAction): Promise<void>;
  listen(): Observable<ServerGatewayMessage<Metadata>>;
  warnings(): Observable<Error>;
}
