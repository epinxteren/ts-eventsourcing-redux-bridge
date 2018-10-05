import { AnyAction } from 'redux';
import { DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';
import { ClassUtil } from 'ts-eventsourcing/ClassUtil';

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

export function domainEventTypeWithEntity(domainEventClass: DomainEventConstructor<any>, entity: string) {
  return typeWithEntity(entity, ClassUtil.nameOffConstructor(domainEventClass));
}

export function typeWithEntity(entity: string, type: string) {
  return `[${entity}] ${type}`;
}

export function typeWithEntityFactory(type: string) {
  return (entity: string) => {
    return typeWithEntity(entity, type);
  };
}
