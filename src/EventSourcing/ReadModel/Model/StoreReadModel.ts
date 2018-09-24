import { Identity, ReadModel } from 'ts-eventsourcing';
import { SerializableAction } from '../../../Redux/SerializableAction';
import { Store } from 'redux';
import { Playhead } from '../../../ValueObject/Playhead';

export class StoreReadModel<State, Id extends Identity, Action extends SerializableAction> implements ReadModel {

  constructor(private readonly id: Id,
              private readonly store: Store<State, Action>,
              private readonly playhead: Playhead) {

  }

  public getId(): Id {
    return this.id;
  }

  public getStore(): Store<State, Action> {
    return this.store;
  }

  public getPlayhead(): Playhead {
    return this.playhead;
  }
}
