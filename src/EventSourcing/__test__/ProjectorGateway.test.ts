import { ProjectorGateway } from '../ProjectorGateway';
import { StoreReadModel } from '../ReadModel/Model/StoreReadModel';
import { SerializableAction } from '../../Redux/SerializableAction';
import { StoreRepositoryInterface } from '../ReadModel/StoreRepositoryInterface';
import { ScalarIdentity } from 'ts-eventsourcing/ValueObject/ScalarIdentity';
import { DomainEvent } from 'ts-eventsourcing/Domain/DomainEvent';
import { ServerGatewayInterface } from '../../Gateway/ServerGatewayInterface';
import { DomainMessage } from 'ts-eventsourcing/Domain/DomainMessage';

describe('createDomainEventMetadata', () => {
  it('Can create createDomainEventMetadata', () => {
    const gateway = new ProjectorGateway(null as any, null as any, 'PRODUCTS');
    const model: StoreReadModel<{}, ScalarIdentity<number>, SerializableAction> | any = {
      getPlayhead: jest.fn().mockReturnValue(1),
      getId: jest.fn().mockReturnValue(ScalarIdentity.create(10)),
    };
    const recordedOn = new Date();
    const message: DomainMessage<DomainEvent, ScalarIdentity<number>> | any = {
      recordedOn,
    };
    const metadata = gateway.createDomainEventMetadata(model, message);
    expect(metadata).toEqual({
      entity: 'PRODUCTS',
      aggregateId: ScalarIdentity.create(10),
      playhead: 2,
      recordedOn,
    });
  });

  it('Can create createDomainEventMetadata with custom metadata', () => {
    const gateway = new ProjectorGateway(null as any, null as any, 'USERS');
    const model: StoreReadModel<{}, ScalarIdentity<number>, SerializableAction> | any = {
      getPlayhead: jest.fn().mockReturnValue(3),
      getId: jest.fn().mockReturnValue(ScalarIdentity.create(12)),
    };
    const recordedOn = new Date();
    const message: DomainMessage<DomainEvent, ScalarIdentity<number>> | any = {
      recordedOn,
    };
    const metadata = gateway.createDomainEventMetadata(model, message, { foo: 'bar' });
    expect(metadata).toEqual({
      entity: 'USERS',
      aggregateId: ScalarIdentity.create(12),
      playhead: 4,
      recordedOn,
      foo: 'bar',
    });
  });

  it('Can create createDomainEventMetadata with custom entity name', () => {
    const gateway = new ProjectorGateway(null as any, null as any, 'DEFAULT ENTITY NAME');
    const model: StoreReadModel<{}, ScalarIdentity<number>, SerializableAction> | any = {
      getPlayhead: jest.fn().mockReturnValue(324),
      getId: jest.fn().mockReturnValue(ScalarIdentity.create(99)),
    };
    const recordedOn = new Date();
    const message: DomainMessage<DomainEvent, ScalarIdentity<number>> | any = {
      recordedOn,
    };
    const metadata = gateway.createDomainEventMetadata(model, message, { entity: 'USERS' });
    expect(metadata).toEqual({
      entity: 'USERS',
      aggregateId: ScalarIdentity.create(99),
      playhead: 325,
      recordedOn,
    });
  });
});

describe('dispatchAndSaveMessage', () => {
  it('With default metadata', async () => {

    const order = jest.fn().mockResolvedValue(undefined);

    const repository: StoreRepositoryInterface<{}, ScalarIdentity<number>, SerializableAction> = {
      save: jest.fn(() => order('repository')),
    } as any;
    const serverGateway: ServerGatewayInterface = {
      emit: jest.fn(() => order('gateway')),
    } as any;
    const gateway = new ProjectorGateway(repository, serverGateway, 'test');
    const mockStore = {
      dispatch: jest.fn(() => order('store')),
    };
    const identity = ScalarIdentity.create<number, ScalarIdentity<number>>(1);
    const model = new StoreReadModel(identity, mockStore as any, 12);
    const recordedOn = new Date();
    const message = new DomainMessage(identity, 12, 'my message', recordedOn);
    const action = await gateway.dispatchAndSaveMessage(model, message);

    expect(mockStore.dispatch).toBeCalledWith(action);
    expect(repository.save).toBeCalledWith(model.withIncreasedPlayhead());
    expect(serverGateway.emit).toBeCalledWith(action);
    expect(order.mock.calls.map((call) => call[0])).toEqual([
      'store',
      'repository',
      'gateway',
    ]);
  });

  it('Should reject when repository.save fails', async () => {
    const repository: StoreRepositoryInterface<{}, ScalarIdentity<number>, SerializableAction> = {
      save: jest.fn().mockRejectedValueOnce('random error'),
    } as any;
    const gateway = new ProjectorGateway(repository, undefined as any, 'test');
    const mockStore = {
      dispatch: jest.fn(),
    };
    const identity = ScalarIdentity.create<number, ScalarIdentity<number>>(1);
    const model = new StoreReadModel(identity, mockStore as any, 12);
    const recordedOn = new Date();
    const message = new DomainMessage(identity, 12, 'my message', recordedOn);
    await expect(gateway.dispatchAndSaveMessage(model, message)).rejects.toEqual('random error');
    expect(mockStore.dispatch).toBeCalled();
    expect(repository.save).toBeCalled();
  });
});
