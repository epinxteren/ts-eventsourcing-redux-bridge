import { ClassUtil } from 'ts-eventsourcing/ClassUtil';
import { QueryConstructor } from 'ts-eventsourcing/QueryHandling/Query';

export class InvalidQueryTypeError extends Error {

  public static actionIsNotAnQueryAction() {
    return new this('Action is not a query action');
  }

  public static doesNotMatchQuery(query: any, Query: QueryConstructor) {
    return new this(`Query ${ClassUtil.nameOffInstance(query)} is not an instance of ${ClassUtil.nameOffConstructor(Query)}`);
  }

}
