import { SerializableCommand } from '../EventSourcing/SerializableCommand';
import { Observable } from 'rxjs';
import { SerializableAction } from '../Redux/SerializableAction';

export interface ClientGatewayInterface {
  emit(command: SerializableCommand): Promise<void>;
  listen(): Observable<SerializableAction>;
}
