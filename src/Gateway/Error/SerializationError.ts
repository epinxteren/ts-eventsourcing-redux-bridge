import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { SerializableQuery } from '../../QueryHandling/SerializableQuery';
import { SerializableCommand } from '../../CommandHandling/SerializableCommand';

export class SerializationError extends Error {
  public static actionCouldNotBeSerialized(event: any, error: Error) {
    return new this('Event could not be serialized', event, error);
  }

  public static commandCouldNotBeSerialized(command: any, error: Error) {
    return new this(`Command could not be serialized ${ClassUtil.nameOffInstance(command)}`, command, error);
  }

  public static queryCouldNotBeSerialized(query: any, error: Error) {
    return new this(`Query could not be serialized ${ClassUtil.nameOffInstance(query)}`, error);
  }

  public static couldNotBeSerialized(serializable: SerializableCommand | SerializableQuery) {
    return new this(`Object ${ClassUtil.nameOffInstance(serializable)} is not serializable`, serializable);
  }

  constructor(message: string, public readonly object: unknown, public readonly orginalError?: Error) {
    super(message);
  }

}
