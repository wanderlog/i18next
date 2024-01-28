import { describe, it, expectTypeOf, assertType } from 'vitest';
import { TFunction } from 'i18next';

describe('t', () => {
  it('should not throw error for different t functions', () => {
    const tOrd = (() => '') as TFunction<'ord'>;
    const tOrdPlurals = (() => '') as TFunction<['ord', 'plurals']>;
    const tPluralsOrd = (() => '') as TFunction<['plurals', 'ord']>;
    const tString = (() => '') as TFunction<[string, string]>;
    const tPlurals = (() => '') as TFunction<'plurals'>;
    const tPlain = (() => '') as TFunction;

    // no error - not checked when CustomTypeOptions["resources"] is not provided
    expectTypeOf(tOrd).toEqualTypeOf(tPlurals);
    expectTypeOf(tOrdPlurals).toEqualTypeOf(tPlurals);
    expectTypeOf(tPluralsOrd).toEqualTypeOf(tPlurals);
    expectTypeOf(tString).toEqualTypeOf(tPlurals);

    expectTypeOf(tOrd).toEqualTypeOf(tPlain);
    expectTypeOf(tOrdPlurals).toEqualTypeOf(tPlain);
    expectTypeOf(tPluralsOrd).toEqualTypeOf(tPlain);
    expectTypeOf(tString).toEqualTypeOf(tPlain);
  });

  const t = (() => '') as TFunction;

  it('should succeed when passing number to a number interpolation', () => {
    expectTypeOf(t('{{val, number}}', { val: 1 })).toEqualTypeOf<string>('string');
  });

  it('should error when passing a string to a number interpolation', () => {
    // @ts-expect-error
    assertType(t('{{val, number}}', { val: 'blah' }));
  });
});
