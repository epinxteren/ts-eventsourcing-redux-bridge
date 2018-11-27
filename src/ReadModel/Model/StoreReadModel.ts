import { Store } from 'redux';
import { ReadModel } from 'ts-eventsourcing/ReadModel/ReadModel';
import { Playhead } from '../../ValueObject/Playhead';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';
import { asReadModelAction, ReadModelAction, ReadModelMetadata } from '../ReadModelAction';
import { ActionStream } from '../ActionStream';
import { SimpleActionStream } from '../SimpleActionStream';

export class StoreReadModel<State,
  Id extends Identity = Identity,
  Metadata extends ReadModelMetadata<Id> = ReadModelMetadata<Id>,
  Action extends ReadModelAction<Id, Metadata> = ReadModelAction<Id, Metadata>> implements ReadModel {

  private uncommittedActions: Action[] = [];

  constructor(private readonly id: Id,
              private readonly store: Store<State, Action>,
              private lastPlayhead: Playhead) {
    const dispatch = this.store.dispatch;
    store.dispatch = (action) => {
      const readModelAction = asReadModelAction<Id, Metadata>(action) as Action;
      this.lastPlayhead = this.lastPlayhead + 1;
      readModelAction.metadata.playhead = this.lastPlayhead;
      const state = store.getState();
      const result = dispatch.call(store, action);
      const newState = store.getState();
      if (state === newState) {
        return result;
      }
      this.uncommittedActions.push(readModelAction);
      return result;
    };
  }

  public getId(): Id {
    return this.id;
  }

  public getStore(): Store<State, Action> {
    return this.store;
  }

  public getPlayhead(): Playhead {
    return this.lastPlayhead;
  }

  public getUncommittedActions(): ActionStream<Action> {
    const stream = SimpleActionStream.of(this.uncommittedActions);
    this.uncommittedActions = [];
    return stream;
  }

}
