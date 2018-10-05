import { EntityMetadata, hasEntityMetadata } from './EntityMetadata';
import { SerializableCommand } from '../EventSourcing/SerializableCommand';
import { COMMAND_TRANSMITTING } from './Action/commandActions';

export interface CommandAction<T extends SerializableCommand = SerializableCommand, Metadata = {}> {
  type: string;
  metadata: EntityMetadata & Metadata;
  command: T;
}

export function isCommandAction(action: any): action is CommandAction {
  return action &&
    hasEntityMetadata(action) &&
    COMMAND_TRANSMITTING(action.metadata.entity) === action.type &&
    SerializableCommand.isSerializableCommand(action.command);
}
