import { SerializableAction } from '../SerializableAction';
import { hasEntityMetadata, typeWithEntity, typeWithEntityFactory } from '../EntityMetadata';

it('Should know when its has valid entity metadata', () => {
  const action: SerializableAction = {
    type: 'hi',
    metadata: {
      playhead: 1,
      entity: 'PRODUCTS',
    },
  };

  expect(hasEntityMetadata(action)).toBeTruthy();
  expect(hasEntityMetadata('Not valid')).toBeFalsy();
  expect(hasEntityMetadata(null)).toBeFalsy();
  expect(hasEntityMetadata(undefined)).toBeFalsy();
  expect(hasEntityMetadata({ type: 'test' })).toBeFalsy();
  expect(hasEntityMetadata({ metadata: {} })).toBeFalsy();
  expect(hasEntityMetadata({ metadata: { test: 'string' } })).toBeFalsy();
  expect(hasEntityMetadata({ metadata: null })).toBeFalsy();
});

it('Can create entity names', () => {
  expect(typeWithEntity('PRODUCTS', 'bought')).toEqual('[PRODUCTS] bought');
  expect(typeWithEntity('USER', 'login')).toEqual('[USER] login');
});

it('Can create entity names, by factory', () => {
  expect(typeWithEntityFactory('bought')('PRODUCTS')).toEqual('[PRODUCTS] bought');
  expect(typeWithEntityFactory('login')('USER')).toEqual('[USER] login');
});
