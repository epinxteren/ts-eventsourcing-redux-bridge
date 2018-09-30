import { ValueObject, hash } from 'immutable';
import { ScalarIdentity } from 'ts-eventsourcing/build/ValueObject/ScalarIdentity';

/**
 * This can also be used as keys for has tables.
 */
export class ImmutableScalerIdentity<T> extends ScalarIdentity<T> implements ValueObject {
  public hashCode(): number {
    return hash(this.toString());
  }
}
