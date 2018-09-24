import { StoreReadModel } from './Model/StoreReadModel';
import { Identity, Repository } from 'ts-eventsourcing';
import { SerializableAction } from '../../Redux/SerializableAction';

export interface StoreRepositoryInterface<State, Id extends Identity = Identity, Action extends SerializableAction = SerializableAction> extends Repository<StoreReadModel<State, Id, Action>> {

  create(id: Id): Promise<StoreReadModel<State, Id, Action>>;

}
