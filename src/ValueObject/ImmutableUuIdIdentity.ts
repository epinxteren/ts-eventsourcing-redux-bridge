import { ValueObject, hash } from 'immutable';
import { UuidIdentity } from 'ts-eventsourcing/ValueObject/UuidIdentity';

/**
 * This can also be used as keys for has tables.
 */
export class ImmutableUuIdIdentity extends UuidIdentity implements ValueObject {
  public hashCode(): number {
    return hash(this.toString());
  }
}
