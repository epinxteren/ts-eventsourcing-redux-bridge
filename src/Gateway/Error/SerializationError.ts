export class SerializationError extends Error {
  public static actionCouldNotBeSerialized(event: any, error: Error) {
    return new this('Event could not be serialized', event, error);
  }

  public static commandCouldNotBeSerialized(command: any, error: Error) {
    return new this('Command could not be serialized', command, error);
  }

  constructor(message: string, public readonly object: unknown, public readonly orginalError?: Error) {
    super(message);
  }

}
