import { SerializableQuery } from './SerializableQuery';
import { QueryAction, queryActionTypeFactory } from './QueryAction';

/**
 * Return action for sending the query.
 *
 * The action will be picked up by the middleware {@see queryMiddleware}
 */
export const QUERY_TRANSMITTING = queryActionTypeFactory('query transmitting');

/**
 * The query is transmitted successfully.
 *
 * This will **not** say the query is handled successfully!.
 */
export const QUERY_TRANSMITTED_SUCCESSFULLY = queryActionTypeFactory('query transmitted successfully');

/**
 * The query transmission failed.
 */
export const QUERY_TRANSMISSION_FAILED = queryActionTypeFactory('query transmission failed');

/**
 * The query failed.
 */
export const QUERY_FAILED = queryActionTypeFactory('query handling failed');

/**
 * The query succeeded.
 */
export const QUERY_SUCCEEDED = queryActionTypeFactory('query handling succeeded');

/**
 * Send a query.
 *
 * Will be picked up by the {@see queryMiddleware}
 *
 * @example
 *
 * sendQuery(new ByeProduct(...), 'BUY PRODUCT')
 */
export function sendQuery(query: SerializableQuery, entity: string, metadata: { [key: string]: any } = {}): QueryAction {
  return {
    type: QUERY_TRANSMITTING(entity, query),
    query,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

/**
 * Will send a query, and return queryHandler status.
 *
 * @see listenToQueryHandler
 * @see sendQuery
 */
export function sendQueryAndListenToHandler<HandlerResponse>(query: SerializableQuery, entity: string, metadata: { [key: string]: any } = {}):
  Promise<HandlerResponse> {
  return listenToQueryHandler(sendQuery(query, entity, metadata));
}

/**
 * Listen to query handler response or errors.
 *
 * The return type is actual not really a promise. The middleware returns the promise when you bind it tor Redux.
 *
 * @example
 *
 *  function requestAccount(name: string, password: string) {
 *    return listenToQuery<UserId>(sendQuery(
 *      new UserRegisterQuery(name, password),
 *      'register'
 *    ));
 *  }
 *
 *  const RegisterForm = ({ register }: { register: (name: string, password: string) => Promise<UserId> }) => (
 *    // The form
 *    return <form>...</form>;
 *  );
 *
 *  const mapDispatchToProps = { register: registerAccount };
 *
 *  export const ConnectedRegisterForm = connect(
 *    null,
 *    mapDispatchToProps,
 *  )(RegisterForm);
 *
 * Requires {@see queryHandlerResponseMiddleware}
 */
export function listenToQueryHandler<T>(query: QueryAction<any>): Promise<T> {
  query.metadata.listenToQueryHandler = true;
  return query as any;
}

export function queryTransmittedSuccessfully(query: SerializableQuery, entity: string, metadata: { [key: string]: any } = {}): QueryAction {
  return {
    type: QUERY_TRANSMITTED_SUCCESSFULLY(entity, query),
    query,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

export function queryTransmissionFailed(query: SerializableQuery, entity: string, metadata: { [key: string]: any } = {}): QueryAction {
  return {
    type: QUERY_TRANSMISSION_FAILED(entity, query),
    query,
    metadata: {
      entity,
      ...metadata,
    },
  };
}

export function queryHandledSuccessfully(query: SerializableQuery, entity: string, response: unknown, metadata: { [key: string]: any } = {}): QueryAction {
  return {
    type: QUERY_SUCCEEDED(entity, query),
    query,
    metadata: {
      response,
      entity,
      ...metadata,
    },
  };
}

export function queryHandledFailed(query: SerializableQuery, entity: string, error: string, metadata: { [key: string]: any } = {}): QueryAction {
  return {
    type: QUERY_FAILED(entity, query),
    query,
    metadata: {
      error,
      entity,
      ...metadata,
    },
  };
}
