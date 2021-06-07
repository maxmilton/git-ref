[![Build status](https://img.shields.io/github/workflow/status/maxmilton/git-ref/ci)](https://github.com/maxmilton/git-ref/actions)
[![Coverage status](https://img.shields.io/codeclimate/coverage/MaxMilton/git-ref)](https://codeclimate.com/github/MaxMilton/git-ref)
[![NPM version](https://img.shields.io/npm/v/git-ref.svg)](https://www.npmjs.com/package/git-ref)
[![NPM bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/git-ref.svg)](https://bundlephobia.com/result?p=git-ref)
[![Licence](https://img.shields.io/github/license/maxmilton/git-ref.svg)](https://github.com/maxmilton/git-ref/blob/master/LICENSE)

# git-ref

Get git strings like a git describe reference or git commit hash.

**Requirements:**

- [git](https://git-scm.com/) must be installed on your system and resolvable in your shell `PATH`.

## Installation

```sh
npm install git-ref
```

or

```sh
yarn add git-ref
```

## Usage

> Note: If run in a script which is not a git tree, or with no commits, an empty string is returned.

### Git reference

Get the current `HEAD` git reference via [git describe](https://git-scm.com/docs/git-describe).

```js
import { gitRef } from 'git-ref';

const ref = gitRef();

console.log(ref); // v0.0.3-16-g93d0f1d-dev
```

### Git hash

Get the current `HEAD` commit hash.

```js
import { gitHash } from 'git-ref';

const hash = gitHash();
const hashLong = gitHash(true);

console.log(hash); // 93d0f1d
console.log(hashLong); // 93d0f1dc4de720863e4b5f74970cf8f2012f3d88
```

### Detect dirty tree state

Find out if the git working tree is dirty (e.g., contains uncommitted changes).

```js
import { isDirty } from 'git-ref';

const state = isDirty();

console.log(state); // false
```

## Licence

`git-ref` is an MIT licensed open source project. See [LICENCE](https://github.com/maxmilton/git-ref/blob/master/LICENCE).

---

© 2021 [Max Milton](https://maxmilton.com)
