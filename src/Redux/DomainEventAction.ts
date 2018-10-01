import { SerializableAction } from './SerializableAction';
import { DomainEventMetadata } from './DomainEventMetadata';
import { InvalidTypeError } from './Error/InvalidTypeError';
import { DomainEvent, DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';
import { Identity, IdentityConstructor } from 'ts-eventsourcing/ValueObject/Identity';

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
