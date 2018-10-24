import { EntityMetadata, hasEntityMetadata, matchActionTypeEntity } from '../Redux/EntityMetadata';
import { SerializableCommand } from './SerializableCommand';
import { InvalidCommandTypeError } from './Error/InvalidCommandTypeError';
import { CommandConstructor } from 'ts-eventsourcing/CommandHandling/Command';

export interface CommandAction<T extends SerializableCommand = SerializableCommand, Metadata = {}> {
  type: string;
  metadata: EntityMetadata & Metadata;
  command: T;
}

export function isCommandAction(action: any): action is CommandAction {
  return action &&
    hasEntityMetadata(action) &&
    SerializableCommand.isSerializableCommand(action.command);
}

export function isCommandActionOfType(action: any, type: (entity: string) => string): action is CommandAction {
  return isCommandAction(action) && matchActionTypeEntity(action, type);
}

export function asCommandAction<T extends SerializableCommand = SerializableCommand, Metadata = {}>(
  action: any,
  Command: CommandConstructor<T>,
): CommandAction<T, Metadata> {
  if (!isCommandAction(action)) {
    throw InvalidCommandTypeError.actionIsNotAnCommandAction();
  }
  if (!(action.command instanceof Command)) {
    throw InvalidCommandTypeError.doesNotMatchCommand(action.command, Command);
  }
  return action as any;
}
