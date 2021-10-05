import * as assert from 'uvu/assert';
import * as allExports from '../src/index';
import {
  fromClosestTag, gitHash, gitRef, isDirty,
} from '../src/index';
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
      ['gitRef', '"gitRef" named'],
      ['gitHash', '"gitHash" named'],
      ['isDirty', '"isDirty" named'],
      ['fromClosestTag', '"fromClosestTag" named'],
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
    const result = gitRef(dir);
    assert.is(result, '');
  });

  test('returns empty string in repo without commits', () => {
    const dir = getTempDir('no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = gitRef(dir);
    assert.is(result, '');
  });

  test('returns short hash string in repo with commit but no tag', () => {
    const dir = getTempDir('with-commit');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result = gitRef(dir);
    assert.type(result, 'string');
    assert.is(result.length, 7);
  });

  test('returns tag string in repo with tag', () => {
    const dir = getTempDir('with-tag');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
      'git tag --no-sign -m "v123" v123',
    ]);
    const result = gitRef(dir);
    assert.is(result, 'v123');
  });

  test('returns latest ref as the git tree changes', () => {
    const dir = getTempDir('multiple-changes');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = gitRef(dir);
    assert.type(result1, 'string');
    assert.is(result1.length, 7);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = gitRef(dir);
    assert.type(result2, 'string');
    assert.is(result2.length, 7);
    assert.is.not(result1, result2);
    execCmds(dir, ['git tag --no-sign -m "v1" v1']);
    const result3 = gitRef(dir);
    assert.is(result3, 'v1');
    assert.is.not(result2, result3);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
      'git tag --no-sign -m "v2" v2',
    ]);
    const result4 = gitRef(dir);
    assert.is(result4, 'v2');
    assert.is.not(result3, result4);
    execCmds(dir, [
      'touch file4.txt',
      'git add file4.txt',
      'git commit --quiet --no-gpg-sign -m "commit4"',
    ]);
    const result5 = gitRef(dir);
    assert.is(result5.length, 13);
    assert.ok(result5.startsWith('v2-1-'));
    assert.is.not(result4, result5);
  });

  test('appends "-dev" in repo with dirty tree (uncommitted changes)', () => {
    const dir = getTempDir('dirty-tree');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
      'touch file2.txt',
      'git add file2.txt',
    ]);
    const result = gitRef(dir);
    assert.type(result, 'string');
    assert.ok(result.endsWith('-dev'));
  });

  test('appends "-broken" in repo with broken tree', () => {
    const dir = getTempDir('broken-tree');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
      "sed -i 's/file.txt/corrupted.txt/g' ./.git/index",
    ]);
    const result = gitRef(dir);
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

  test('returns latest hash as the git tree changes', () => {
    const dir = getTempDir('multiple-changes');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = gitHash(undefined, dir);
    assert.type(result1, 'string');
    assert.is(result1.length, 7);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = gitHash(undefined, dir);
    assert.type(result2, 'string');
    assert.is(result2.length, 7);
    assert.is.not(result1, result2);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = gitHash(undefined, dir);
    assert.is(result3.length, 7);
    assert.is.not(result2, result3);
  });
});

describe('isDirty', (test) => {
  test.before(createTempDir);
  test.after(deleteTempDir);

  test('returns false in non-git dir', () => {
    const dir = getTempDir('not-git');
    const result = isDirty(dir);
    assert.is(result, false);
  });

  test('returns false in repo without commits', () => {
    const dir = getTempDir('no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = isDirty(dir);
    assert.is(result, false);
  });

  test('returns true in repo with uncommitted new file', () => {
    const dir = getTempDir('uncommitted-file');
    execCmds(dir, ['git init --quiet', 'touch file.txt']);
    const result = isDirty(dir);
    assert.is(result, true);
  });

  test('returns correct state as the git tree changes', () => {
    const dir = getTempDir('multiple-changes');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
    ]);
    const result1 = isDirty(dir);
    assert.is(result1, true);
    execCmds(dir, [
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result2 = isDirty(dir);
    assert.is(result2, false);
    execCmds(dir, ['touch file2.txt', 'git add file2.txt']);
    const result3 = isDirty(dir);
    assert.is(result3, true);
    execCmds(dir, ['git commit --quiet --no-gpg-sign -m "commit2"']);
    const result4 = isDirty(dir);
    assert.is(result4, false);
  });
});

describe('fromClosestTag', (test) => {
  test.before(createTempDir);
  test.after(deleteTempDir);

  test('returns -1 in non-git dir', () => {
    const dir = getTempDir('not-git');
    const result = fromClosestTag(dir);
    assert.is(result, -1);
  });

  test('returns -1 in repo without commits', () => {
    const dir = getTempDir('no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = fromClosestTag(dir);
    assert.is(result, -1);
  });

  test('returns -1 in repo with uncommitted new file', () => {
    const dir = getTempDir('uncommitted-file');
    execCmds(dir, ['git init --quiet', 'touch file.txt']);
    const result = fromClosestTag(dir);
    assert.is(result, -1);
  });

  test('returns 0 in repo with no tags', () => {
    const dir = getTempDir('with-commit');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = fromClosestTag(dir);
    assert.type(result1, 'number');
    assert.is(result1, 0);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = fromClosestTag(dir);
    assert.type(result2, 'number');
    assert.is(result2, 0);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = fromClosestTag(dir);
    assert.type(result3, 'number');
    assert.is(result3, 0);
  });

  test('returns count in repo with commits after tag', () => {
    const dir = getTempDir('tag-commits');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = fromClosestTag(dir);
    assert.type(result1, 'number');
    assert.is(result1, 0);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
      'git tag --no-sign -m "v1" v1',
    ]);
    const result2 = fromClosestTag(dir);
    assert.type(result2, 'number');
    assert.is(result2, 0);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = fromClosestTag(dir);
    assert.type(result3, 'number');
    assert.is(result3, 1);
    execCmds(dir, [
      'touch file4.txt',
      'git add file4.txt',
      'git commit --quiet --no-gpg-sign -m "commit4"',
    ]);
    const result4 = fromClosestTag(dir);
    assert.type(result4, 'number');
    assert.is(result4, 2);
    execCmds(dir, [
      'touch file5.txt',
      'git add file5.txt',
      'git commit --quiet --no-gpg-sign -m "commit5"',
      'git tag --no-sign -m "v2" v2',
    ]);
    const result5 = fromClosestTag(dir);
    assert.type(result5, 'number');
    assert.is(result5, 0);
    execCmds(dir, [
      'touch file6.txt',
      'git add file6.txt',
      'git commit --quiet --no-gpg-sign -m "commit6"',
    ]);
    const result6 = fromClosestTag(dir);
    assert.type(result6, 'number');
    assert.is(result6, 1);
  });
});
