import { SerializableAction } from '../Redux/SerializableAction';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';

/**
 * For passing events between the projector and redux store.
 *
 * 1. Dispatch the given action to the store.
 * 2. Save the new State to read model repository.
 * 3. Transmit the action by the gateway.
 */
export interface ProjectorGatewayInterface<Id extends Identity, Action extends SerializableAction = SerializableAction> {
  /**
   * For passing any action.
   */
  dispatchActionAndSave(
    id: Id,
    action: Action,
  ): Promise<void>;

}
