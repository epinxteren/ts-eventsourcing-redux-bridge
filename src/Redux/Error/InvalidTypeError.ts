import { AnyAction } from 'redux';
import { ClassUtil, DomainEvent, DomainEventConstructor, Identity, IdentityConstructor } from 'ts-eventsourcing';
import { SerializableAction } from '../SerializableAction';

export class InvalidTypeError extends Error {

  public static actionEventDoesNotMatchEventClass(action: AnyAction, eventClass: DomainEventConstructor<DomainEvent>) {
    return `Event ${ClassUtil.nameOffInstance(action.event)} is not an instance of ${ClassUtil.nameOffConstructor(eventClass)}`;
  }

  public static actionIdDoesNotMatchIdClass(action: SerializableAction, IdClass: IdentityConstructor<Identity>) {
    return `Id ${ClassUtil.nameOffInstance(action.metadata.aggregateId)} is not an instance of ${ClassUtil.nameOffConstructor(IdClass)}`;
  }
}
