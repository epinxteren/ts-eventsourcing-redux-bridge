import { EntityMetadata } from './EntityMetadata';
import { SerializableCommand } from '../EventSourcing/SerializableCommand';

export interface CommandAction<T extends SerializableCommand = SerializableCommand, Metadata = {}> {
  type: string;
  metadata: EntityMetadata & Metadata;
  command: T;
}

export function isCommandAction(action: any): action is CommandAction {
  return action &&
    typeof action === 'object' &&
    SerializableCommand.isSerializableCommand(action.command) &&
    typeof action.metadata === 'object' &&
    typeof action.type === 'string';
}
