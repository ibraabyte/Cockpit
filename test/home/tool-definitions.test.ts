import { describe, expect, it } from "vitest";
import { toolDefinitions } from "../../src/features/home/tool-definitions";

describe("toolDefinitions", () => {
  it("keeps the Cockpit tools in product order", () => {
    expect(toolDefinitions.map((tool) => tool.id)).toEqual(["projects", "git", "docker", "servers"]);
  });
});
