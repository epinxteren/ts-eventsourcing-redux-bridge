import { StoreReadModel } from './Model/StoreReadModel';
import { SerializableAction } from '../../Redux/SerializableAction';
import { Repository } from 'ts-eventsourcing/ReadModel/Repository';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';

export interface StoreRepositoryInterface<State, Id extends Identity = Identity, Action extends SerializableAction = SerializableAction> extends Repository<StoreReadModel<State, Id, Action>> {

  create(id: Id): Promise<StoreReadModel<State, Id, Action>>;

}
