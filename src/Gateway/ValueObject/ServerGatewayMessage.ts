import { SerializableCommand } from '../../EventSourcing/SerializableCommand';

export interface ServerGatewayMessage<Metadata = {}> {
  command: SerializableCommand;
  metadata: Metadata;
}
