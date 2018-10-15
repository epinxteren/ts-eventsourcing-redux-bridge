import { EntityMetadata, hasEntityMetadata } from './EntityMetadata';
import { SerializableCommand } from '../EventSourcing/SerializableCommand';

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
  return isCommandAction(action) && action.type === type(action.metadata.entity);
}
