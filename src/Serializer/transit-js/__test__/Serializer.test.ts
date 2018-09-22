import 'jest';
import { TransitJSSerializer } from '../TransitJSSerializer';
import { Record } from 'immutable';
import {createClassHandlers} from "../createClassHandlers";

class TestClass {
  public t = 2;
  public name = 55;
  public appel: string | undefined;
  public date: Date | undefined;

  constructor(public foo: string = 'bar') {

  }
}

class TestClass2 extends TestClass {

}

describe('Serializer', () => {

  it('Can serialize normal javascript objects', () => {
    const serializer = new TransitJSSerializer([]);
    const date = new Date();
    date.setTime(1518770045540);
    const target = {
      date,
      arrays: [1, 2, 3],
      objects: { test: 2 },
    };
    const serialized = serializer.serialize(target);
    expect(serialized).toMatchSnapshot();
    const deSerialized = serializer.deserialize(serialized);
    expect(deSerialized).toEqual(target);
  });

  it('Can serialize records', () => {
    const testRecord = Record({ name: 'foo' }, 'test');
    const test = new testRecord({ name: 'bar' });
    const serializer = new TransitJSSerializer([testRecord]);
    const serialized = serializer.serialize(test);
    expect(serialized).toMatchSnapshot();
    const deSerialized = serializer.deserialize(serialized);
    expect(deSerialized).toEqual(test);
  });

  it('Can serialize a random class', () => {
    const test = new TestClass('d');
    const date = new Date();
    date.setTime(1518770045540);
    test.date = date;
    const serializer = new TransitJSSerializer([], createClassHandlers({ TestClass }));
    const serialized = serializer.serialize(test);
    expect(serialized).toMatchSnapshot();
    const deSerialized: TestClass = serializer.deserialize(serialized) as any;
    expect(deSerialized).toEqual(test);
    expect(deSerialized).toBeInstanceOf(TestClass);
    expect(deSerialized.date).toBeInstanceOf(Date);
  });

  // TODO: fixme, cannot serialize extended classes.
  it.skip('Can serialize a different classes', () => {
    const test = new TestClass('d');
    const test2 = new TestClass2('e');
    const date = new Date();
    date.setTime(1518770045540);
    test.date = date;
    const serializer = new TransitJSSerializer([], createClassHandlers({ TestClass2, TestClass }));
    const serialized = serializer.serialize([test, test2]);
    expect(serialized).toMatchSnapshot();
    const deSerialized = serializer.deserialize(serialized) as any;
    expect(deSerialized).toEqual([test, test2]);
    expect(deSerialized[0]).toBeInstanceOf(TestClass);
    expect(deSerialized[1]).toBeInstanceOf(TestClass2);
  });

});
