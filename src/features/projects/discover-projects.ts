import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { readGitInfo } from "../git/git-info";
import { composeFiles, type Project, type ProjectKind } from "./types";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function isNextProject(path: string): Promise<boolean> {
  try {
    const value = JSON.parse(await readFile(join(path, "package.json"), "utf8"));
    return Boolean(value.dependencies?.next || value.devDependencies?.next);
  } catch {
    return false;
  }
}

async function classify(path: string): Promise<ProjectKind[]> {
  const kinds: ProjectKind[] = [];
  const django = await exists(join(path, "manage.py"));
  const python =
    django || (await exists(join(path, "pyproject.toml"))) || (await exists(join(path, "requirements.txt")));
  if (await isNextProject(path)) kinds.push("nextjs");
  if (django) kinds.push("django");
  if (python) kinds.push("python");
  if ((await Promise.all(composeFiles.map((file) => exists(join(path, file))))).some(Boolean)) kinds.push("docker");
  return kinds;
}

export async function discoverProjects(root: string): Promise<Project[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const projects = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map(async (entry): Promise<Project | undefined> => {
        const path = join(root, entry.name);
        const kinds = await classify(path);
        if (kinds.length === 0) return undefined;
        const devUrl = kinds.includes("nextjs")
          ? "http://localhost:3000"
          : kinds.includes("django")
            ? "http://localhost:8000"
            : undefined;
        return { name: entry.name, path, kinds, devUrl };
      }),
  );
  const sorted = projects
    .filter((project): project is Project => Boolean(project))
    .sort((a, b) => a.name.localeCompare(b.name));
  return Promise.all(sorted.map(async (project) => ({ ...project, ...(await readGitInfo(project.path)) })));
}
