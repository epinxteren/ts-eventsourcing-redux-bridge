import { createStore, DeepPartial, Reducer, Store, StoreEnhancer } from 'redux';
import { StoreFactory } from './StoreFactory';
import { SerializableAction } from '../SerializableAction';

export class SimpleStoreFactory<S, A extends SerializableAction> implements StoreFactory<S, A> {

  constructor(
    private readonly reducers: Reducer<S, A>) {
  }

  public create(enhancer?: StoreEnhancer): Store<S, A> {
    return createStore(this.reducers, enhancer);
  }

  public createFromState(state: DeepPartial<S>, enhancer?: StoreEnhancer): Store<S, A> {
    return createStore(this.reducers, state, enhancer as any);
  }

}
