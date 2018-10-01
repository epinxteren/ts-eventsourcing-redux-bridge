import { EntityMetadata } from './EntityMetadata';
import { Playhead } from '../ValueObject/Playhead';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';

export interface DomainEventMetadata<Id extends Identity = Identity> extends EntityMetadata {
  aggregateId: Id;
  recordedOn: Date;
  playhead: Playhead;
}
