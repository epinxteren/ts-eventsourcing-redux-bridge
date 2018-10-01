import { StoreReadModel } from '../Model/StoreReadModel';
import { StoreRepositoryInterface } from '../StoreRepositoryInterface';
import { StoreFactory } from '../../../Redux/Store/StoreFactory';
import { StateReadModel } from '../Model/StateReadModel';
import { SerializableAction } from '../../../Redux/SerializableAction';
import { Repository } from 'ts-eventsourcing/ReadModel/Repository';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';

export class StoreRepository<State, Id extends Identity, Action extends SerializableAction> implements StoreRepositoryInterface<State, Id, Action> {

  constructor(private readonly stateRepository: Repository<StateReadModel<State, Id>>, private readonly storeFactory: StoreFactory<State, Action>) {

  }

  public async create(id: Id): Promise<StoreReadModel<State, Id, Action>> {
    return new StoreReadModel<State, Id, Action>(id, this.storeFactory.create(), 0);
  }

  public save(model: StoreReadModel<State, Id, Action>): Promise<void> {
    return this.stateRepository.save(new StateReadModel<State, Id>(
      model.getId(),
      model.getStore().getState(),
      model.getPlayhead(),
    ));
  }

  public has(id: Id): Promise<boolean> {
    return this.stateRepository.has(id);
  }

  public async get(id: Id): Promise<StoreReadModel<State, Id, Action>> {
    const data = await this.stateRepository.get(id);
    return this.createStore(data, id);
  }

  public async find(id: Id): Promise<null | StoreReadModel<State, Id, Action>> {
    const data = await this.stateRepository.find(id);
    if (data === null) {
      return null;
    }
    return this.createStore(data, id);
  }

  public remove(id: Identity): Promise<void> {
    return this.stateRepository.remove(id);
  }

  private createStore(data: StateReadModel<State, Id>, id: Id) {
    const store = this.storeFactory.createFromState(data.getState() as any);
    return new StoreReadModel(id, store, data.getPlayhead());
  }

}
