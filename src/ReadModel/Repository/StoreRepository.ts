import { StoreReadModel } from '../Model/StoreReadModel';
import { StoreRepositoryInterface } from '../StoreRepositoryInterface';
import { StoreFactory } from '../../Redux/Store/StoreFactory';
import { StateReadModel } from '../Model/StateReadModel';
import { Repository } from 'ts-eventsourcing/ReadModel/Repository';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';
import { ReadModelAction, ReadModelMetadata } from '../ReadModelAction';

export class StoreRepository<
  State,
  Id extends Identity = Identity,
  Metadata extends ReadModelMetadata<Id> = ReadModelMetadata<Id>,
  Action extends ReadModelAction<Id, Metadata> = ReadModelAction<Id, Metadata>> implements StoreRepositoryInterface<State, Id, Metadata, Action> {

  constructor(private readonly stateRepository: Repository<StateReadModel<State, Id>>, private readonly storeFactory: StoreFactory<State, Action>) {

  }

  public async create(id: Id): Promise<StoreReadModel<State, Id, Metadata, Action>> {
    return new StoreReadModel<State, Id, Metadata, Action>(id, this.storeFactory.create(), 0);
  }

  public save(model: StoreReadModel<State, Id, Metadata, Action>): Promise<void> {
    return this.stateRepository.save(new StateReadModel<State, Id>(
      model.getId(),
      model.getStore().getState(),
      model.getPlayhead(),
    ));
  }

  public has(id: Id): Promise<boolean> {
    return this.stateRepository.has(id);
  }

  public async get(id: Id): Promise<StoreReadModel<State, Id, Metadata, Action>> {
    const data = await this.stateRepository.get(id);
    return this.createStore(data, id);
  }

  public async find(id: Id): Promise<null | StoreReadModel<State, Id, Metadata, Action>> {
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
    return new StoreReadModel<State, Id, Metadata, Action>(id, store, data.getPlayhead());
  }

}
