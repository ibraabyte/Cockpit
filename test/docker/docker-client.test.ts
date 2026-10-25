import { describe, expect, it } from "vitest";
import { dockerArguments, parseComposeServices } from "../../src/features/docker/docker-client";

describe("dockerArguments", () => {
  it("creates fixed compose argument arrays", () => {
    expect(dockerArguments("start")).toEqual(["compose", "up", "-d"]);
    expect(dockerArguments("stop")).toEqual(["compose", "stop"]);
    expect(dockerArguments("logs")).toEqual(["compose", "logs", "--tail", "200"]);
  });
});

describe("parseComposeServices", () => {
  it("parses compose JSON lines into service state", () => {
    const output = [
      JSON.stringify({ Name: "web-1", Service: "web", State: "running", Status: "Up 2 minutes" }),
      JSON.stringify({ Name: "db-1", Service: "db", State: "exited", Status: "Exited (0)" }),
    ].join("\n");

    expect(parseComposeServices(output)).toEqual([
      { name: "web-1", service: "web", state: "running", status: "Up 2 minutes" },
      { name: "db-1", service: "db", state: "exited", status: "Exited (0)" },
    ]);
  });
});
