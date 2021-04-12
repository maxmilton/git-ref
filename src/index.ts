import { execSync } from 'child_process';

/**
 * Get the current git reference via `git describe`.
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
