
import { SerializableCommand } from '../EventSourcing/SerializableCommand';
import { SerializableAction } from '../Redux/SerializableAction';
import { Observable } from 'rxjs';

export interface ClientGatewayInterface {
  emit(command: SerializableCommand): Promise<void>;
  listen(): Observable<SerializableAction>;
}
