import { EntityMetadata, hasEntityMetadata, matchActionTypeEntity } from '../Redux/EntityMetadata';
import { SerializableCommand } from './SerializableCommand';

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
