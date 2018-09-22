import { SerializableCommand } from '../../EventSourcing/SerializableCommand';
import { CommandAction } from '../CommandAction';
import { typeWithEntityFactory } from '../EntityMetadata';

/**
 * Return action for sending the command.
 *
 * The action will be picked up by the middleware {@see commandMiddleware}
 */
export const COMMAND_TRANSMITTING = typeWithEntityFactory('command transmitted');

/**
 * The command is transmitted successfully.
 *
 * This will **not** say the command is handled successfully!.
 */
export const COMMAND_TRANSMITTED_SUCCESSFULLY = typeWithEntityFactory('command transmitted successfully');

/**
 * The command transmission failed.
 */
export const COMMAND_TRANSMISSION_FAILED = typeWithEntityFactory('command transmission failed');

/**
 * The command failed.
 */
export const COMMAND_FAILED = typeWithEntityFactory('command handling failed');

/**
 * The command succeeded.
 */
export const COMMAND_SUCCEEDED = typeWithEntityFactory('command handling succeeded');

/**
 * Send an command.
 *
 * Will be picked up by the {@see commandMiddleware}
 *
 * @example
 *
 * sendCommand(new ByeProduct(...), 'BUY PRODUCT')
 */
export function sendCommand(command: SerializableCommand, entity: string, metadata: { [key: string]: any } = {}): CommandAction {
  return {
    type: COMMAND_TRANSMITTING(entity),
    command,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

export function commandTransmittedSuccessfully(command: SerializableCommand, entity: string, metadata: { [key: string]: any } = {}): CommandAction {
  return {
    type: COMMAND_TRANSMITTED_SUCCESSFULLY(entity),
    command,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

export function commandTransmissionFailed(command: SerializableCommand, entity: string, metadata: { [key: string]: any } = {}): CommandAction {
  return {
    type: COMMAND_TRANSMISSION_FAILED(entity),
    command,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

export function commandHandledSuccessfully(command: SerializableCommand, entity: string, metadata: { [key: string]: any } = {}): CommandAction {
  return {
    type: COMMAND_SUCCEEDED(entity),
    command,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

export function commandHandledFailed(command: SerializableCommand, entity: string, metadata: { [key: string]: any } = {}): CommandAction {
  return {
    type: COMMAND_FAILED(entity),
    command,
    metadata: {
      entity,
      ...metadata,
    },
  };
}
