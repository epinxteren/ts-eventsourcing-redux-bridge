import { SerializableCommand } from '../EventSourcing/SerializableCommand';
import { Observable } from 'rxjs';
import { SerializableAction } from '../Redux/SerializableAction';

export interface ServerGatewayInterface {
  emit(command: SerializableAction): Promise<void>;
  listen(): Observable<SerializableCommand>;
  warnings(): Observable<Error>;
}
