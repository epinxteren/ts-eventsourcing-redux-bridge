import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { ServerGatewayMessage } from '../../Gateway/ValueObject/ServerGatewayMessage';
import { ServerGatewayMetadata } from '../../Gateway/ValueObject/ServerGatewayMetadata';

export class MissingEntityMetadataError extends Error {

  public static forGatewayMessage(message: ServerGatewayMessage<ServerGatewayMetadata<any>>) {
    return new this(`Gateway message ${ClassUtil.nameOffInstance(message.command)} is missing entity name`);
  }

}
