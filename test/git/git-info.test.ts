import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { readGitInfo, toGitHubUrl } from "../../src/features/git/git-info";

const execFileAsync = promisify(execFile);

describe("toGitHubUrl", () => {
  it.each([
    ["git@github.com:owner/repo.git", "https://github.com/owner/repo"],
    ["git@github-iibrahim908:iibrahim908/Orbit.git", "https://github.com/iibrahim908/Orbit"],
    ["https://github.com/owner/repo.git", "https://github.com/owner/repo"],
  ])("converts %s", (remote, expected) => expect(toGitHubUrl(remote)).toBe(expected));

  it("rejects non-GitHub remotes", () => {
    expect(toGitHubUrl("git@gitlab.com:owner/repo.git")).toBeUndefined();
  });

  it("reads the current branch and origin without changing the repository", async () => {
    const path = await mkdtemp(join(tmpdir(), "command-center-git-"));
    try {
      await execFileAsync("/usr/bin/git", ["init", "-b", "feature/test", path]);
      await execFileAsync("/usr/bin/git", ["-C", path, "remote", "add", "origin", "git@github.com:owner/repo.git"]);

      expect(await readGitInfo(path)).toEqual({
        branch: "feature/test",
        githubUrl: "https://github.com/owner/repo",
      });
    } finally {
      await rm(path, { recursive: true, force: true });
    }
  });
});
