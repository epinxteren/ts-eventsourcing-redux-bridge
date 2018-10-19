import { AnyAction } from 'redux';
import { EntityName } from '../ValueObject/EntityName';

export interface EntityMetadata {
  entity: EntityName;

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

export function typeWithEntity(type: string, entity: EntityName) {
  return `[${entity}] ${type}`;
}

export function typeWithEntityFactory(type: string) {
  return (entity: EntityName) => {
    return typeWithEntity(type, entity);
  };
}

export function matchActionTypeEntity(action: any, type: string | ((entity: EntityName) => string)) {
  if (!hasEntityMetadata(action)) {
    return false;
  }
  if (typeof type === 'function') {
    return action.type === type(action.metadata.entity);
  }
  return typeWithEntity(type, action.metadata.entity) !== action.type;
}
