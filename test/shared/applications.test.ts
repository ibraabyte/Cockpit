import { describe, expect, it } from "vitest";
import { findDeveloperApplications } from "../../src/shared/applications";

describe("findDeveloperApplications", () => {
  it("returns supported installed apps in Cockpit order", () => {
    const installed = [
      { name: "Warp", path: "/Applications/Warp.app" },
      { name: "Cursor", path: "/Applications/Cursor.app" },
      { name: "Notes", path: "/System/Applications/Notes.app" },
      { name: "Zed", path: "/Applications/Zed.app" },
    ];

    expect(findDeveloperApplications(installed as never)).toEqual([
      { id: "cursor", name: "Cursor", path: "/Applications/Cursor.app" },
      { id: "zed", name: "Zed", path: "/Applications/Zed.app" },
      { id: "warp", name: "Warp", path: "/Applications/Warp.app" },
    ]);
  });

  it("omits supported apps that are not installed", () => {
    const installed = [{ name: "Zed", path: "/Applications/Zed.app" }];

    expect(findDeveloperApplications(installed as never)).toEqual([
      { id: "zed", name: "Zed", path: "/Applications/Zed.app" },
    ]);
  });

  it("matches common macOS application names", () => {
    const installed = [
      { name: "Docker", path: "/Applications/Docker.app" },
      { name: "iTerm2", path: "/Applications/iTerm.app" },
      { name: "Code", path: "/Applications/Visual Studio Code.app" },
    ];

    expect(findDeveloperApplications(installed as never)).toEqual([
      { id: "vscode", name: "Visual Studio Code", path: "/Applications/Visual Studio Code.app" },
      { id: "iterm", name: "iTerm", path: "/Applications/iTerm.app" },
      { id: "docker-desktop", name: "Docker Desktop", path: "/Applications/Docker.app" },
    ]);
  });
});
