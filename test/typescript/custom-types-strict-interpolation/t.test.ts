import { describe, it, expectTypeOf, assertType } from 'vitest';
import { TFunction } from 'i18next';

describe('main', () => {
  const t = (() => '') as TFunction;

  it('should succeed when passing number to a number interpolation with strictInterpolationTypes', () => {
    expectTypeOf(t('qux', { val: 1 })).toEqualTypeOf<'some {{val, number}}'>(
      'some {{val, number}}',
    );
  });

  it('should error when passing a string to a number interpolation with strictInterpolationTypes', () => {
    // @ts-expect-error
    assertType(t('qux', { val: 'abc' }));
  });
});
