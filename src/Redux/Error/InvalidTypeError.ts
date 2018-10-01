import { AnyAction } from 'redux';
import { SerializableAction } from '../SerializableAction';
import { DomainEvent, DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';
import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { Identity, IdentityConstructor } from 'ts-eventsourcing/ValueObject/Identity';

export class InvalidTypeError extends Error {

  public static actionEventDoesNotMatchEventClass(action: AnyAction, eventClass: DomainEventConstructor<DomainEvent>) {
    return `Event ${ClassUtil.nameOffInstance(action.event)} is not an instance of ${ClassUtil.nameOffConstructor(eventClass)}`;
  }

  public static actionIdDoesNotMatchIdClass(action: SerializableAction, IdClass: IdentityConstructor<Identity>) {
    return `Id ${ClassUtil.nameOffInstance(action.metadata.aggregateId)} is not an instance of ${ClassUtil.nameOffConstructor(IdClass)}`;
  }
}
