import { test } from 'uvu';
import * as assert from 'uvu/assert';
import defaultGitRef, { gitRef } from '../src/index';

test('has a default export', () => {
  assert.type(defaultGitRef, 'function');
});

test('has a named export', () => {
  assert.type(gitRef, 'function');
});

test('returns a non-empty string', () => {
  const result = gitRef();
  assert.is.not(result, '');
  assert.type(result, 'string');
});

test('returns a git reference', () => {
  const result = gitRef();
  assert.is(/^v\d+\.\d+\.\d+/.test(result), true, 'matches expected format');
});

// TODO: Run in various other sample git repos, e.g.:
// - without any commits
// - with commits but without any tags
// - with multiple tags
// - with a dirty tree (uncommitted changes)
// - in a broken repo
// - not in a git repo
// - in a git repo with commits but no HEAD ref

test.run();
