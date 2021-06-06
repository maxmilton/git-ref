import { execSync } from 'child_process';

/**
 * Get the HEAD git reference via `git describe`.
 *
 * @see <https://git-scm.com/docs/git-describe>
 *
 * @param args - Additional arguments to pass to `git describe`. The default
 * is `'--dirty="-dev" --broken'`.
 * @returns A human readable git reference.
 */
export function gitRef(args = '--dirty="-dev" --broken'): string {
  let reference = '';

  try {
    const result = execSync(`git describe --always ${args}`) || '';
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
 * @returns The git commit hash.
 */
export function gitHash(long?: boolean): string {
  let hash = '';

  try {
    const result = execSync(`git rev-parse${long ? '' : ' --short'} HEAD`) || '';
    hash = result.toString().trim();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return hash;
}
