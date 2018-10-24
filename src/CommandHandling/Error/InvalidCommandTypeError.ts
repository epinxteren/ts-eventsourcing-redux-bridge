import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { CommandConstructor } from 'ts-eventsourcing/CommandHandling/Command';

export class InvalidCommandTypeError extends Error {

  public static actionIsNotAnCommandAction() {
    return new this('Action is not a command action');
  }

  public static doesNotMatchCommand(command: any, Command: CommandConstructor) {
    return new this(`Command ${ClassUtil.nameOffInstance(command)} is not an instance of ${ClassUtil.nameOffConstructor(Command)}`);
  }

}
