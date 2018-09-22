import { Identity, ReadModel } from 'ts-eventsourcing';
import { Playhead } from '../../../Value/Playhead';

export class StateReadModel<S> implements ReadModel {

  constructor(private readonly id: Identity,
              private readonly state: S,
              private readonly playhead: Playhead) {

  }

  public getId(): Identity {
    return this.id;
  }

  public getState(): S {
    return this.state;
  }

  public getPlayhead(): Playhead {
    return this.playhead;
  }

}
