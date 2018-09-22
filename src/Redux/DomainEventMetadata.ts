import { EntityMetadata } from './EntityMetadata';
import { Identity } from 'ts-eventsourcing';
import { Playhead } from '../Value/Playhead';

export interface DomainEventMetadata extends EntityMetadata {
  aggregateId: Identity;
  recordedOn: Date;
  playhead: Playhead;
}
