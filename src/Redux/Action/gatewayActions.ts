import { typeWithEntityFactory } from '../EntityMetadata';
import { EntityName } from '../../ValueObject/EntityName';
import { GatewayAction } from '../GatewayAction';

export const GATEWAY_OPEN = typeWithEntityFactory('gateway open');
export const GATEWAY_ERROR = typeWithEntityFactory('gateway error');
export const GATEWAY_CLOSE = typeWithEntityFactory('gateway close');

export const GATEWAY_IS_OPEN = typeWithEntityFactory('gateway is open');
export const GATEWAY_IS_CLOSED = typeWithEntityFactory('gateway is closed');

export function gatewayOpen<T>(entity: EntityName, gate: T): GatewayAction<T> {
  return {
    type: GATEWAY_OPEN(entity),
    metadata: {
      entity,
    },
    gate,
  };
}

export function gatewayClose<T>(entity: EntityName, gate: T): GatewayAction<T> {
  return {
    type: GATEWAY_CLOSE(entity),
    metadata: {
      entity,
    },
    gate,
  };
}

export function gatewayIsClosed<T>(entity: EntityName, gate: T): GatewayAction<T> {
  return {
    type: GATEWAY_IS_CLOSED(entity),
    metadata: {
      entity,
    },
    gate,
  };
}

export function gatewayIsOpen<T>(entity: EntityName, gate: T): GatewayAction<T> {
  return {
    type: GATEWAY_IS_OPEN(entity),
    metadata: {
      entity,
    },
    gate,
  };
}

export function gatewayError<T>(entity: EntityName, gate: T, error: unknown): GatewayAction<T> {
  return {
    type: GATEWAY_ERROR(entity),
    metadata: {
      entity,
      error,
    },
    gate,
  };
}
