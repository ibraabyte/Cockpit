import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Project } from "../projects/types";

const execFileAsync = promisify(execFile);

export function toGitHubUrl(remote: string): string | undefined {
  const value = remote.trim();
  const ssh = value.match(/^git@github(?:\.com|-[^:]+):([^/]+\/.+?)(?:\.git)?$/);
  if (ssh) return `https://github.com/${ssh[1].replace(/\.git$/, "")}`;
  const https = value.match(/^https:\/\/github\.com\/([^/]+\/.+?)(?:\.git)?$/);
  if (https) return `https://github.com/${https[1].replace(/\.git$/, "")}`;
  return undefined;
}

export async function readGitInfo(path: string): Promise<Pick<Project, "branch" | "githubUrl">> {
  const [branchResult, remoteResult] = await Promise.allSettled([
    execFileAsync("/usr/bin/git", ["-C", path, "branch", "--show-current"]),
    execFileAsync("/usr/bin/git", ["-C", path, "remote", "get-url", "origin"]),
  ]);
  const branch = branchResult.status === "fulfilled" ? branchResult.value.stdout.trim() || undefined : undefined;
  const githubUrl = remoteResult.status === "fulfilled" ? toGitHubUrl(remoteResult.value.stdout) : undefined;

  if (branch) return { branch, githubUrl };
  if (githubUrl) return { githubUrl };
  return {};
}
