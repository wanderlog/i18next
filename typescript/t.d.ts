import type { $OmitArrayKeys, $Dictionary, $SpecialObject } from './helpers.js';
import type {
  TypeOptions,
  Namespace,
  FlatNamespace,
  DefaultNamespace,
  TOptions,
} from './options.js';

/** @todo consider to replace {} with Record<string, never> */
/* eslint @typescript-eslint/ban-types: ['error', { types: { "{}": false } }] */

// Type Options
type _ReturnObjects = TypeOptions['returnObjects'];
type _ReturnNull = TypeOptions['returnNull'];
type _KeySeparator = TypeOptions['keySeparator'];
type _NsSeparator = TypeOptions['nsSeparator'];
type _PluralSeparator = TypeOptions['pluralSeparator'];
type _ContextSeparator = TypeOptions['contextSeparator'];
type _FallbackNamespace = TypeOptions['fallbackNS'];
type _Resources = TypeOptions['resources'];
type _JSONFormat = TypeOptions['jsonFormat'];
type _InterpolationPrefix = TypeOptions['interpolationPrefix'];
type _InterpolationSuffix = TypeOptions['interpolationSuffix'];

type $IsResourcesDefined = [keyof _Resources] extends [never] ? false : true;
type $ValueIfResourcesDefined<Value, Fallback> = $IsResourcesDefined extends true
  ? Value
  : Fallback;
type $FirstNamespace<Ns extends Namespace> = Ns extends readonly any[] ? Ns[0] : Ns;

type Resources = $ValueIfResourcesDefined<_Resources, $Dictionary<string>>;

type PluralSuffix = _JSONFormat extends 'v4'
  ? 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
  : number | 'plural';

type WithOrWithoutPlural<Key> = _JSONFormat extends 'v4' | 'v3'
  ? Key extends `${infer KeyWithoutOrdinalPlural}${_PluralSeparator}ordinal${_PluralSeparator}${PluralSuffix}`
    ? KeyWithoutOrdinalPlural | Key
    : Key extends `${infer KeyWithoutPlural}${_PluralSeparator}${PluralSuffix}`
    ? KeyWithoutPlural | Key
    : Key
  : Key;

type JoinKeys<K1, K2> = `${K1 & string}${_KeySeparator}${K2 & string}`;
type AppendNamespace<Ns, Keys> = `${Ns & string}${_NsSeparator}${Keys & string}`;

/** ****************************************************
 * Build all keys and key prefixes based on Resources *
 ***************************************************** */
type KeysBuilderWithReturnObjects<Res, Key = keyof Res> = Key extends keyof Res
  ? Res[Key] extends $Dictionary | readonly unknown[]
    ?
        | JoinKeys<Key, WithOrWithoutPlural<keyof $OmitArrayKeys<Res[Key]>>>
        | JoinKeys<Key, KeysBuilderWithReturnObjects<Res[Key]>>
    : never
  : never;

type KeysBuilderWithoutReturnObjects<Res, Key = keyof $OmitArrayKeys<Res>> = Key extends keyof Res
  ? Res[Key] extends $Dictionary | readonly unknown[]
    ? JoinKeys<Key, KeysBuilderWithoutReturnObjects<Res[Key]>>
    : Key
  : never;

type KeysBuilder<Res, WithReturnObjects> = $IsResourcesDefined extends true
  ? WithReturnObjects extends true
    ? keyof Res | KeysBuilderWithReturnObjects<Res>
    : KeysBuilderWithoutReturnObjects<Res>
  : string;

type KeysWithReturnObjects = {
  [Ns in FlatNamespace]: WithOrWithoutPlural<KeysBuilder<Resources[Ns], true>>;
};
type KeysWithoutReturnObjects = {
  [Ns in FlatNamespace]: WithOrWithoutPlural<KeysBuilder<Resources[Ns], false>>;
};

type ResourceKeys<WithReturnObjects = _ReturnObjects> = WithReturnObjects extends true
  ? KeysWithReturnObjects
  : KeysWithoutReturnObjects;

/** **********************************************************************
 * Parse t function keys based on the namespace, options and key prefix *
 *********************************************************************** */
export type KeysByTOptions<TOpt extends TOptions> = TOpt['returnObjects'] extends true
  ? ResourceKeys<true>
  : ResourceKeys;

export type NsByTOptions<Ns extends Namespace, TOpt extends TOptions> = TOpt['ns'] extends Namespace
  ? TOpt['ns']
  : Ns;

