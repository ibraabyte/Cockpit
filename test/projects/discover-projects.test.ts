import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { discoverProjects } from "../../src/features/projects/discover-projects";

const execFileAsync = promisify(execFile);
let root: string | undefined;

afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
  root = undefined;
});

describe("discoverProjects", () => {
  it("classifies immediate child projects and ignores nested projects", async () => {
    root = await mkdtemp(join(tmpdir(), "command-center-"));
    const web = join(root, "Web App");
    const api = join(root, "API");
    const nested = join(web, "nested");
    await mkdir(nested, { recursive: true });
    await mkdir(api);
    await writeFile(join(web, "package.json"), JSON.stringify({ dependencies: { next: "15.0.0" } }));
    await writeFile(join(web, "compose.yaml"), "services: {}\n");
    await writeFile(join(nested, "manage.py"), "");
    await writeFile(join(api, "manage.py"), "");
    await writeFile(join(api, "pyproject.toml"), "[project]\nname='api'\n");

    expect(await discoverProjects(root)).toEqual([
      { name: "API", path: api, kinds: ["django", "python"], devUrl: "http://localhost:8000" },
      { name: "Web App", path: web, kinds: ["nextjs", "docker"], devUrl: "http://localhost:3000" },
    ]);
  });

  it("skips folders without supported marker files", async () => {
    root = await mkdtemp(join(tmpdir(), "command-center-"));
    await mkdir(join(root, "Notes"));
    expect(await discoverProjects(root)).toEqual([]);
  });

  it("adds read-only Git information to a discovered project", async () => {
    root = await mkdtemp(join(tmpdir(), "command-center-"));
    const project = join(root, "Python Project");
    await mkdir(project);
    await writeFile(join(project, "pyproject.toml"), "[project]\nname='python-project'\n");
    await execFileAsync("/usr/bin/git", ["init", "-b", "main", project]);
    await execFileAsync("/usr/bin/git", [
      "-C",
      project,
      "remote",
      "add",
      "origin",
      "git@github.com:owner/python-project.git",
    ]);

    expect(await discoverProjects(root)).toEqual([
      {
        name: "Python Project",
        path: project,
        kinds: ["python"],
        branch: "main",
        githubUrl: "https://github.com/owner/python-project",
        devUrl: undefined,
      },
    ]);
  });
});
