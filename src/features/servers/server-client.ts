import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { LocalServer } from "./types";

const execFileAsync = promisify(execFile);

type LsofExecutor = (file: string, arguments_: readonly string[]) => Promise<{ stdout: string | Buffer }>;

async function executeLsof(file: string, arguments_: readonly string[]): Promise<{ stdout: string | Buffer }> {
  const { stdout } = await execFileAsync(file, arguments_);
  return { stdout };
}

export function parseListeningProcesses(output: string): LocalServer[] {
  const servers = new Map<string, LocalServer>();

  for (const line of output.split("\n")) {
    const match = line.match(/^(\S+)\s+(\d+)\s+.*\bTCP\b.*:(\d+)\s+\(LISTEN\)\s*$/);
    if (!match) continue;

    const [, command, pidValue, portValue] = match;
    const pid = Number(pidValue);
    const port = Number(portValue);
    if (!Number.isInteger(pid) || pid <= 0 || !Number.isInteger(port) || port < 1 || port > 65535) continue;

    const key = `${pid}:${port}`;
    if (!servers.has(key)) {
      servers.set(key, { command, pid, port, url: `http://localhost:${port}` });
    }
  }

  return [...servers.values()].sort((left, right) => left.port - right.port || left.pid - right.pid);
}

export function isServerStillListening(target: LocalServer, servers: LocalServer[]): boolean {
  return servers.some(
    (server) => server.command === target.command && server.pid === target.pid && server.port === target.port,
  );
}

export async function readListeningProcesses(execute: LsofExecutor = executeLsof): Promise<LocalServer[]> {
  try {
    const { stdout } = await execute("/usr/sbin/lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"]);
    return parseListeningProcesses(String(stdout));
  } catch (error) {
    const failure = error as { code?: number | string; stdout?: string | Buffer };
    if (Number(failure.code) === 1 && String(failure.stdout ?? "").trim() === "") return [];
    throw error;
  }
}
