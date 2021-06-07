import * as assert from 'uvu/assert';
import * as allExports from '../src/index';
import { gitHash, gitRef } from '../src/index';
import {
  createTempDir,
  deleteTempDir,
  describe,
  execCmds,
  getTempDir,
} from './utils';

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

describe('gitRef', (test) => {
  test.before(createTempDir);
  test.after(deleteTempDir);

  test('returns a non-empty string', () => {
    const result = gitRef();
    assert.type(result, 'string');
    assert.is.not(result, '');
  });

  test('returns a tag git reference', () => {
    const result = gitRef();
    assert.is(/^v\d+\.\d+\.\d+/.test(result), true, 'matches expected format');
  });

  test('returns empty string in non-git dir', () => {
    const dir = getTempDir('not-git');
    const result = gitRef(undefined, dir);
    assert.is(result, '');
  });

  test('returns empty string in repo without commits', () => {
    const dir = getTempDir('no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = gitRef(undefined, dir);
    assert.is(result, '');
  });

  test('returns short hash string in repo with commit but no tag', () => {
    const dir = getTempDir('with-commit');
    execCmds(dir, [
      'git init --quiet',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result = gitRef(undefined, dir);
    assert.type(result, 'string');
    assert.is(result.length, 7);
  });

  test('returns tag string in repo with tag', () => {
    const dir = getTempDir('with-tag');
    execCmds(dir, [
      'git init --quiet',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
      'git tag --no-sign -m "v123" v123',
    ]);
    const result = gitRef(undefined, dir);
    assert.is(result, 'v123');
  });

  test('appends "-dev" in repo with dirty tree (uncommitted changes)', () => {
    const dir = getTempDir('dirty-tree');
    execCmds(dir, [
      'git init --quiet',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
      'touch file2.txt',
      'git add file2.txt',
    ]);
    const result = gitRef(undefined, dir);
    assert.type(result, 'string');
    assert.ok(result.endsWith('-dev'));
  });

  test('appends "-broken" in repo with broken tree', () => {
    const dir = getTempDir('broken-tree');
    execCmds(dir, [
      'git init --quiet',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
      "sed -i 's/file.txt/corrupted.txt/g' ./.git/index",
    ]);
    const result = gitRef(undefined, dir);
    assert.type(result, 'string');
    assert.ok(result.endsWith('-broken'));
  });
});

describe('gitHash', (test) => {
  test.before(createTempDir);
  test.after(deleteTempDir);

  test('returns a non-empty string', () => {
    const result = gitHash();
    assert.type(result, 'string');
    assert.is.not(result, '');
  });

  test('returns a short git hash by default', () => {
    const result = gitHash();
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

  test('returns empty string in non-git dir', () => {
    const dir = getTempDir('not-git');
    const result = gitHash(undefined, dir);
    assert.is(result, '');
  });

  test('returns empty string in repo without commits', () => {
    const dir = getTempDir('no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = gitHash(undefined, dir);
    assert.is(result, '');
  });
});
