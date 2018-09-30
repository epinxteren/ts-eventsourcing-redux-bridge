import { Command } from 'ts-eventsourcing';

/**
 * Marker class that a command is serializable.
 */
export abstract class SerializableCommand implements Command {

  /**
   * If the given command is an valid serializable command.
   */
  public static isSerializableCommand(command: unknown): command is SerializableCommand {
    return command instanceof this;
  }

}
