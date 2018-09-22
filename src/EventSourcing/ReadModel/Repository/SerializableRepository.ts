import { StateReadModel } from '../Model/StateReadModel';
import { BlobReadModel, Identity, Repository } from 'ts-eventsourcing';
import { SerializerInterface } from '../../../Serializer';
import { Playhead } from '../../../Value/Playhead';

export interface SerializedStateData {
  playhead: Playhead;
  serialized: string;
}

export class SerializableRepository<S> implements Repository<StateReadModel<S>> {

  constructor(private readonly stateRepository: Repository<BlobReadModel<SerializedStateData>>, private readonly serializer: SerializerInterface) {

  }

  public save(model: StateReadModel<S>): Promise<void> {
    const serialized = this.serializer.serialize({
      state: model.getState(),
    });
    return this.stateRepository.save(new BlobReadModel(model.getId(), {
      playhead: model.getPlayhead(),
      serialized,
    }));
  }

  public has(id: Identity): Promise<boolean> {
    return this.stateRepository.has(id);
  }

  public async get(id: Identity): Promise<StateReadModel<S>> {
    const data = await this.stateRepository.get(id);
    return this.deSerialize(data, id);
  }

  public async find(id: Identity): Promise<null | StateReadModel<S>> {
    const data = await this.stateRepository.find(id);
    if (data === null) {
      return null;
    }
    return this.deSerialize(data, id);
  }

  public remove(id: Identity): Promise<void> {
    return this.stateRepository.remove(id);
  }

  private deSerialize(data: BlobReadModel<SerializedStateData>, id: Identity) {
    const payLoad = data.getPayLoad();
    const deSerialized: any = this.serializer.deserialize(payLoad.serialized);
    return new StateReadModel(id, deSerialized.state, payLoad.playhead) as StateReadModel<S>;
  }

}
