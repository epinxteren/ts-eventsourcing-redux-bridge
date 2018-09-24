import { DeepPartial, Store, StoreEnhancer } from 'redux';
import { SerializableAction } from '../SerializableAction';

export interface StoreFactory<S, A extends SerializableAction = SerializableAction> {

  create(enhancer?: StoreEnhancer): Store<S, A>;

  createFromState(state: DeepPartial<S>, enhancer?: StoreEnhancer): Store<S, A>;

}