type ParseKeysByKeyPrefix<Keys, KPrefix> = KPrefix extends string
  ? Keys extends `${KPrefix}${_KeySeparator}${infer Key}`
    ? Key
    : never
  : Keys;

type ParseKeysByNamespaces<Ns extends Namespace, Keys> = Ns extends readonly (infer UnionNsps)[]
  ? UnionNsps extends keyof Keys
    ? AppendNamespace<UnionNsps, Keys[UnionNsps]>
    : never
  : never;

type ParseKeysByFallbackNs<Keys extends $Dictionary> = _FallbackNamespace extends false
  ? never
  : _FallbackNamespace extends (infer UnionFallbackNs extends string)[]
  ? Keys[UnionFallbackNs]
  : Keys[_FallbackNamespace & string];

type FilterKeysByContext<Keys, TOpt extends TOptions> = TOpt['context'] extends string
  ? Keys extends `${infer Prefix}${_ContextSeparator}${TOpt['context']}${infer Suffix}`
    ? `${Prefix}${Suffix}`
    : never
  : Keys;

export type ParseKeys<
  Ns extends Namespace = DefaultNamespace,
  TOpt extends TOptions = {},
  KPrefix = undefined,
  Keys extends $Dictionary = KeysByTOptions<TOpt>,
  ActualNS extends Namespace = NsByTOptions<Ns, TOpt>,
> = $IsResourcesDefined extends true
  ? FilterKeysByContext<
      | ParseKeysByKeyPrefix<Keys[$FirstNamespace<ActualNS>], KPrefix>
      | ParseKeysByNamespaces<ActualNS, Keys>
      | ParseKeysByFallbackNs<Keys>,
      TOpt
    >
  : string;

/** *******************************************************
 * Parse t function return type and interpolation values *
 ******************************************************** */
type ParseInterpolationValues<Value extends string, Format> = Format extends 'number' | 'currency'
  ? Record<Value, Parameters<Intl.NumberFormat['format']>[0]> & {
      formatParams?: Partial<Record<Value, Intl.NumberFormatOptions>>;
    }
  : Format extends 'datetime'
  ? Record<Value, Parameters<Intl.DateTimeFormat['format']>[0]> & {
      formatParams?: Partial<Record<Value, Intl.DateTimeFormatOptions>>;
    }
  : Format extends 'relativetime'
  ? Record<Value, Parameters<Intl.RelativeTimeFormat['format']>[0]> & {
      formatParams?: Partial<Record<Value, Intl.RelativeTimeFormatOptions>>;
    }
  : Format extends 'list'
  ? Record<Value, Parameters<Intl.ListFormat['format']>[0]> & {
      formatParams?: Partial<Record<Value, Intl.ListFormatOptions>>;
    }
  : // For custom and unknown types, allow any value
    Record<Value, any>;

type InterpolationMap<Ret> =
  // Recursively parse each value within braces
  Ret extends `${string}${_InterpolationPrefix}${infer Value}${_InterpolationSuffix}${infer Rest}`
    ? // Handle format names like `{{val, number}}`
      (Value extends `${infer ActualValue},${string}${infer Format}`
        ? // Remove parameters from format names like `{{val, number(minimumFractionDigits: 2)}}`
          Format extends `${infer ActualFormat}(${string}`
          ? ParseInterpolationValues<ActualValue, ActualFormat>
          : ParseInterpolationValues<ActualValue, Format>
        : Record<Value, any>) &
        InterpolationMap<Rest>
    : {};

type ParseTReturnPlural<
  Res,
  Key,
  KeyWithPlural = `${Key & string}${_PluralSeparator}${PluralSuffix}`,
> = Res[(KeyWithPlural | Key) & keyof Res];

type ParseTReturnPluralOrdinal<
  Res,
  Key,
  KeyWithOrdinalPlural = `${Key &
    string}${_PluralSeparator}ordinal${_PluralSeparator}${PluralSuffix}`,
> = Res[(KeyWithOrdinalPlural | Key) & keyof Res];

type ParseTReturn<
  Key,
  Res,
  TOpt extends TOptions = {},
> = Key extends `${infer K1}${_KeySeparator}${infer RestKey}`
  ? ParseTReturn<RestKey, Res[K1 & keyof Res], TOpt>
  : // Process plurals only if count is provided inside options
  TOpt['count'] extends number
  ? TOpt['ordinal'] extends boolean
    ? ParseTReturnPluralOrdinal<Res, Key>
    : ParseTReturnPlural<Res, Key>
  : // otherwise access plain key without adding plural and ordinal suffixes
  Res extends readonly unknown[]
  ? Key extends `${infer NKey extends number}`
    ? Res[NKey]
    : never
  : Res[Key & keyof Res];

