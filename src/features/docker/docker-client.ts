import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { promisify } from "node:util";
import type { DockerAction } from "./types";
import type { ComposeService } from "./types";

const execFileAsync = promisify(execFile);
const DOCKER_PATHS = [
  "/Applications/Docker.app/Contents/Resources/bin/docker",
  "/opt/homebrew/bin/docker",
  "/usr/local/bin/docker",
] as const;

export function dockerArguments(action: DockerAction): string[] {
  switch (action) {
    case "start":
      return ["compose", "up", "-d"];
    case "stop":
      return ["compose", "stop"];
    case "logs":
      return ["compose", "logs", "--tail", "200"];
  }
}

function composeService(value: unknown): ComposeService | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  if (typeof record.Service !== "string" || record.Service.length === 0) return undefined;

  return {
    name: typeof record.Name === "string" && record.Name.length > 0 ? record.Name : record.Service,
    service: record.Service,
    state: typeof record.State === "string" && record.State.length > 0 ? record.State : "unknown",
    status: typeof record.Status === "string" ? record.Status : "",
  };
}

export function parseComposeServices(output: string): ComposeService[] {
  const value = output.trim();
  if (!value) return [];

  if (value.startsWith("[")) {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(composeService).filter((service) => service !== undefined) : [];
  }

  return value
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => composeService(JSON.parse(line)))
    .filter((service) => service !== undefined);
}

async function resolveDockerPath(): Promise<string> {
  for (const path of DOCKER_PATHS) {
    try {
      await access(path, constants.X_OK);
      return path;
    } catch {
      // Keep checking the known macOS Docker locations.
    }
  }

  throw new Error("Docker is not installed in a supported location.");
}

export async function readComposeServices(path: string): Promise<ComposeService[]> {
  const dockerPath = await resolveDockerPath();
  const { stdout } = await execFileAsync(dockerPath, ["compose", "ps", "--format", "json"], {
    cwd: path,
    encoding: "utf8",
  });
  return parseComposeServices(stdout);
}

export async function runComposeAction(path: string, action: DockerAction): Promise<string> {
  const dockerPath = await resolveDockerPath();
  const { stdout } = await execFileAsync(dockerPath, dockerArguments(action), { cwd: path, encoding: "utf8" });
  return stdout;
}
