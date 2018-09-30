import 'jest';
import { StoreRepository } from '../StoreRepository';
import { StateReadModel } from '../../Model/StateReadModel';
import { StoreFactory } from '../../../../Redux/Store/StoreFactory';
import { Repository } from 'ts-eventsourcing';
import { ScalarIdentity } from 'ts-eventsourcing/build/ValueObject/ScalarIdentity';
import { StoreReadModel } from '../../Model/StoreReadModel';

it('Should be able to save a model', async () => {
  const store: Repository<StateReadModel<string>> = {
    save: jest.fn(),
  } as any;
  const repository = new StoreRepository(store, null as any);

  const id = ScalarIdentity.create(1);
  const storeReadModel: StoreReadModel<string> = {
    getId: () => id,
    getPlayhead: () => 2,
    getStore: jest.fn().mockReturnValue({
      getState: jest.fn().mockReturnValue('Some value'),
    }),
  } as any;
  await repository.save(storeReadModel);
  expect(store.save).toBeCalledWith(new StateReadModel(id, 'Some value', 2));
});

it('Should know it has a read model', async () => {
  const factory: StoreFactory<string> = {
    create: jest.fn(),
    createFromState: jest.fn(),
  } as any;
  const store: Repository<StateReadModel<string>> = {
    has: jest.fn((value: ScalarIdentity<number>) => {
      return value.getValue() === 1;
    }),
  } as any;
  const repository = new StoreRepository(store, factory);
  const id = ScalarIdentity.create(1);
  expect(await repository.has(id)).toBeTruthy();
  expect(await repository.has(ScalarIdentity.create(2))).toBeFalsy();
});

it('Should know how to get a read model', async () => {
  const factory: StoreFactory<string> = {
    create: jest.fn(),
    createFromState: jest.fn().mockReturnValue('dummy store'),
  } as any;
  const id = ScalarIdentity.create(1);
  const store: Repository<StateReadModel<string>> = {
    get: jest.fn().mockReturnValue(new StateReadModel(id, 'Some value', 2)),
  } as any;
  const repository = new StoreRepository(store, factory);
  expect(await repository.get(id)).toEqual(new StoreReadModel(id, 'dummy store' as any, 2));
  expect(factory.createFromState).toBeCalledWith('Some value');
});

it('Should be able to find a read model', async () => {
  const factory: StoreFactory<string> = {
    create: jest.fn(),
    createFromState: jest.fn().mockReturnValue('dummy store'),
  } as any;
  const id = ScalarIdentity.create(1);
  const store: Repository<StateReadModel<string>> = {
    find: jest.fn().mockReturnValue(new StateReadModel(id, 'Some value', 2)),
  } as any;
  const repository = new StoreRepository(store, factory);
  expect(await repository.find(id)).toEqual(new StoreReadModel(id, 'dummy store' as any, 2));
  expect(factory.createFromState).toBeCalledWith('Some value');
});

it('Should be able to find a read model that does not exists', async () => {
  const id = ScalarIdentity.create(1);
  const store: Repository<StateReadModel<string>> = {
    find: jest.fn().mockReturnValue(null),
  } as any;
  const repository = new StoreRepository(store, null as any);
  expect(await repository.find(id)).toEqual(null);
});

it('Should be able to remove a readmodel', async () => {
  const id = ScalarIdentity.create(1);
  const store: Repository<StateReadModel<string>> = {
    remove: jest.fn(),
  } as any;
  const repository = new StoreRepository(store, null as any);
  await repository.remove(id);
  expect(store.remove).toBeCalled();
});

it('Should be able to create a new readmodel', async () => {
  const factory: StoreFactory<string> = {
    create: jest.fn().mockReturnValue('the new store'),
  } as any;
  const store: Repository<StateReadModel<string>> = {
    has: jest.fn((value: ScalarIdentity<number>) => {
      return value.getValue() === 1;
    }),
  } as any;
  const repository = new StoreRepository(store, factory);
  const id = ScalarIdentity.create(1);
  expect(await repository.create(id)).toEqual(new StoreReadModel(id, 'the new store' as any, 0));
});
