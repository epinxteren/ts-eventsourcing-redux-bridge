import { SerializableAction } from '../../Redux/SerializableAction';
import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { Identity, IdentityConstructor } from 'ts-eventsourcing/ValueObject/Identity';
import { AnyAction } from 'redux';
import { DomainEvent, DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';

export class InvalidTypeError extends Error {

  public static actionMissingRecordedOn() {
    return new this('Action is missing recorded on');
  }

  public static actionReadModelIdNotInstanceOf(action: SerializableAction, IdClass: IdentityConstructor<Identity>) {
    return new this(`Readmodel id ${ClassUtil.nameOffInstance(action.metadata.aggregateId)} is not an instance of ${ClassUtil.nameOffConstructor(IdClass)}`);
  }

  public static actionEventDoesNotMatchEventClass(action: AnyAction, eventClass: DomainEventConstructor<DomainEvent>) {
    return new this(`Event ${ClassUtil.nameOffInstance(action.event)} is not an instance of ${ClassUtil.nameOffConstructor(eventClass)}`);
  }

  public static actionAggregateIdNotInstanceOf(action: SerializableAction, IdClass: IdentityConstructor<Identity>) {
    return new this(`Aggregate Id ${ClassUtil.nameOffInstance(action.metadata.aggregateId)} is not an instance of ${ClassUtil.nameOffConstructor(IdClass)}`);
  }

  public static actionMissingValidPlayhead(playhead: unknown) {
    return new this(`Action is missing valid playhead ${playhead}`);
  }
}
