import { AnyAction } from 'redux';

export interface EntityMetadata {
  entity: string;
  // Allows any extra properties to be defined in an metadata.
  [extraProps: string]: any;
}

export function hasEntityMetadata(action: any): action is AnyAction & { metadata: EntityMetadata } {
  return typeof action === 'object' &&
    action &&
    typeof action.metadata === 'object' &&
    action.metadata &&
    typeof action.metadata.entity === 'string';
}

export function typeWithEntity(entity: string, type: string) {
  return `[${entity}] ${type}`;
}

export function typeWithEntityFactory(type: string) {
  return (entity: string) => {
    return typeWithEntity(entity, type);
  };
}
