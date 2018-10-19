import { AnyAction } from 'redux';
import { DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';
import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
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

export function domainEventTypeWithEntity(domainEventClass: DomainEventConstructor<any>, entity: EntityName) {
  return typeWithEntity(entity, ClassUtil.nameOffConstructor(domainEventClass));
}

export function typeWithEntity(type: string, entity: EntityName) {
  return `[${entity}] ${type}`;
}

export function typeWithEntityFactory(type: string) {
  return (entity: EntityName) => {
    return typeWithEntity(type, entity);
  };
}
