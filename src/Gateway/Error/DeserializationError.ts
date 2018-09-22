
export class DeserializationError extends Error {

  public static eventCouldNotBeDeSerialized(event: any, error: Error) {
    return new this(`Event could not be de-serialized`, event, error);
  }

  public static commandCouldNotBeDeSerialized(command: any, error: Error) {
    return new this(`Command could not be de-serialized`, command, error);
  }

  constructor(message: string, public readonly json: unknown, public readonly orginalError?: Error) {
    super(message);
  }

}
