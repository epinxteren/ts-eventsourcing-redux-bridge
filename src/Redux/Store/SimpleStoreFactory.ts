import { createStore, DeepPartial, Reducer, Store } from 'redux';
import { StoreFactory } from './StoreFactory';
import { SerializableAction } from '../SerializableAction';

export class SimpleStoreFactory<S, A extends SerializableAction> implements StoreFactory<S, A> {

  constructor(
    private readonly reducers: Reducer<S, A>) {
  }

  public create(): Store<S, A> {
    return createStore(this.reducers);
  }

  public createFromState(state: DeepPartial<S>): Store<S, A> {
    return createStore(this.reducers, state);
  }

}
