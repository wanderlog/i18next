import 'i18next';

import {
  TestNamespaceContext,
  TestNamespacePlurals,
  TestNamespaceOrdinal,
  TestNamespaceCustom,
  TestNamespaceCustomAlternate,
  TestNamespaceFallback,
  TestNamespaceNonPlurals,
} from '../test.namespace.samples';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'custom';
    fallbackNS: 'fallback';

    // This subdirectory only tests strict interpolation checks
    strictInterpolationTypes: true;

    resources: {
      custom: TestNamespaceCustom;

      alternate: TestNamespaceCustomAlternate;

      fallback: TestNamespaceFallback;

      ctx: TestNamespaceContext;

      plurals: TestNamespacePlurals;

      nonPlurals: TestNamespaceNonPlurals;

      ord: TestNamespaceOrdinal;
    };
  }
}
