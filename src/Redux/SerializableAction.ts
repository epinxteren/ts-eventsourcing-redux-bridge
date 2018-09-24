import { EntityMetadata, hasEntityMetadata } from './EntityMetadata';
import { Playhead } from '../ValueObject/Playhead';

export function isSerializableAction(action: any): action is SerializableAction {
  return hasEntityMetadata(action) &&
    typeof action.type === 'string' &&
    typeof action.metadata.playhead === 'number';
}

export interface SerializableAction<Metadata extends EntityMetadata = EntityMetadata> {
  type: string;
  metadata: EntityMetadata & { playhead: Playhead } & Metadata;
  [extraProps: string]: any;
}
