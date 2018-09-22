import { Identity, ReadModel } from 'ts-eventsourcing';
import { SerializableAction } from '../../../Redux/SerializableAction';
import { Store } from 'redux';
import { Playhead } from '../../../Value/Playhead';

export class StoreReadModel<S, A extends SerializableAction> implements ReadModel {

  constructor(private readonly id: Identity,
              private readonly store: Store<S, A>,
              private readonly playhead: Playhead) {

  }

  public getId(): Identity {
    return this.id;
  }

  public getStore(): Store<S, A> {
    return this.store;
  }

  public getPlayhead(): Playhead {
    return this.playhead;
  }
}
