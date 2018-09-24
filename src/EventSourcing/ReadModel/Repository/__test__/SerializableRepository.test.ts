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
