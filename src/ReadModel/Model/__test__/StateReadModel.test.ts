import { StateReadModel } from '../StateReadModel';
import { ScalarIdentity } from 'ts-eventsourcing/ValueObject/ScalarIdentity';

it('Can create a StateReadModel', () => {
  const model = new StateReadModel(ScalarIdentity.create(1), 'test', 0);
  expect(model.getPlayhead()).toEqual(0);
  expect(model.getState()).toEqual('test');
  expect(model.getId().getValue()).toEqual(1);
});
