import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import * as allExports from '../src/index';
import { branchName, fromClosestTag, gitHash, gitRef, isDirty } from '../src/index';
import { createTempDir, deleteTempDir, execCmds, getTempDir } from './utils';

const publicExports = [
  ['default', 1],
  ['gitRef', 1],
  ['gitHash', 2],
  ['isDirty', 1],
  ['fromClosestTag', 1],
  ['branchName', 1],
] as const;

describe('exports', () => {
  for (const [name, args] of publicExports) {
    test(`has a "${name}" export`, () => {
      expect(name in allExports).toBeTruthy();
      expect(allExports[name]).toBeInstanceOf(Function);
      expect(allExports[name]).toHaveLength(args); // number of arguments
    });
  }

  test('default export is gitRef', () => {
    expect(allExports.default).toBe(gitRef);
  });

  test('has no other exports', () => {
    const exportNames = publicExports.map(([name]) => name);
    const allExportsKeys = Object.keys(allExports);
    for (const key of allExportsKeys) {
      expect(exportNames).toContain(key);
    }
    expect(allExportsKeys).toHaveLength(exportNames.length);
  });
});

describe('gitRef', () => {
  const context = {};
  beforeAll(() => createTempDir(context));
  afterAll(() => deleteTempDir(context));

  test('returns a non-empty string', () => {
    const result = gitRef();
    expect(result).toBeString();
    expect(result).not.toBeEmpty();
  });

  test('returns a tag git reference', () => {
    const result = gitRef();
    expect(result).toMatch(/^v\d+\.\d+\.\d+/);
  });

  test('returns empty string in non-git dir', () => {
    const dir = getTempDir(context, 'not-git');
    const result = gitRef(dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns empty string in repo without commits', () => {
    const dir = getTempDir(context, 'no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = gitRef(dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns short hash string in repo with commit but no tag', () => {
    const dir = getTempDir(context, 'with-commit');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file.txt',
      'git add file.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result = gitRef(dir);
    expect(result).toBeString();
    expect(result).toHaveLength(7);
  });

  test('returns tag string in repo with tag', () => {
    const dir = getTempDir(context, 'with-tag');
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
    expect(result).toBe('v123');
  });

  test('returns latest ref as the git tree changes', () => {
    const dir = getTempDir(context, 'multiple-changes');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = gitRef(dir);
    expect(result1).toBeString();
    expect(result1).toHaveLength(7);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = gitRef(dir);
    expect(result2).toBeString();
    expect(result2).toHaveLength(7);
    expect(result1).not.toBe(result2);
    execCmds(dir, ['git tag --no-sign -m "v1" v1']);
    const result3 = gitRef(dir);
    expect(result3).toBe('v1');
    expect(result2).not.toBe(result3);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
      'git tag --no-sign -m "v2" v2',
    ]);
    const result4 = gitRef(dir);
    expect(result4).toBe('v2');
    expect(result3).not.toBe(result4);
    execCmds(dir, [
      'touch file4.txt',
      'git add file4.txt',
      'git commit --quiet --no-gpg-sign -m "commit4"',
    ]);
    const result5 = gitRef(dir);
    expect(result5).toHaveLength(13);
    expect(result5).toStartWith('v2-1-');
    expect(result4).not.toBe(result5);
  });

  test('appends "-dev" in repo with dirty tree (uncommitted changes)', () => {
    const dir = getTempDir(context, 'dirty-tree');
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
    expect(result).toBeString();
    expect(result).toEndWith('-dev');
  });

  test('appends "-broken" in repo with broken tree', () => {
    const dir = getTempDir(context, 'broken-tree');
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
    expect(result).toBeString();
    expect(result).toEndWith('-broken');
  });
});

describe('gitHash', () => {
  const context = {};
  beforeAll(() => createTempDir(context));
  afterAll(() => deleteTempDir(context));

  test('returns a non-empty string', () => {
    const result = gitHash();
    expect(result).toBeString();
    expect(result).not.toBeEmpty();
  });

  test('returns a short git hash by default', () => {
    const result = gitHash();
    expect(result).toHaveLength(7);
  });

  test('returns a long git hash with arg true', () => {
    const result = gitHash(true);
    expect(result).toBeString();
    expect(result).toHaveLength(40);
  });

  test('returns a short git hash with arg false', () => {
    const result = gitHash(false);
    expect(result).toBeString();
    expect(result).toHaveLength(7);
  });

  test('returns empty string in non-git dir', () => {
    const dir = getTempDir(context, 'not-git');
    const result = gitHash(undefined, dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns empty string in repo without commits', () => {
    const dir = getTempDir(context, 'no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = gitHash(undefined, dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns latest hash as the git tree changes', () => {
    const dir = getTempDir(context, 'multiple-changes');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = gitHash(undefined, dir);
    expect(result1).toBeString();
    expect(result1).toHaveLength(7);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = gitHash(undefined, dir);
    expect(result2).toBeString();
    expect(result2).toHaveLength(7);
    expect(result1).not.toBe(result2);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = gitHash(undefined, dir);
    expect(result3).toBeString();
    expect(result3).toHaveLength(7);
    expect(result2).not.toBe(result3);
  });
});

describe('isDirty', () => {
  const context = {};
  beforeAll(() => createTempDir(context));
  afterAll(() => deleteTempDir(context));

  test('returns false in non-git dir', () => {
    const dir = getTempDir(context, 'not-git');
    const result = isDirty(dir);
    expect(result).toBe(false);
  });

  test('returns false in repo without commits', () => {
    const dir = getTempDir(context, 'no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = isDirty(dir);
    expect(result).toBe(false);
  });

  test('returns true in repo with uncommitted new file', () => {
    const dir = getTempDir(context, 'uncommitted-file');
    execCmds(dir, ['git init --quiet', 'touch file.txt']);
    const result = isDirty(dir);
    expect(result).toBe(true);
  });

  test('returns correct state as the git tree changes', () => {
    const dir = getTempDir(context, 'multiple-changes');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
    ]);
    const result1 = isDirty(dir);
    expect(result1).toBe(true);
    execCmds(dir, ['git add file1.txt', 'git commit --quiet --no-gpg-sign -m "commit1"']);
    const result2 = isDirty(dir);
    expect(result2).toBe(false);
    execCmds(dir, ['touch file2.txt', 'git add file2.txt']);
    const result3 = isDirty(dir);
    expect(result3).toBe(true);
    execCmds(dir, ['git commit --quiet --no-gpg-sign -m "commit2"']);
    const result4 = isDirty(dir);
    expect(result4).toBe(false);
  });
});

describe('fromClosestTag', () => {
  const context = {};
  beforeAll(() => createTempDir(context));
  afterAll(() => deleteTempDir(context));

  test('returns -1 in non-git dir', () => {
    const dir = getTempDir(context, 'not-git');
    const result = fromClosestTag(dir);
    expect(result).toBe(-1);
  });

  test('returns -1 in repo without commits', () => {
    const dir = getTempDir(context, 'no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = fromClosestTag(dir);
    expect(result).toBe(-1);
  });

  test('returns -1 in repo with uncommitted new file', () => {
    const dir = getTempDir(context, 'uncommitted-file');
    execCmds(dir, ['git init --quiet', 'touch file.txt']);
    const result = fromClosestTag(dir);
    expect(result).toBe(-1);
  });

  test('returns 0 in repo with no tags', () => {
    const dir = getTempDir(context, 'with-commit');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = fromClosestTag(dir);
    expect(typeof result1).toBe('number');
    expect(result1).toBe(0);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = fromClosestTag(dir);
    expect(typeof result2).toBe('number');
    expect(result2).toBe(0);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = fromClosestTag(dir);
    expect(typeof result3).toBe('number');
    expect(result3).toBe(0);
  });

  test('returns count in repo with commits after tag', () => {
    const dir = getTempDir(context, 'tag-commits');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = fromClosestTag(dir);
    expect(typeof result1).toBe('number');
    expect(result1).toBe(0);
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
      'git tag --no-sign -m "v1" v1',
    ]);
    const result2 = fromClosestTag(dir);
    expect(typeof result2).toBe('number');
    expect(result2).toBe(0);
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = fromClosestTag(dir);
    expect(typeof result3).toBe('number');
    expect(result3).toBe(1);
    execCmds(dir, [
      'touch file4.txt',
      'git add file4.txt',
      'git commit --quiet --no-gpg-sign -m "commit4"',
    ]);
    const result4 = fromClosestTag(dir);
    expect(typeof result4).toBe('number');
    expect(result4).toBe(2);
    execCmds(dir, [
      'touch file5.txt',
      'git add file5.txt',
      'git commit --quiet --no-gpg-sign -m "commit5"',
      'git tag --no-sign -m "v2" v2',
    ]);
    const result5 = fromClosestTag(dir);
    expect(typeof result5).toBe('number');
    expect(result5).toBe(0);
    execCmds(dir, [
      'touch file6.txt',
      'git add file6.txt',
      'git commit --quiet --no-gpg-sign -m "commit6"',
    ]);
    const result6 = fromClosestTag(dir);
    expect(typeof result6).toBe('number');
    expect(result6).toBe(1);
  });
});

describe('branchName', () => {
  const context = {};
  beforeAll(() => createTempDir(context));
  afterAll(() => deleteTempDir(context));

  test('returns empty string in non-git dir', () => {
    const dir = getTempDir(context, 'not-git');
    const result = branchName(dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns empty string in repo without commits', () => {
    const dir = getTempDir(context, 'no-commit');
    execCmds(dir, ['git init --quiet']);
    const result = branchName(dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns empty string in repo with uncommitted new file', () => {
    const dir = getTempDir(context, 'uncommitted-file');
    execCmds(dir, ['git init --quiet', 'touch file.txt']);
    const result = branchName(dir);
    expect(result).toBeString();
    expect(result).toBeEmpty();
  });

  test('returns correct branch name in repo with commits', () => {
    const dir = getTempDir(context, 'with-commit');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = branchName(dir);
    expect(result1).toBe('master');
    execCmds(dir, [
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
    ]);
    const result2 = branchName(dir);
    expect(result2).toBe('master');
    execCmds(dir, [
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
    ]);
    const result3 = branchName(dir);
    expect(result3).toBe('master');
    execCmds(dir, ['git checkout -b new-branch']);
    const result4 = branchName(dir);
    expect(result4).toBe('new-branch');
    execCmds(dir, [
      'touch file4.txt',
      'git add file4.txt',
      'git commit --quiet --no-gpg-sign -m "commit4"',
    ]);
    const result5 = branchName(dir);
    expect(result5).toBe('new-branch');
    execCmds(dir, [
      'touch file5.txt',
      'git add file5.txt',
      'git commit --quiet --no-gpg-sign -m "commit5"',
    ]);
    const result6 = branchName(dir);
    expect(result6).toBe('new-branch');
    execCmds(dir, ['git checkout master']);
    const result7 = branchName(dir);
    expect(result7).toBe('master');
    execCmds(dir, [
      'touch file6.txt',
      'git add file6.txt',
      'git commit --quiet --no-gpg-sign -m "commit6"',
    ]);
  });

  test('returns correct branch name in repo with commits and tags', () => {
    const dir = getTempDir(context, 'with-tag');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = branchName(dir);
    expect(result1).toBe('master');
    execCmds(dir, [
      'git checkout -b new-branch',
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
      'git tag --no-sign -m "v1" v1',
    ]);
    const result2 = branchName(dir);
    expect(result2).toBe('new-branch');
  });

  test('returns correct branch name in repo with commits and detached HEAD', () => {
    const dir = getTempDir(context, 'detached-head');
    execCmds(dir, [
      'git init --quiet',
      'git config user.email "test@test.com"',
      'git config user.name "Test Test"',
      'touch file1.txt',
      'git add file1.txt',
      'git commit --quiet --no-gpg-sign -m "commit1"',
    ]);
    const result1 = branchName(dir);
    expect(result1).toBe('master');
    execCmds(dir, [
      'git checkout -b new-branch',
      'touch file2.txt',
      'git add file2.txt',
      'git commit --quiet --no-gpg-sign -m "commit2"',
      'git checkout master',
      'git checkout --detach',
    ]);
    const result2 = branchName(dir);
    expect(result2).toBe('HEAD');
    execCmds(dir, [
      'git checkout -b new-branch2',
      'touch file3.txt',
      'git add file3.txt',
      'git commit --quiet --no-gpg-sign -m "commit3"',
      'git checkout master',
      'git checkout --detach',
    ]);
    const result3 = branchName(dir);
    expect(result3).toBe('HEAD');
    execCmds(dir, ['git checkout new-branch']);
    const result4 = branchName(dir);
    expect(result4).toBe('new-branch');
  });
});
