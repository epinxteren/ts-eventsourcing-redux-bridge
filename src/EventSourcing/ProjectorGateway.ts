import { StoreReadModel } from './ReadModel/Model/StoreReadModel';
import { StoreRepositoryInterface } from './ReadModel/StoreRepositoryInterface';
import { ClassUtil, DomainEvent, DomainMessage, Identity } from 'ts-eventsourcing';
import { ServerGatewayInterface } from '../Gateway';
import { SerializableAction } from '../Redux/SerializableAction';
import { DomainEventAction } from '../Redux/DomainEventAction';
import { DomainEventMetadata } from '../Redux/DomainEventMetadata';
import { typeWithEntity } from '../Redux/EntityMetadata';
import { EntityName } from '../ValueObject';

/**
 * For passing events between the projector and redux store.
 *
 * 1. Dispatch the given action to the store.
 * 2. Save the new State to read model repository.
 * 3. Transmit the action by the gateway.
 */
export class ProjectorGateway<State, Id extends Identity, Action extends SerializableAction = SerializableAction> {

  constructor(protected readonly repository: StoreRepositoryInterface<State, Id, Action>,
              protected readonly gateway: ServerGatewayInterface,
              protected readonly entityName: EntityName) {
  }

  /**
   * Convenience function to create domain event metadata.
   */
  public createDomainEventMetadata(
    model: StoreReadModel<State, Id, Action>,
    message: DomainMessage<DomainEvent, Id>,
    additionalMetadata: { entity?: string, [extraProps: string]: any } = {},
  ): DomainEventMetadata<Id> & typeof additionalMetadata {
    return {
      entity: this.entityName,
      ...additionalMetadata,
      playhead: model.getPlayhead() + 1,
      aggregateId: model.getId(),
      recordedOn: message.recordedOn,
    };
  }

  /**
   * For direct passing a domain message as a redux action.
   */
  public async dispatchAndSaveMessage(
    model: StoreReadModel<State, Id, Action>,
    message: DomainMessage<DomainEvent, Id>,
    additionalMetadata: { entity?: string, [extraProps: string]: any } = {},
  ) {
    const domainEventMetadata = this.createDomainEventMetadata(model, message, additionalMetadata);
    const action: DomainEventAction<DomainEvent, Id, typeof domainEventMetadata> = {
      type: typeWithEntity(domainEventMetadata.entity, ClassUtil.nameOffInstance(message.payload)),
      event: message.payload,
      metadata: domainEventMetadata,
    };
    await this.dispatchActionAndSave(model, action as any);
    return action;
  }

  protected async dispatchActionAndSave(
    model: StoreReadModel<State, Id, Action>,
    action: Action,
  ) {
    model.getStore().dispatch(action);
    await this.repository.save(model.withIncreasedPlayhead());
    await this.gateway.emit(action);
  }

}
