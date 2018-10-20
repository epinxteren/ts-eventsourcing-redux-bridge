import { SerializableAction } from '../Redux/SerializableAction';
import { DomainEventMetadata } from '../Redux/DomainEventMetadata';
import { InvalidTypeError } from '../Redux/Error/InvalidTypeError';
import { DomainEvent, DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';
import { Identity, IdentityConstructor } from 'ts-eventsourcing/ValueObject/Identity';
import { EntityName } from '../ValueObject/EntityName';
import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { typeWithEntity } from '../Redux/EntityMetadata';

export interface DomainEventAction<Event extends DomainEvent,
  Id extends Identity = Identity,
  Metadata extends DomainEventMetadata<Id> = DomainEventMetadata<Id>>
  extends SerializableAction<Metadata> {
  event: Event;
}

export function asDomainEventAction<Event extends DomainEvent, Id extends Identity = Identity, Metadata extends DomainEventMetadata<Id> = DomainEventMetadata<Id>>(
  action: SerializableAction,
  eventClass: DomainEventConstructor<Event>,
  IdClass?: IdentityConstructor<Id>,
): DomainEventAction<Event, Id, Metadata> {
  if (!(action.event instanceof eventClass)) {
    throw InvalidTypeError.actionEventDoesNotMatchEventClass(action, eventClass);
  }
  if (IdClass && !(action.metadata.aggregateId instanceof IdClass)) {
    throw InvalidTypeError.actionIdDoesNotMatchIdClass(action, IdClass);
  }
  return action as any;
}

export function domainEventActionType(domainEventClass: DomainEventConstructor<any>, entity: EntityName) {
  return typeWithEntity(ClassUtil.nameOffConstructor(domainEventClass), entity);
}
