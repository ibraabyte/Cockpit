import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type GitStatus = {
  staged: number;
  changed: number;
  untracked: number;
  clean: boolean;
};

export function gitStatusEnvironment(environment: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return { ...environment, GIT_OPTIONAL_LOCKS: "0" };
}

export function parseGitStatus(output: string): GitStatus {
  let staged = 0;
  let changed = 0;
  let untracked = 0;

  for (const line of output.split("\n")) {
    if (!line) continue;
    if (line.startsWith("??")) {
      untracked += 1;
      continue;
    }
    if (line[0] && line[0] !== " ") staged += 1;
    if (line[1] && line[1] !== " ") changed += 1;
  }

  return { staged, changed, untracked, clean: staged + changed + untracked === 0 };
}

export async function readGitStatus(path: string): Promise<GitStatus | undefined> {
  try {
    const { stdout } = await execFileAsync("/usr/bin/git", ["-C", path, "status", "--porcelain=v1"], {
      env: gitStatusEnvironment(),
    });
    return parseGitStatus(stdout);
  } catch {
    return undefined;
  }
}
