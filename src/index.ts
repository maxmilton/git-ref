/* eslint-disable no-console */

import { execSync } from 'child_process';

/**
 * Get the HEAD git reference via [git describe](https://git-scm.com/docs/git-describe).
 *
 * @param cwd - Modify the working directory git is executed in (default is the
 * directory of the current node process).
 * @returns A human readable git reference.
 */
export function gitRef(cwd?: string): string {
  let reference = '';

  try {
    const result = execSync('git describe --always --dirty="-dev" --broken', {
      cwd,
    });
    reference = result.toString().trim();
  } catch (error) {
    console.error(error);
  }

  return reference;
}

export default gitRef;

/**
 * Get the HEAD commit hash.
 *
 * @param long - Get the full git hash instead of a short hash in the form of
 * the first 7 characters (default `false`).
 * @param cwd - Modify the working directory git is executed in (default is the
 * directory of the current node process).
 * @returns A git commit hash.
 */
export function gitHash(long?: boolean, cwd?: string): string {
  let hash = '';

  try {
    const result = execSync(`git rev-parse${long ? '' : ' --short'} HEAD`, {
      cwd,
    });
    hash = result.toString().trim();
  } catch (error) {
    console.error(error);
  }

  return hash;
}

/**
 * Detect git tree dirty state (uncommitted changes).
 *
 * @param cwd - Modify the working directory git is executed in (default is the
 * directory of the current node process).
 * @returns The dirty state e.g., `true` when there are uncommitted changes.
 */
export function isDirty(cwd?: string): boolean {
  let dirty = false;

  try {
    const result = execSync('git status --porcelain', { cwd });
    dirty = !!result.toString().trim();
  } catch (error) {
    console.error(error);
  }

  return dirty;
}

/**
 * Get the number of commits from the closest tagged commit to the HEAD commit.
 *
 * Note: Unix only due to shell command substitution.
 *
 * @param cwd - Modify the working directory git is executed in (default is the
 * directory of the current node process).
 * @returns The number of commits from closest tag to HEAD or -1 when error.
 */
export function fromClosestTag(cwd?: string): number {
  let count = -1;

  try {
    const result = execSync(
      'git rev-list $(git describe --abbrev=0)..HEAD --count',
      { cwd },
    );
    count = +result.toString().trim();
  } catch (error) {
    console.error(error);
  }

  return count;
}

/**
 * Get the HEAD branch name.
 *
 * @param cwd - Modify the working directory git is executed in (default is the
 * directory of the current node process).
 * @returns The branch name or an empty string when error.
 */
export function branchName(cwd?: string): string {
  let branch = '';

  try {
    const result = execSync('git rev-parse --abbrev-ref HEAD', { cwd });
    branch = result.toString().trim();
  } catch (error) {
    console.error(error);
  }

  return branch;
}
