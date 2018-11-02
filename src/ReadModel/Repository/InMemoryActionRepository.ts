import { StoreReadModel } from '../Model/StoreReadModel';
import { StoreFactory } from '../../Redux/Store/StoreFactory';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';
import { ReadModelAction, ReadModelMetadata } from '../ReadModelAction';
import { tap, toArray } from 'rxjs/operators';
import { NotFoundError } from '../Error/NotFoundError';
import { Store } from 'redux';
import { Playhead } from '../../ValueObject/Playhead';
import { ActionRepositoryInterface } from '../ActionRepositoryInterface';
import { ActionStream } from '../ActionStream';
import { SimpleActionStream } from '../SimpleActionStream';

export class InMemoryActionRepository<State,
  Id extends Identity = Identity,
  Metadata extends ReadModelMetadata<Id> = ReadModelMetadata<Id>,
  Action extends ReadModelAction<Id, Metadata> = ReadModelAction<Id, Metadata>> implements ActionRepositoryInterface<State, Id, Metadata, Action> {

  private readonly actions: { [id: string]: Action[] } = {};

  constructor(private readonly storeFactory: StoreFactory<State, Action>) {

  }

  public async create(id: Id): Promise<StoreReadModel<State, Id, Metadata, Action>> {
    return new StoreReadModel<State, Id, Metadata, Action>(id, this.storeFactory.create(), 0);
  }

  public async save(model: StoreReadModel<State, Id, Metadata, Action>): Promise<void> {
    if (!this.actions[model.getId().toString()]) {
      this.actions[model.getId().toString()] = [];
    }
    this.actions[model.getId().toString()] = await model.getUncommittedActions().pipe(toArray()).toPromise();
  }

  public async has(id: Id): Promise<boolean> {
    return !!this.actions[id.toString()];
  }

  public async get(id: Id): Promise<StoreReadModel<State, Id, Metadata, Action>> {
    const actions: Action[] = this.actions[id.toString()];
    if (!actions) {
      throw NotFoundError.storeNotFound(id);
    }
    const store: Store<State, Action> = this.storeFactory.create();
    actions.forEach((action: Action) => {
      store.dispatch(action);
    });
    const lastPlayhead: Playhead = actions.length === 0 ? 0 : actions[actions.length - 1].metadata.playhead as Playhead;
    return new StoreReadModel<State, Id, Metadata, Action>(id, store, lastPlayhead);
  }

  public async find(id: Id): Promise<null | StoreReadModel<State, Id, Metadata, Action>> {
    if (!this.has(id)) {
      return null;
    }
    return this.get(id);
  }

  public async remove(id: Identity): Promise<void> {
    delete this.actions[id.toString()];
  }

  public async append(id: Id, eventStream: ActionStream<Action>): Promise<void> {
    const actions: Action[] = this.actions[id.toString()];
    if (!actions) {
      throw NotFoundError.storeNotFound(id);
    }
    await eventStream.pipe(tap((action) => actions.push(action))).toPromise();
  }

  public load(id: Id): ActionStream<Action> {
    const actions: Action[] = this.actions[id.toString()];
    if (!actions) {
      throw NotFoundError.storeNotFound(id);
    }
    return SimpleActionStream.of(actions);
  }

  public loadFromPlayhead(id: Id, playhead: number): ActionStream<Action> {
    const actions: Action[] = this.actions[id.toString()];
    if (!actions) {
      throw NotFoundError.storeNotFound(id);
    }
    return SimpleActionStream.of(actions.slice(playhead));
  }

}
