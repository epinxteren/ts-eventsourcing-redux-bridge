import { actionTypeWithEntityFactory } from '../Redux/EntityMetadata';
import { EntityName } from '../ValueObject/EntityName';
import { GatewayAction } from './GatewayAction';

export const GATEWAY_OPEN = actionTypeWithEntityFactory('gateway open');
export const GATEWAY_ERROR = actionTypeWithEntityFactory('gateway error');
export const GATEWAY_CLOSE = actionTypeWithEntityFactory('gateway close');

export const GATEWAY_IS_OPEN = actionTypeWithEntityFactory('gateway is open');
export const GATEWAY_IS_CLOSED = actionTypeWithEntityFactory('gateway is closed');

export function gatewayOpen<T>(entity: EntityName, gate: T, metadata: { [key: string]: any } = {}): GatewayAction<T> {
  return {
    type: GATEWAY_OPEN(entity),
    metadata: {
      ...metadata,
      entity,
    },
    gate,
  };
}

export function gatewayClose<T>(entity: EntityName, gate: T, metadata: { [key: string]: any } = {}): GatewayAction<T> {
  return {
    type: GATEWAY_CLOSE(entity),
    metadata: {
      ...metadata,
      entity,
    },
    gate,
  };
}

export function gatewayIsClosed<T>(entity: EntityName, gate: T, metadata: { [key: string]: any } = {}): GatewayAction<T> {
  return {
    type: GATEWAY_IS_CLOSED(entity),
    metadata: {
      ...metadata,
      entity,
    },
    gate,
  };
}

export function gatewayIsOpen<T>(entity: EntityName, gate: T, metadata: { [key: string]: any } = {}): GatewayAction<T> {
  return {
    type: GATEWAY_IS_OPEN(entity),
    metadata: {
      ...metadata,
      entity,
    },
    gate,
  };
}

export function gatewayError<T>(entity: EntityName, gate: T, error: unknown, metadata: { [key: string]: any } = {}): GatewayAction<T> {
  return {
    type: GATEWAY_ERROR(entity),
    metadata: {
      ...metadata,
      entity,
      error,
    },
    gate,
  };
}
