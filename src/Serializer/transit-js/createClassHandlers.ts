import { ClassConstructor } from './TransitJSSerializer';

interface SerializeHandler {
  /**
   * a unique identifier for this type that will be used in the serialised output
   */
  tag: string;
  /**
   * a constructor function that can be used to identify the type via an instanceof check
   */
  class: ClassConstructor;
  /**
   * a function which will receive an instance of your type, and is expected to create some serialisable representation of it.
   */
  write(instance: any): any;
  /**
   * a function which will receive the serialisable representation, and is expected to create a new instance from it
   */
  read(instance: any): any;
}

export function createClassHandlers(classes: { [key: string]: ClassConstructor } = {}): SerializeHandler[] {
  return Object.getOwnPropertyNames(classes).map(tag => {
    const cons = classes[tag];
    return {
      tag,
      class: cons,
      write: (object: { [key: string]: any }) => {
        const ownPropertyNames = Object.getOwnPropertyNames(object);
        const plainProperties: { [key: string]: any } = {};
        ownPropertyNames.forEach(key => {
          plainProperties[key] = object[key];
        });
        return plainProperties;
      },
      read: (plainProperties: { [key: string]: any }) => {
        const instance = new cons();
        const ownPropertyNames = Object.getOwnPropertyNames(plainProperties);
        ownPropertyNames.forEach(key => {
          instance[key] = plainProperties[key];
        });
        return instance;
      },
    };
  });
}
