# Wanderlog fork

This is Wanderlog's fork of i18next. We publish it to npm as
[`@wanderlogapp/i18next`](https://www.npmjs.com/package/@wanderlogapp/i18next).
The itineraries repo installs it with
`"i18next": "npm:@wanderlogapp/i18next@…"`.

## Releasing a new version

First, commit and push your change to the `wanderlog` branch. Check
https://github.com/wanderlog/i18next/tags for the latest version, and add 1 to
the last number. Make sure `npm whoami` prints `wanderlogapp` (if not, run
`npm login`). Then run:

```shell
VERSION='<substitute version here>' # e.g., VERSION='v23.8.1-wanderlog.4'

# Start wanderlog-built from the latest commit on the wanderlog branch
git fetch
git checkout wanderlog-built
git reset --hard origin/wanderlog

# Build, and commit the build output (it's gitignored on the
# wanderlog branch)
npm install
npm run build
git add -f dist index.v4.d.ts

# Rename the package for npm, and set its version (without the leading v)
npm pkg set name='@wanderlogapp/i18next' version="${VERSION#v}"
# Remove the prepare script: it runs husky, which isn't installed
npm pkg delete scripts.prepare

# Commit, tag, and push the release
git commit -am "[$VERSION] Release built version"
git tag "$VERSION"
git push -f origin wanderlog-built "$VERSION"

# Publish to npm. --ignore-scripts skips the package's build and install
# scripts, since the built files are already committed
npm publish --access public --ignore-scripts
```

Then, in itineraries, bump the version in the `npm:@wanderlogapp/i18next@…`
alias and run `yarn install`. New `@wanderlogapp/*` versions skip the
one-week age gate because of `npmPreapprovedPackages` in `.yarnrc.yml`.

--------------------------------------------------------------------------------

# i18next: learn once - translate everywhere [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Awesome%20i18next:%20learn%20once%20-%20translate%20everywhere%20-%20the%20internationalization%20ecosystem%20&url=https://github.com/i18next/i18next&via=jamuhl&hashtags=i18n,javascript,dev)

[![Lint & Test](https://github.com/i18next/i18next/actions/workflows/lint_and_test.yml/badge.svg?branch=master)](https://github.com/i18next/i18next/actions/workflows/lint_and_test.yml)
[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/i18next/i18next)
[![Coveralls](https://img.shields.io/coveralls/i18next/i18next/master.svg?style=flat-square)](https://coveralls.io/github/i18next/i18next)
[![Package Quality](https://packagequality.com/shield/i18next.svg)](https://packagequality.com/#?package=i18next)
[![cdnjs version](https://img.shields.io/cdnjs/v/i18next.svg?style=flat-square)](https://cdnjs.com/libraries/i18next)
[![npm version](https://img.shields.io/npm/v/i18next.svg?style=flat-square)](https://www.npmjs.com/package/i18next)
![npm](https://img.shields.io/npm/dw/i18next)

i18next is a very popular internationalization framework for browser or any other javascript environment (eg. Node.js, Deno).

![ecosystem](https://raw.githubusercontent.com/i18next/i18next/master/assets/i18next-ecosystem.jpg)

i18next provides:

- Flexible connection to [backend](https://www.i18next.com/overview/plugins-and-utils#backends) (loading translations via xhr, ...)
- Optional [caching](https://www.i18next.com/how-to/caching), user [language detection](https://www.i18next.com/overview/plugins-and-utils#language-detector), ...
- Proper [pluralizations](https://www.i18next.com/translation-function/plurals)
- Translation [context](https://www.i18next.com/translation-function/context)
- [Nesting](https://www.i18next.com/translation-function/nesting), [Variable replacement](https://www.i18next.com/translation-function/interpolation)
- Flexibility: [Use it everywhere](https://www.i18next.com/overview/supported-frameworks)
- Extensibility: eg. [sprintf](https://www.i18next.com/overview/plugins-and-utils#post-processors)
- ...

For more information visit the website:

- [Getting started](https://www.i18next.com/overview/getting-started)
- [Translation Functionality](https://www.i18next.com/translation-function/essentials)
- [API](https://www.i18next.com/overview/api)

Our focus is providing the core to building a booming ecosystem. Independent of the building blocks you choose, be it react, angular or even good old jquery proper translation capabilities are just [one step away](https://www.i18next.com/overview/supported-frameworks).

### Documentation

The general i18next documentation is published on [www.i18next.com](https://www.i18next.com) and PR changes can be supplied [here](https://github.com/i18next/i18next-gitbook).

The react specific documentation is published on [react.i18next.com](https://react.i18next.com) and PR changes can be supplied [here](https://github.com/i18next/react-i18next-gitbook).

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**From the creators of i18next: localization as a service - locize.com**

A translation management system built around the i18next ecosystem - [locize.com](https://locize.com).

![locize](https://locize.com/img/ads/github_locize.png)

With using [locize](https://locize.com/?utm_source=i18next_readme&utm_medium=github) you directly support the future of i18next.

---
