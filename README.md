[![Build status](https://img.shields.io/github/workflow/status/maxmilton/git-ref/ci)](https://github.com/maxmilton/git-ref/actions)
[![Coverage status](https://img.shields.io/codeclimate/coverage/MaxMilton/git-ref)](https://codeclimate.com/github/MaxMilton/git-ref)
[![NPM version](https://img.shields.io/npm/v/git-ref.svg)](https://www.npmjs.com/package/git-ref)
[![NPM bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/git-ref.svg)](https://bundlephobia.com/result?p=git-ref)
[![Licence](https://img.shields.io/github/license/maxmilton/git-ref.svg)](https://github.com/maxmilton/git-ref/blob/master/LICENSE)

# git-ref

Get the current git reference via [git describe](https://git-scm.com/docs/git-describe).

## Installation

```sh
npm install git-ref
```

or

```sh
yarn add git-ref
```

## Usage

```js
import { gitRef } from 'git-ref';

const ref = gitRef();

console.log(ref);
```

## Licence

`git-ref` is an MIT licensed open source project. See [LICENCE](https://github.com/maxmilton/git-ref/blob/master/LICENCE).

---

© 2021 [Max Milton](https://maxmilton.com)
