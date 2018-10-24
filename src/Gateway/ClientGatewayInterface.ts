
import { SerializableCommand } from '../CommandHandling/SerializableCommand';
import { SerializableAction } from '../Redux/SerializableAction';
import { Observable } from 'rxjs';
import { EntityMetadata } from '../Redux/EntityMetadata';

export interface ClientGatewayInterface {
  emit(command: SerializableCommand, metadata: EntityMetadata): Promise<void>;

  /**
   * Resolved promise means the client is connected.
   */
  listen(): Promise<Observable<SerializableAction>>;
}
