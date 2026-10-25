import { execFile } from "node:child_process";
import { appendFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { gitStatusEnvironment, parseGitStatus, readGitStatus } from "../../src/features/git/git-status";

const execFileAsync = promisify(execFile);

describe("parseGitStatus", () => {
  it("counts staged, changed, and untracked files", () => {
    expect(parseGitStatus("M  staged.ts\n M changed.ts\n?? new.ts\n")).toEqual({
      staged: 1,
      changed: 1,
      untracked: 1,
      clean: false,
    });
  });

  it("reports an empty status as clean", () => {
    expect(parseGitStatus("")).toEqual({ staged: 0, changed: 0, untracked: 0, clean: true });
  });

  it("reads repository status without changing it", async () => {
    const path = await mkdtemp(join(tmpdir(), "cockpit-git-status-"));
    try {
      await execFileAsync("/usr/bin/git", ["init", "-b", "feature/status", path]);
      await writeFile(join(path, "changed.ts"), "first\n");
      await execFileAsync("/usr/bin/git", ["-C", path, "add", "changed.ts"]);
      await appendFile(join(path, "changed.ts"), "second\n");
      await writeFile(join(path, "new.ts"), "new\n");

      expect(await readGitStatus(path)).toEqual({ staged: 1, changed: 1, untracked: 1, clean: false });
    } finally {
      await rm(path, { recursive: true, force: true });
    }
  });

  it("returns undefined outside a Git repository", async () => {
    const path = await mkdtemp(join(tmpdir(), "cockpit-no-git-"));
    try {
      expect(await readGitStatus(path)).toBeUndefined();
    } finally {
      await rm(path, { recursive: true, force: true });
    }
  });

  it("disables optional Git locks", () => {
    expect(gitStatusEnvironment({ PATH: "/usr/bin" })).toEqual({
      PATH: "/usr/bin",
      GIT_OPTIONAL_LOCKS: "0",
    });
  });
});
