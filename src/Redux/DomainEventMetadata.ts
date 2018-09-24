import { EntityMetadata } from './EntityMetadata';
import { Identity } from 'ts-eventsourcing';
import { Playhead } from '../ValueObject';

export interface DomainEventMetadata<Id extends Identity = Identity> extends EntityMetadata {
  aggregateId: Id;
  recordedOn: Date;
  playhead: Playhead;
}
