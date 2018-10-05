
import { SerializableCommand } from '../EventSourcing/SerializableCommand';
import { SerializableAction } from '../Redux/SerializableAction';
import { Observable } from 'rxjs';
import { EntityMetadata } from '../Redux/EntityMetadata';

export interface ClientGatewayInterface {
  emit(command: SerializableCommand, metadata: EntityMetadata): Promise<void>;
  listen(): Observable<SerializableAction>;
}
