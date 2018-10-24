import { EntityMetadata, hasEntityMetadata, matchActionTypeEntity } from '../Redux/EntityMetadata';
import { SerializableQuery } from './SerializableQuery';
import { QueryConstructor } from 'ts-eventsourcing/QueryHandling/Query';
import { InvalidQueryTypeError } from './Error/InvalidQueryTypeError';

export interface QueryAction<T extends SerializableQuery = SerializableQuery, Metadata = {}> {
  type: string;
  metadata: EntityMetadata & Metadata;
  query: T;
}

export function isQueryAction(action: any): action is QueryAction {
  return action &&
    hasEntityMetadata(action) &&
    SerializableQuery.isSerializableQuery(action.query);
}

export function isQueryActionOfType(action: any, type: (entity: string) => string): action is QueryAction {
  return isQueryAction(action) && matchActionTypeEntity(action, type);
}

export function asQueryAction<T extends SerializableQuery = SerializableQuery, Metadata = {}>(
  action: any,
  Query: QueryConstructor<T>,
): QueryAction<T, Metadata> {
  if (!isQueryAction(action)) {
    throw InvalidQueryTypeError.actionIsNotAnQueryAction();
  }
  if (!(action.query instanceof Query)) {
    throw InvalidQueryTypeError.doesNotMatchQuery(action.query, Query);
  }
  return action as any;
}
