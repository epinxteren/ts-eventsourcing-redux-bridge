import { StoreReadModel } from './ReadModel/Model/StoreReadModel';
import { StoreRepositoryInterface } from './ReadModel/StoreRepositoryInterface';
import { ClassUtil, DomainMessage } from 'ts-eventsourcing';
import { ServerGatewayInterface } from '../Gateway';
import { SerializableAction } from '../Redux/SerializableAction';
import { DomainEventAction } from '../Redux/DomainEventAction';
import { DomainEventMetadata } from '../Redux/DomainEventMetadata';
import { typeWithEntity } from '../Redux/EntityMetadata';
import { Entity } from '../Value/Entity';

/**
 * For passing events between the projector and redux store.
 *
 * 1. Dispatch the given action to the store.
 * 2. Save the new State to read model repository.
 * 3. Transmit the action by the gateway.
 */
export class ProjectorGateway<S, A extends SerializableAction> {

  protected constructor(protected readonly repository: StoreRepositoryInterface<S, A>,
                        protected readonly gateway: ServerGatewayInterface,
                        protected readonly entityName: Entity) {
  }

  public createDomainEventMetadata(model: StoreReadModel<S, A>, message: DomainMessage, metadata: { entity?: string, [extraProps: string]: any } = {}): DomainEventMetadata {
    return {
      entity: this.entityName,
      ...metadata,
      playhead: model.getPlayhead() + 1,
      aggregateId: model.getId(),
      recordedOn: message.recordedOn,
    };
  }

  /**
   * For direct passing a domain message as a redux action.
   */
  public async dispatchAndSaveMessage(model: StoreReadModel<S, A>, message: DomainMessage, metadata: { entity?: string, [extraProps: string]: any } = {}) {
    const domainEventMetadata = this.createDomainEventMetadata(model, message, metadata);
    const action: DomainEventAction<any, DomainEventMetadata> = {
      type: typeWithEntity(domainEventMetadata.entity, ClassUtil.nameOffInstance(message.payload)),
      event: message.payload,
      metadata: domainEventMetadata,
    };
    /* TODO: why is action not compatible? */
    return this.dispatchActionAndSave(model, action as any);
  }

  protected async dispatchActionAndSave(model: StoreReadModel<S, A>, action: A) {
    model.getStore().dispatch(action);
    await this.repository.save(new StoreReadModel<S, A>(model.getId(), model.getStore(), action.metadata.playhead));
    await this.gateway.emit(action);
  }

}
