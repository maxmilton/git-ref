import * as assert from 'uvu/assert';
import * as allExports from '../src/index';
import { gitHash, gitRef } from '../src/index';
import { describe } from './utils';

describe('exports', (test) => {
  (
    [
      ['default', 'default'],
      ['gitRef', 'gitRef named'],
      ['gitHash', 'gitHash named'],
    ] as const
  ).forEach(([name, description]) => {
    test(`has a ${description} export`, () => {
      assert.ok(name in allExports);
      assert.type(allExports[name], 'function');
    });
  });

  test('default export is gitRef', () => {
    assert.is(allExports.default, gitRef);
  });
});

// TODO: Run in various other sample git repos, e.g.:
// - without any commits
// - with commits but without any tags
// - with multiple tags
// - with a dirty tree (uncommitted changes)
// - in a broken repo
// - not in a git repo
// - in a git repo with commits but no HEAD ref

describe('gitRef', (test) => {
  test('returns a non-empty string', () => {
    const result = gitRef();
    assert.is.not(result, '');
    assert.type(result, 'string');
  });

  test('returns a tag git reference', () => {
    const result = gitRef();
    assert.is(/^v\d+\.\d+\.\d+/.test(result), true, 'matches expected format');
  });
});

describe('gitHash', (test) => {
  test('returns a short git hash by default', () => {
    const result = gitHash();
    assert.type(result, 'string');
    assert.is(result.length, 7);
  });

  test('returns a long git hash with arg true', () => {
    const result = gitHash(true);
    assert.type(result, 'string');
    assert.is(result.length, 40);
  });

  test('returns a short git hash with arg false', () => {
    const result = gitHash(false);
    assert.type(result, 'string');
    assert.is(result.length, 7);
  });
});
