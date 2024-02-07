import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

interface Context {
  tmpDir?: string | undefined;
}

export async function createTempDir(context: Context): Promise<void> {
  if (context.tmpDir) {
    throw new Error('Temp directory exists, did you forget to call deleteTempDir()');
  }

  context.tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'git-ref-test-'));
}

export async function deleteTempDir(context: Context): Promise<void> {
  if (!context.tmpDir) {
    throw new Error('No temp directory exists, you need to call createTempDir() first');
  }

  await fs.promises.rm(context.tmpDir, {
    force: true,
    recursive: true,
  });

  context.tmpDir = undefined;
}

export function getTempDir(context: Context, subDir?: string): string {
  if (!context.tmpDir) {
    throw new Error('No temp directory exists, you need to call createTempDir() first');
  }

  if (subDir) {
    const newDir = path.join(context.tmpDir, subDir);
    fs.mkdirSync(newDir);
    return newDir;
  }

  return context.tmpDir;
}

export function execCmds(dir: string, cmds: string[]): void {
  for (const cmd of cmds) {
    execSync(cmd, {
      cwd: dir,
      timeout: 2000,
    });
  }
}
