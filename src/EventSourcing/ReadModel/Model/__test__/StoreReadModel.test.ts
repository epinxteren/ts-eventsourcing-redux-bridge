import { ScalarIdentity } from 'ts-eventsourcing/build/ValueObject/ScalarIdentity';
import { StoreReadModel } from '../StoreReadModel';
import { Store } from 'redux';
import { SerializableAction } from '../../../../Redux/SerializableAction';

it('Can create a StoreReadModel', () => {

  const store: Store<string, SerializableAction> = {} as any;

  const model = new StoreReadModel(ScalarIdentity.create(1), store, 0);
  expect(model.getPlayhead()).toEqual(0);
  expect(model.getStore()).toEqual(store);
  expect(model.getId().getValue()).toEqual(1);
});

it('Can increase StoreReadModel playhead', () => {
  const store: Store<string, SerializableAction> = {} as any;
  const model = new StoreReadModel(ScalarIdentity.create(1), store, 77);
  expect(model.withIncreasedPlayhead().getPlayhead()).toEqual(78);
});
