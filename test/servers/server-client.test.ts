import { describe, expect, it } from "vitest";
import {
  isServerStillListening,
  parseListeningProcesses,
  readListeningProcesses,
} from "../../src/features/servers/server-client";

describe("parseListeningProcesses", () => {
  it("parses a local listening process", () => {
    const output = "node 4321 ibrahim 22u IPv6 TCP *:3000 (LISTEN)";

    expect(parseListeningProcesses(output)).toEqual([
      { command: "node", pid: 4321, port: 3000, url: "http://localhost:3000" },
    ]);
  });

  it("sorts by port and removes repeated process-port pairs", () => {
    const output = [
      "python 900 ibrahim 10u IPv4 TCP 127.0.0.1:8000 (LISTEN)",
      "node 4321 ibrahim 22u IPv6 TCP *:3000 (LISTEN)",
      "node 4321 ibrahim 23u IPv4 TCP 127.0.0.1:3000 (LISTEN)",
    ].join("\n");

    expect(parseListeningProcesses(output)).toEqual([
      { command: "node", pid: 4321, port: 3000, url: "http://localhost:3000" },
      { command: "python", pid: 900, port: 8000, url: "http://localhost:8000" },
    ]);
  });

  it("ignores invalid PIDs, ports, and unrelated lines", () => {
    const output = [
      "COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME",
      "node 0 ibrahim 22u IPv6 TCP *:3000 (LISTEN)",
      "node 4321 ibrahim 22u IPv6 TCP *:0 (LISTEN)",
      "node 4321 ibrahim 22u IPv6 TCP *:65536 (LISTEN)",
      "node 4321 ibrahim 22u IPv6 UDP *:3000",
    ].join("\n");

    expect(parseListeningProcesses(output)).toEqual([]);
  });

  it("requires the command, PID, and port to still match", () => {
    const target = { command: "node", pid: 4321, port: 3000, url: "http://localhost:3000" };

    expect(isServerStillListening(target, [target])).toBe(true);
    expect(
      isServerStillListening(target, [
        { command: "python", pid: 4321, port: 3000, url: "http://localhost:3000" },
      ]),
    ).toBe(false);
  });

  it("returns an empty list when lsof finds no listeners", async () => {
    const execute = async () => {
      throw Object.assign(new Error("No results"), { code: 1, stdout: "" });
    };

    await expect(readListeningProcesses(execute)).resolves.toEqual([]);
  });
});
