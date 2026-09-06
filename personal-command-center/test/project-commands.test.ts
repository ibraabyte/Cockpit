import { describe, expect, it } from "vitest";
import { developmentCommands } from "../src/project-commands";

describe("developmentCommands", () => {
  it("returns copyable commands for Next.js, Django, and Docker capabilities", () => {
    expect(developmentCommands(["nextjs", "django", "python", "docker"])).toEqual([
      { title: "Copy Next.js Dev Command", value: "npm run dev" },
      { title: "Copy Django Dev Command", value: "python manage.py runserver" },
      { title: "Copy Docker Up Command", value: "docker compose up" },
      { title: "Copy Docker Down Command", value: "docker compose down" },
      { title: "Copy Docker Logs Command", value: "docker compose logs -f" },
    ]);
  });

  it("returns no executable command for a plain Python project", () => {
    expect(developmentCommands(["python"])).toEqual([]);
  });
});
