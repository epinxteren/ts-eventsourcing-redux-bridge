import { SerializableCommand } from '../../CommandHandling/SerializableCommand';
import { ServerGatewayInterface } from '../ServerGatewayInterface';
import { ServerGatewayMetadata } from './ServerGatewayMetadata';

export interface ServerGatewayMessage<Metadata extends ServerGatewayMetadata<ServerGatewayInterface<Metadata>>> {
  command: SerializableCommand;
  metadata: Metadata;
}
