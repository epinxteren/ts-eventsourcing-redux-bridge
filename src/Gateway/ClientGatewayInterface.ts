import { SerializableCommand } from '../EventSourcing';
import { Observable } from 'rxjs';
import { SerializableAction } from '../Redux';

export interface ClientGatewayInterface {
  emit(command: SerializableCommand): Promise<void>;
  listen(): Observable<SerializableAction>;
  warnings(): Observable<Error>;
}
