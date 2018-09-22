import { StoreReadModel } from './Model/StoreReadModel';
import { Identity, Repository } from 'ts-eventsourcing';
import { SerializableAction } from '../../Redux/SerializableAction';

export interface StoreRepositoryInterface<S, A extends SerializableAction> extends Repository<StoreReadModel<S, A>> {

  create(id: Identity): Promise<StoreReadModel<S, A>>;

}
