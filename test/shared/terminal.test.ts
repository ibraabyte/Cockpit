import { describe, expect, it } from "vitest";
import { terminalArguments } from "../../src/shared/terminal";

describe("terminalArguments", () => {
  it("passes paths as separate arguments even when they contain shell characters", () => {
    const args = terminalArguments("/tmp/project $(touch bad)", "/tmp/tool name");
    expect(args.at(-2)).toBe("/tmp/project $(touch bad)");
    expect(args.at(-1)).toBe("/tmp/tool name");
    expect(args[1]).not.toContain("touch bad");
  });
});
