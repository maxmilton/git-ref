import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { suite } from 'uvu';

export function describe(
  name: string,
  fn: (test: ReturnType<typeof suite>) => void,
): void {
  const testSuite = suite(name);
  fn(testSuite);
  testSuite.run();
}

let tmpDir: string | undefined;

export async function createTempDir(): Promise<void> {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-ref-test-'));
}

export async function deleteTempDir(): Promise<void> {
  if (!tmpDir) {
    throw new Error(
      'No temp directory exists, you need to call createTempDir() first',
    );
  }

  await fs.promises.rm(tmpDir, {
    force: true,
    recursive: true,
  });

  tmpDir = undefined;
}

export function getTempDir(subDir?: string): string {
  if (!tmpDir) {
    throw new Error(
      'No temp directory exists, you need to call createTempDir() first',
    );
  }

  if (subDir) {
    const newDir = path.join(tmpDir, subDir);
    fs.mkdirSync(newDir);
    return newDir;
  }

  return tmpDir;
}

export function execCmds(dir: string, cmds: string[]): void {
  cmds.forEach((cmd) => {
    execSync(cmd, {
      cwd: dir,
      timeout: 2000,
    });
  });
}
