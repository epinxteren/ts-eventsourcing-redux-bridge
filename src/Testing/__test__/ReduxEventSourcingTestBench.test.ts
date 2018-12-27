import { ReduxEventSourcingTestBench } from '../ReduxEventSourcingTestBench';
import { RecordWithPlayhead } from '../../ReadModel/PlayheadRecord';

it('getReduxReadModelTestContext', () => {

  const tb = new ReduxEventSourcingTestBench();

  class MyState extends RecordWithPlayhead({}, 'MyState') {

  }

  const context = tb.getReduxReadModelTestContext(MyState, jest.fn().mockRejectedValue(new MyState()));

  expect(tb.models.map.MyState).toBe(context);
});