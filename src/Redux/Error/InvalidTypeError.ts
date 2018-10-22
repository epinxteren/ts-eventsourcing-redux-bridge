import { AnyAction } from 'redux';
import { SerializableAction } from '../SerializableAction';
import { DomainEvent, DomainEventConstructor } from 'ts-eventsourcing/Domain/DomainEvent';
import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { Identity, IdentityConstructor } from 'ts-eventsourcing/ValueObject/Identity';
import { CommandConstructor } from 'ts-eventsourcing/CommandHandling/Command';

export class InvalidTypeError extends Error {

  public static actionIsNotAnCommandAction() {
    return new this('Action is not a command action');
  }

  public static actionEventDoesNotMatchEventClass(action: AnyAction, eventClass: DomainEventConstructor<DomainEvent>) {
    return new this(`Event ${ClassUtil.nameOffInstance(action.event)} is not an instance of ${ClassUtil.nameOffConstructor(eventClass)}`);
  }

  public static actionIdDoesNotMatchIdClass(action: SerializableAction, IdClass: IdentityConstructor<Identity>) {
    return new this(`Id ${ClassUtil.nameOffInstance(action.metadata.aggregateId)} is not an instance of ${ClassUtil.nameOffConstructor(IdClass)}`);
  }

  public static doesNotMatchCommand(command: any, Command: CommandConstructor) {
    return new this(`Command ${ClassUtil.nameOffInstance(command)} is not an instance of ${ClassUtil.nameOffConstructor(Command)}`);
  }

}
