import { ClientSocketIOGateway } from '../ClientSocketIOGateway';
import { SerializerInterface } from '../../../Serializer';
import { SerializableAction } from '../../../Redux/SerializableAction';
import {
  DeserializationError,
  MalformedSerializableActionError,
  MalformedSerializableCommandError,
  SerializationError,
} from '../../Error';
import { SerializableCommand } from '../../../EventSourcing/SerializableCommand';

class DoSomethingCommand extends SerializableCommand {

}

it('Should be able to listen to actions', () => {

  const emitter: SocketIOClient.Emitter | any = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  const action: SerializableAction = {
    type: 'hi',
    metadata: {
      playhead: 1,
      entity: 'PRODUCTS',
    },
  };

  const serializer: SerializerInterface | any = {
    deserialize: jest.fn().mockReturnValue(action),
  };

  const gateway = new ClientSocketIOGateway(emitter, serializer);
  const valueSpy = jest.fn();
  gateway.listen().subscribe(valueSpy);

  expect(emitter.addEventListener.mock.calls[0][0]).toEqual('action');
  emitter.addEventListener.mock.calls[0][1]('serialized action');

  expect(serializer.deserialize).toBeCalledWith('serialized action');

  expect(valueSpy).toBeCalledWith(action);

});

it('Should be able to listen to errors', () => {
  const emitter: SocketIOClient.Emitter | any = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  const serializer: SerializerInterface | any = {
    deserialize: jest.fn(() => {
      throw new Error('serialisation error');
    }),
  };

  const gateway = new ClientSocketIOGateway(emitter, serializer);
  const valueSpy = jest.fn();
  gateway.listen().subscribe(valueSpy);
  const errorSpy = jest.fn();
  gateway.warnings().subscribe(errorSpy);

  emitter.addEventListener.mock.calls[0][1]('serialized action');

  expect(serializer.deserialize).toBeCalledWith('serialized action');
  expect(errorSpy).toBeCalledWith(DeserializationError.eventCouldNotBeDeSerialized('serialized action', new Error('serialisation error')));

  serializer.deserialize = jest.fn().mockReturnValue('Invalid action');
  emitter.addEventListener.mock.calls[0][1]('serialized action');

  expect(errorSpy).toBeCalledWith(MalformedSerializableActionError.notASerializableAction('Invalid action'));
});

it('Should be able to remove listener', async () => {
  const spy = jest.fn();
  const emitter: SocketIOClient.Emitter | any = {
    addEventListener: jest.fn(() => spy('add')),
    removeEventListener: jest.fn(() => spy('remove')),
  };
  const gateway = new ClientSocketIOGateway(emitter, null as any);
  gateway.listen().subscribe().unsubscribe();

  expect(emitter.addEventListener.mock.calls[0][0]).toEqual('action');
  expect(emitter.removeEventListener.mock.calls[0][0]).toEqual('action');
  expect(emitter.removeEventListener.mock.calls[0][1]).toBe(emitter.removeEventListener.mock.calls[0][1]);

  expect(spy.mock.calls).toEqual([['add'], ['remove']]);
});

it('Should be able to emit commands', async () => {
  const emitter: SocketIOClient.Emitter | any = {
    emit: jest.fn(),
  };

  const serializer: SerializerInterface | any = {
    serialize: jest.fn().mockReturnValue('serialized'),
  };
  const gateway = new ClientSocketIOGateway(emitter, serializer);
  const command = new DoSomethingCommand();
  await gateway.emit(command);
  expect(emitter.emit).toBeCalledWith('command', 'serialized');
  expect(serializer.serialize).toBeCalledWith(command);
});

it('Should handle serialize errors', async () => {
  const emitter: SocketIOClient.Emitter | any = {
    emit: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    serialize: jest.fn(() => {
      throw new Error('Serialize error');
    }),
  };
  const gateway = new ClientSocketIOGateway(emitter, serializer);
  const command = new DoSomethingCommand();
  await expect(gateway.emit(command)).rejects.toEqual(SerializationError.commandCouldNotBeSerialized(command, new Error('Serialize error')));
  expect(serializer.serialize).toBeCalledWith(command);
});

it('Can only emit valid commands', async () => {
  const emitter: SocketIOClient.Emitter | any = {
    emit: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    serialize: jest.fn(() => {
      throw new Error('Serialize error');
    }),
  };
  const gateway = new ClientSocketIOGateway(emitter, serializer);
  await expect(gateway.emit('something')).rejects.toEqual(MalformedSerializableCommandError.notASerializableCommand('something'));
});
