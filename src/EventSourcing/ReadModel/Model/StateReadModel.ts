import { Identity, ReadModel } from 'ts-eventsourcing';
import { Playhead } from '../../../ValueObject';

export class StateReadModel<State, Id extends Identity = Identity> implements ReadModel<Id> {

  constructor(private readonly id: Id,
              private readonly state: State,
              private readonly playhead: Playhead) {

  }

  public getId(): Id {
    return this.id;
  }

  public getState(): State {
    return this.state;
  }

  public getPlayhead(): Playhead {
    return this.playhead;
  }

}
