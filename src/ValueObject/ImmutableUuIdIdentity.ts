import { UuidIdentity } from 'ts-eventsourcing/build/ValueObject/UuidIdentity';
import { ValueObject, hash } from 'immutable';

export class ImmutableUuIdIdentity extends UuidIdentity implements ValueObject {
  public hashCode(): number {
    return hash(this.toString());
  }
}