type TReturnOptionalNull = _ReturnNull extends true ? null : never;
type TReturnOptionalObjects<TOpt extends TOptions> = _ReturnObjects extends true
  ? $SpecialObject | string
  : TOpt['returnObjects'] extends true
  ? $SpecialObject
  : string;
type DefaultTReturn<TOpt extends TOptions> = TReturnOptionalObjects<TOpt> | TReturnOptionalNull;

export type KeyWithContext<Key, TOpt extends TOptions> = TOpt['context'] extends string
  ? `${Key & string}${_ContextSeparator}${TOpt['context']}`
  : Key;

export type TFunctionReturn<
  Ns extends Namespace,
  Key,
  TOpt extends TOptions,
  ActualNS extends Namespace = NsByTOptions<Ns, TOpt>,
  ActualKey = KeyWithContext<Key, TOpt>,
> = $IsResourcesDefined extends true
  ? ActualKey extends `${infer Nsp}${_NsSeparator}${infer RestKey}`
    ? ParseTReturn<RestKey, Resources[Nsp & keyof Resources], TOpt>
    : ParseTReturn<ActualKey, Resources[$FirstNamespace<ActualNS>], TOpt>
  : DefaultTReturn<TOpt>;

export type TFunctionDetailedResult<T = string, TOpt extends TOptions = {}> = {
  /**
   * The plain used key
   */
  usedKey: string;
  /**
   * The translation result.
   */
  res: T;
  /**
   * The key with context / plural
   */
  exactUsedKey: string;
  /**
   * The used language for this translation.
   */
  usedLng: string;
  /**
   * The used namespace for this translation.
   */
  usedNS: string;
  /**
   * The parameters used for interpolation.
   */
  usedParams: InterpolationMap<T> & { count?: TOpt['count'] };
};

type TFunctionReturnOptionalDetails<Ret, TOpt extends TOptions> = TOpt['returnDetails'] extends true
  ? TFunctionDetailedResult<Ret, TOpt>
  : Ret;

type AppendKeyPrefix<Key, KPrefix> = KPrefix extends string
  ? `${KPrefix}${_KeySeparator}${Key & string}`
  : Key;

/** ************************
 * T function declaration *
 ************************* */
// Changes:
// 1. Removed `TemplateStringsArray` from the type that `Key` extends. We did this to
//    support the next change.
// 2. Replaced `InterpolationMap<Ret>` with `InterpolationMap<Key>`. We did this to get
//    better type inference (for interpolations mostly) without needing to provide our resources
//    file to the i18next types, which triggered a TS crash in versions of i18next before v23.3.0.
//    The reason this works is because we use key fallback.
// 3. Replaced `args` union type with a ternary, making options required if the key contains an
//    interpolation. This ensures we never forget to pass variables for interpolations.
// 4. Removed `TOpt` and replaced all usages with `TOptions`. The reason that we did this is that
//    `TOpt` was too permissive in what was allowed to be passed as an option, and this caused a
//    a mistake when renaming an interpolation (we didn't get an error that reminded us to rename the
//    corresponding entry in formatParams).
//
// We cannot merge this into mainline because:
//
// This currently doesn't support custom types, where `resources` is a literal object type with
// defined keys. Many tests are failing. We use a generic `ResourceLanguage`, so it doesn't matter.
export interface TFunction<Ns extends Namespace = _DefaultNamespace, KPrefix = undefined> {
  $TFunctionBrand: $IsResourcesDefined extends true ? `${$FirstNamespace<Ns>}` : never;
  <
    Key extends ParseKeys<Ns, TOptions, KPrefix>,
    Ret extends TFunctionReturn<Ns, AppendKeyPrefix<Key, KPrefix>, TOptions>,
  >(
    ...args: Key extends `${string}${_InterpolationPrefix}${string}${_InterpolationSuffix}${string}`
      ? [key: Key, options: TOptions & InterpolationMap<Key>]
      : [key: Key, options?: TOptions & InterpolationMap<Key>]
  ): TFunctionReturnOptionalDetails<Ret, TOptions>;
}

export type KeyPrefix<Ns extends Namespace> = ResourceKeys<true>[$FirstNamespace<Ns>] | undefined;
