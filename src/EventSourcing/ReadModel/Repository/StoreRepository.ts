import { StoreReadModel } from '../Model/StoreReadModel';
import { StoreRepositoryInterface } from '../StoreRepositoryInterface';
import { StoreFactory } from '../../../Redux/Store/StoreFactory';
import { Identity, Repository } from 'ts-eventsourcing';
import { StateReadModel } from '../Model/StateReadModel';
import { SerializableAction } from '../../../Redux/SerializableAction';

export class StoreRepository<S, A extends SerializableAction> implements StoreRepositoryInterface<S, A> {

  constructor(private readonly stateRepository: Repository<StateReadModel<S>>, private readonly storeFactory: StoreFactory<S, A>) {

  }

  public async create(id: Identity): Promise<StoreReadModel<S, A>> {
    return new StoreReadModel(id, this.storeFactory.create(), 0);
  }

  public save(model: StoreReadModel<S, A>): Promise<void> {
    return this.stateRepository.save(new StateReadModel<S>(
      model.getId(),
      model.getStore().getState(),
      model.getPlayhead()
    ));
  }

  public has(id: Identity): Promise<boolean> {
    return this.stateRepository.has(id);
  }

  public async get(id: Identity): Promise<StoreReadModel<S, A>> {
    const data = await this.stateRepository.get(id);
    return this.createStore(data, id);
  }

  public async find(id: Identity): Promise<null | StoreReadModel<S, A>> {
    const data = await this.stateRepository.find(id);
    if (data === null) {
      return null;
    }
    return this.createStore(data, id);
  }

  public remove(id: Identity): Promise<void> {
    return this.stateRepository.remove(id);
  }

  private createStore(data: StateReadModel<S>, id: Identity) {
    const store = this.storeFactory.createFromState(data.getState() as any);
    return new StoreReadModel(id, store, data.getPlayhead());
  }

}
