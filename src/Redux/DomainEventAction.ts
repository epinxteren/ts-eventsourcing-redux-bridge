import { SerializableAction } from './SerializableAction';
import { DomainEvent } from 'ts-eventsourcing';
import { DomainEventMetadata } from './DomainEventMetadata';

export interface DomainEventAction<Event extends DomainEvent, Metadata extends DomainEventMetadata> extends SerializableAction<Metadata> {
  event: Event;
}
