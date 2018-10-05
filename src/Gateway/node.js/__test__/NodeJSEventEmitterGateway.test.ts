import { NodeJSEventEmitterGateway } from '../NodeJSEventEmitterGateway';
import { SerializableCommand } from '../../../EventSourcing/SerializableCommand';
import { SerializerInterface } from '../../../Serializer/SerializerInterface';
import { SerializationError } from '../../Error/SerializationError';
import { MalformedSerializableActionError } from '../../Error/MalformedSerializableActionError';
import { DeserializationError } from '../../Error/DeserializationError';
import { MalformedSerializableCommandError } from '../../Error/MalformedSerializableCommandError';

class DoSomethingCommand extends SerializableCommand {

}

it('Should be able to listen', () => {
  const emitter: NodeJS.EventEmitter | any = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    deserialize: jest.fn((value) => value),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, serializer);
  const observable = gateway.listen();
  const valueSpy = jest.fn();
  const errorSpy = jest.fn();
  observable.subscribe(valueSpy, errorSpy);
  expect(emitter.addListener.mock.calls[0][0]).toEqual('command');
  const command = new DoSomethingCommand();
  emitter.addListener.mock.calls[0][1](command);

  expect(valueSpy).toBeCalledWith(command);
});

it('Should be able to handle warnings', () => {
  const emitter: NodeJS.EventEmitter | any = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    deserialize: jest.fn((value) => value),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, serializer);
  const observable = gateway.listen();
  const valueSpy = jest.fn();
  const errorSpy = jest.fn();
  observable.subscribe(valueSpy, errorSpy);
  gateway.warnings().subscribe(errorSpy);

  expect(emitter.addListener.mock.calls[0][0]).toEqual('command');
  emitter.addListener.mock.calls[0][1]('invalid command');
  expect(valueSpy).not.toBeCalled();
  expect(errorSpy).toBeCalledWith(MalformedSerializableCommandError.notASerializableCommand('invalid command'));
});

it('Should be able to handle errors and send data', () => {
  const emitter: NodeJS.EventEmitter | any = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    deserialize: jest.fn(() => {
      throw new Error('serialize error');
    }),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, serializer);
  const observable = gateway.listen();
  const valueSpy = jest.fn();
  const errorSpy = jest.fn();
  observable.subscribe(valueSpy, errorSpy);
  gateway.warnings().subscribe(errorSpy);

  emitter.addListener.mock.calls[0][1]('The command');

  expect(errorSpy).toBeCalledWith(DeserializationError.commandCouldNotBeDeSerialized(
    'The command',
    new Error('serialize error'),
  ));
});

it('Can emit an action', async () => {
  const emitter: NodeJS.EventEmitter | any = {
    emit: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    serialize: jest.fn(() => 'serialized'),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, serializer);
  const action = {
    type: 'Test action',
    metadata: {
      entity: 'PRODUCTS',
      playhead: 1,
    },
  };
  await gateway.emit(action);
  expect(serializer.serialize).toBeCalledWith(action);
  expect(emitter.emit).toBeCalledWith('action', 'serialized');
});

it('Should catch serialize error', async () => {
  const emitter: NodeJS.EventEmitter | any = {
    emit: jest.fn(),
  };
  const serializer: SerializerInterface | any = {
    serialize:  jest.fn(() => {
      throw new Error('serialize error');
    }),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, serializer);
  const action = {
    type: 'Test action',
    metadata: {
      entity: 'PRODUCTS',
      playhead: 1,
    },
  };
  await expect(gateway.emit(action)).rejects.toEqual(SerializationError.actionCouldNotBeSerialized(action,  new Error('serialize error')));
  expect(serializer.serialize).toBeCalledWith(action);
});

it('Can only emit valid actions', async () => {
  const emitter: NodeJS.EventEmitter | any = {
    emit: jest.fn(),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, null as any);
  await expect(gateway.emit('not an action' as any)).rejects.toEqual(MalformedSerializableActionError.notASerializableAction('not an action'));
});

it('Should be able to remove listener', async () => {
  const spy = jest.fn();
  const emitter: NodeJS.EventEmitter | any = {
    addListener: jest.fn(() => spy('add')),
    removeListener: jest.fn(() => spy('remove')),
  };
  const gateway = new NodeJSEventEmitterGateway(emitter, null as any);
  gateway.listen().subscribe().unsubscribe();

  expect(emitter.addListener.mock.calls[0][0]).toEqual('command');
  expect(emitter.removeListener.mock.calls[0][0]).toEqual('command');
  expect(emitter.removeListener.mock.calls[0][1]).toBe(emitter.addListener.mock.calls[0][1]);

  expect(spy.mock.calls).toEqual([['add'], ['remove']]);
});
