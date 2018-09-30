import 'jest';
import { SerializableStateRepository, SerializedStateData } from '../SerializableStateRepository';
import { SerializerInterface } from '../../../../Serializer';
import { BlobReadModel, InMemoryRepository, Repository } from 'ts-eventsourcing';
import { ScalarIdentity } from 'ts-eventsourcing/build/ValueObject/ScalarIdentity';
import { StateReadModel } from '../../Model/StateReadModel';

it('Should be able to save a model', async () => {
  const serializer: SerializerInterface = {
    serialize: jest.fn().mockReturnValue('serialized'),
    deserialize: jest.fn(),
  };
  const store: Repository<BlobReadModel<SerializedStateData>> = new InMemoryRepository();
  const repository = new SerializableStateRepository(store, serializer);
  const id = new ScalarIdentity(1);
  const state = { foo: 'bar' };
  await repository.save(new StateReadModel(id, state, 0));
  expect(serializer.serialize).toBeCalledWith(state);
  expect(await store.get(id)).toEqual(new BlobReadModel(id, {
    playhead: 0,
    serialized: 'serialized',
  }));
});

it('Should know it has a read model', async () => {
  const store: Repository<BlobReadModel<SerializedStateData>> = {
    has: jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
  } as any;
  const repository = new SerializableStateRepository(store, null as any);
  const id = new ScalarIdentity(1);
  expect(await repository.has(id)).toBeTruthy();
  expect(await repository.has(id)).toBeFalsy();
  expect(store.has).toBeCalledWith(id);
});

it('Should know how to get a read model', async () => {
  const serializer: SerializerInterface = {
    serialize: jest.fn(),
    deserialize: jest.fn().mockReturnValue('deSerialized'),
  };
  const id = new ScalarIdentity(1);
  const store: Repository<BlobReadModel<SerializedStateData>> = {
    get: jest.fn().mockResolvedValueOnce(new BlobReadModel(id, {
      serialized: 'dummy data',
      playhead: 10,
    })),
  } as any;
  const repository = new SerializableStateRepository(store, serializer);

  expect(await repository.get(id)).toEqual(new StateReadModel(id, 'deSerialized', 10));
  expect(store.get).toBeCalledWith(id);
});

it('Should know how to find a read model', async () => {
  const serializer: SerializerInterface = {
    serialize: jest.fn(),
    deserialize: jest.fn().mockReturnValue('deSerialized'),
  };
  const id = new ScalarIdentity(1);
  const store: Repository<BlobReadModel<SerializedStateData>> = {
    find: jest.fn().mockResolvedValueOnce(new BlobReadModel(id, {
      serialized: 'dummy data',
      playhead: 10,
    })),
  } as any;
  const repository = new SerializableStateRepository(store, serializer);

  expect(await repository.find(id)).toEqual(new StateReadModel(id, 'deSerialized', 10));
  expect(store.find).toBeCalledWith(id);
});

it('Should know how to find a read model that does not exists', async () => {
  const id = new ScalarIdentity(1);
  const store: Repository<BlobReadModel<SerializedStateData>> = {
    find: jest.fn().mockResolvedValueOnce(null),
  } as any;
  const repository = new SerializableStateRepository(store, null as any);
  expect(await repository.find(id)).toEqual(null);
  expect(store.find).toBeCalledWith(id);
});

it('Should be able to remove a readmodel', async () => {
  const id = new ScalarIdentity(1);
  const store: Repository<BlobReadModel<SerializedStateData>> = {
    remove: jest.fn().mockResolvedValueOnce(null),
  } as any;
  const repository = new SerializableStateRepository(store, null as any);
  await repository.remove(id);
  expect(store.remove).toBeCalledWith(id);
});
