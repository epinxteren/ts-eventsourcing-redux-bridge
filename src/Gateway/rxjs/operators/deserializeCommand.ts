import { map } from 'rxjs/operators';
import { DeserializationError } from '../../Error/DeserializationError';
import { Observable } from 'rxjs';
import { SerializerInterface } from '../../../Serializer/SerializerInterface';
import { SerializableCommand } from '../../../EventSourcing/SerializableCommand';
import { MalformedSerializableCommandError } from '../../Error/MalformedSerializableCommandError';

export function deserializeCommand(serializer: SerializerInterface) {
  return (input: Observable<string>): Observable<SerializableCommand> => {
    return input
      .pipe(
        map((json) => {
          let command: unknown;
          try {
            command = serializer.deserialize(json);
          } catch (e) {
            throw DeserializationError.commandCouldNotBeDeSerialized(json, e);
          }
          // First line of defence, we know we only can only send SerializableCommands.
          if (SerializableCommand.isSerializableCommand(command)) {
            return command;
          }
          throw MalformedSerializableCommandError.notASerializableCommand(command);
        }),
      );
  };
}
