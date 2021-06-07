import { execSync } from 'child_process';

/**
 * Get the HEAD git reference via `git describe`.
 *
 * @see <https://git-scm.com/docs/git-describe>
 *
 * @param args - Additional arguments to pass to `git describe`. The default
 * is `'--dirty="-dev" --broken'`.
 * @param cwd - Modify the working directory git is executed in (default is the
 * directory of the current node process).
 * @returns A human readable git reference.
 */
export function gitRef(args = '--dirty="-dev" --broken', cwd?: string): string {
  let reference = '';

  try {
    const result = execSync(`git describe --always ${args}`, { cwd });
    reference = result.toString().trim();
  } catch (error) {
    // eslint-disable-next-line no-console
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
 * @returns The git commit hash.
 */
export function gitHash(long?: boolean, cwd?: string): string {
  let hash = '';

  try {
    const result = execSync(`git rev-parse${long ? '' : ' --short'} HEAD`, {
      cwd,
    });
    hash = result.toString().trim();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return hash;
}
