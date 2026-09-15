# Cockpit Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Cockpit from a single project list into a Raycast home screen containing Projects, Git, Docker, and Servers tools.

**Architecture:** Keep one Raycast command entry point at `src/cockpit.tsx`. Each tool owns its view, data reader, actions, types, and tests under `src/features/<tool>` and `test/<tool>`. Shared application and process helpers stay under `src/shared`.

**Tech Stack:** Raycast API 1.104.23, React, TypeScript 6, Node.js, Vitest 4

## Global Constraints

- Support macOS only.
- Keep project discovery limited to immediate child folders of the configured projects directory.
- Use `execFile` with argument arrays; never interpolate project paths into shell commands.
- Do not read `.env` contents or store secrets.
- Keep Git discovery read-only.
- Require `confirmAlert` before Docker or process state changes.
- Add no runtime dependencies unless the standard library and Raycast API cannot do the job.
- Preserve the existing Projects behavior and all 11 existing tests.
- Do not commit or push unless the user asks.

---

### Task 1: Extract the Projects view

**Files:**
- Create: `src/features/projects/projects-view.tsx`
- Modify: `src/cockpit.tsx`
- Test: `test/projects/discover-projects.test.ts`

**Interfaces:**
- Consumes: `discoverProjects(root: string): Promise<Project[]>`
- Produces: `ProjectsView({ projectsRoot }: { projectsRoot: string }): JSX.Element`

- [ ] **Step 1: Run the existing project tests**

Run: `npm test -- test/projects`

Expected: 5 project tests pass.

- [ ] **Step 2: Move the existing project list into `ProjectsView`**

Create `src/features/projects/projects-view.tsx` with this complete view:

```tsx
import { Icon, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { discoverProjects } from "./discover-projects";
import { ProjectActions } from "./project-actions";

export function ProjectsView({ projectsRoot }: { projectsRoot: string }) {
  const { data = [], isLoading, error } = usePromise(discoverProjects, [projectsRoot]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search development projects…">
      {!isLoading && error ? (
        <List.EmptyView icon={Icon.Warning} title="Could not scan projects" description={error.message} />
      ) : null}
      {!isLoading && !error && data.length === 0 ? (
        <List.EmptyView
          icon={Icon.Folder}
          title="No supported projects found"
          description={`Check the Projects Folder preference: ${projectsRoot}`}
        />
      ) : null}
      {data.map((project) => (
        <List.Item
          key={project.path}
          id={project.path}
          icon={project.kinds.includes("nextjs") ? Icon.Globe : Icon.Code}
          title={project.name}
          subtitle={project.path}
          keywords={[...project.kinds, project.branch ?? "", "codex", "claude", "vscode", "terminal"]}
          accessories={[
            ...project.kinds.map((kind) => ({ tag: kind })),
            ...(project.branch ? [{ text: project.branch, icon: Icon.CodeBlock }] : []),
          ]}
          actions={<ProjectActions project={project} />}
        />
      ))}
    </List>
  );
}
```

- [ ] **Step 3: Make `src/cockpit.tsx` a thin entry point**

```tsx
import { getPreferenceValues } from "@raycast/api";
import { ProjectsView } from "./features/projects/projects-view";

type Preferences = { projectsRoot: string };

export default function Command() {
  const { projectsRoot } = getPreferenceValues<Preferences>();
  return <ProjectsView projectsRoot={projectsRoot} />;
}
```

- [ ] **Step 4: Verify the extraction**

Run: `npm test && npm run lint && npm run build`

Expected: 11 tests pass, lint exits with code 0, and Raycast builds `src/cockpit.tsx`.

### Task 2: Add installed developer applications

**Files:**
- Create: `src/shared/applications.ts`
- Modify: `src/features/projects/projects-view.tsx`
- Modify: `src/features/projects/project-actions.tsx`
- Create: `test/shared/applications.test.ts`

**Interfaces:**
- Consumes: Raycast `getApplications(): Promise<Application[]>`
- Produces: `findDeveloperApplications(applications: Application[]): DeveloperApplication[]`

- [ ] **Step 1: Write the application matching tests**

```ts
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
});
```

- [ ] **Step 2: Run the new test and confirm it fails**

Run: `npm test -- test/shared/applications.test.ts`

Expected: failure because `src/shared/applications.ts` does not exist.

- [ ] **Step 3: Implement application matching**

Support these names in this order: Visual Studio Code, Cursor, Zed, Warp, iTerm, GitHub Desktop, Docker Desktop, Postman, Bruno, TablePlus, and DBeaver. Match against the installed applications returned by Raycast and return only installed matches.

```ts
export type DeveloperApplicationId =
  | "vscode"
  | "cursor"
  | "zed"
  | "warp"
  | "iterm"
  | "github-desktop"
  | "docker-desktop"
  | "postman"
  | "bruno"
  | "tableplus"
  | "dbeaver";

export type DeveloperApplication = {
  id: DeveloperApplicationId;
  name: string;
  path: string;
};
```

- [ ] **Step 4: Add installed apps to project actions**

Load applications once in `ProjectsView` with `usePromise(getApplications)`. Pass the filtered list to `ProjectActions`. Add editor actions for Cursor and Zed, terminal actions for Warp and iTerm, and a GitHub Desktop action only when `project.branch` exists.

- [ ] **Step 5: Verify application actions**

Run: `npm test && npm run lint && npm run build`

Expected: all tests pass and only installed applications are exposed.

### Task 3: Add the Git tool

**Files:**
- Create: `src/features/git/git-status.ts`
- Create: `src/features/git/git-view.tsx`
- Create: `test/git/git-status.test.ts`
- Modify: `src/features/git/git-info.ts`

**Interfaces:**
- Consumes: project paths from `discoverProjects`
- Produces: `readGitStatus(path: string): Promise<GitStatus | undefined>` and `GitView`

- [ ] **Step 1: Write porcelain-status parser tests**

```ts
import { describe, expect, it } from "vitest";
import { parseGitStatus } from "../../src/features/git/git-status";

describe("parseGitStatus", () => {
  it("counts staged, changed, and untracked files", () => {
    expect(parseGitStatus("M  staged.ts\n M changed.ts\n?? new.ts\n")).toEqual({
      staged: 1,
      changed: 1,
      untracked: 1,
      clean: false,
    });
  });

  it("reports an empty status as clean", () => {
    expect(parseGitStatus("")).toEqual({ staged: 0, changed: 0, untracked: 0, clean: true });
  });
});
```

- [ ] **Step 2: Run the parser tests and confirm they fail**

Run: `npm test -- test/git/git-status.test.ts`

Expected: failure because `git-status.ts` does not exist.

- [ ] **Step 3: Implement read-only Git status**

Use `/usr/bin/git -C <path> status --porcelain=v1`. Return counts only. Keep `readGitInfo` responsible for branch and GitHub URL.

- [ ] **Step 4: Build `GitView`**

Show one item per Git project with branch, clean/changed state, and counts. Provide actions to open the project, reveal it in Finder, open GitHub, open GitHub Desktop when installed, and copy the repository path. Do not add commit, push, pull, checkout, or reset actions.

- [ ] **Step 5: Verify the Git tool**

Run: `npm test && npm run lint && npm run build`

Expected: parser tests and existing Git tests pass with no repository mutations.

### Task 4: Add the Docker tool

**Files:**
- Create: `src/features/docker/docker-client.ts`
- Create: `src/features/docker/docker-view.tsx`
- Create: `src/features/docker/types.ts`
- Create: `test/docker/docker-client.test.ts`

**Interfaces:**
- Consumes: projects whose `kinds` include `docker`
- Produces: `dockerArguments(action: DockerAction): string[]`, `readComposeServices(path: string)`, and `DockerView`

- [ ] **Step 1: Write safe Docker argument tests**

```ts
import { describe, expect, it } from "vitest";
import { dockerArguments } from "../../src/features/docker/docker-client";

describe("dockerArguments", () => {
  it("creates fixed compose argument arrays", () => {
    expect(dockerArguments("start")).toEqual(["compose", "up", "-d"]);
    expect(dockerArguments("stop")).toEqual(["compose", "down"]);
    expect(dockerArguments("logs")).toEqual(["compose", "logs", "--tail", "200"]);
  });
});
```

- [ ] **Step 2: Run the Docker test and confirm it fails**

Run: `npm test -- test/docker/docker-client.test.ts`

Expected: failure because the Docker client does not exist.

- [ ] **Step 3: Implement the Docker client**

Resolve Docker from known macOS locations, then use `execFile` with `cwd` set to the project path. Read status with `docker compose ps --format json`. Run start or stop only after `confirmAlert` returns `true`.

- [ ] **Step 4: Build `DockerView`**

Show Docker projects and their service state. Provide refresh, open Docker Desktop, start, stop, and logs actions. Mark stop as destructive and show the project name in the confirmation alert.

- [ ] **Step 5: Verify the Docker tool**

Run: `npm test && npm run lint && npm run build`

Expected: Docker argument tests pass; listing the view does not start or stop containers.

### Task 5: Add the Servers tool

**Files:**
- Create: `src/features/servers/server-client.ts`
- Create: `src/features/servers/servers-view.tsx`
- Create: `src/features/servers/types.ts`
- Create: `test/servers/server-client.test.ts`

**Interfaces:**
- Produces: `parseListeningProcesses(output: string): LocalServer[]`, `readListeningProcesses()`, and `ServersView`

- [ ] **Step 1: Write the process parser tests**

```ts
import { describe, expect, it } from "vitest";
import { parseListeningProcesses } from "../../src/features/servers/server-client";

describe("parseListeningProcesses", () => {
  it("parses a local listening process", () => {
    const output = "node 4321 ibrahim 22u IPv6 TCP *:3000 (LISTEN)";
    expect(parseListeningProcesses(output)).toEqual([
      { command: "node", pid: 4321, port: 3000, url: "http://localhost:3000" },
    ]);
  });
});
```

- [ ] **Step 2: Run the server test and confirm it fails**

Run: `npm test -- test/servers/server-client.test.ts`

Expected: failure because the server client does not exist.

- [ ] **Step 3: Implement server discovery**

Run `/usr/sbin/lsof -nP -iTCP -sTCP:LISTEN` with `execFile`. Keep only valid positive PIDs and ports from 1 through 65535. Sort by port and deduplicate repeated process-port pairs.

- [ ] **Step 4: Build `ServersView`**

Show process name, PID, and port. Provide actions to open localhost, copy the URL, copy the PID, refresh, and stop the process. Call `process.kill(pid, "SIGTERM")` only after a destructive confirmation alert naming the process and port.

- [ ] **Step 5: Verify the Servers tool**

Run: `npm test && npm run lint && npm run build`

Expected: parser tests pass; opening the view does not signal any process.

### Task 6: Build the Cockpit home screen

**Files:**
- Create: `src/features/home/tool-definitions.ts`
- Create: `test/home/tool-definitions.test.ts`
- Modify: `src/cockpit.tsx`
- Modify: `docs/architecture.md`
- Modify: `docs/roadmap.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `ProjectsView`, `GitView`, `DockerView`, and `ServersView`
- Produces: a searchable Cockpit home list with `Action.Push` navigation

- [ ] **Step 1: Write the home tool-order test**

```ts
import { describe, expect, it } from "vitest";
import { toolDefinitions } from "../../src/features/home/tool-definitions";

describe("toolDefinitions", () => {
  it("keeps the Cockpit tools in product order", () => {
    expect(toolDefinitions.map((tool) => tool.id)).toEqual(["projects", "git", "docker", "servers"]);
  });
});
```

- [ ] **Step 2: Run the home test and confirm it fails**

Run: `npm test -- test/home/tool-definitions.test.ts`

Expected: failure because the home definitions do not exist.

- [ ] **Step 3: Implement the home definitions**

```ts
export const toolDefinitions = [
  { id: "projects", title: "Projects", subtitle: "Open local projects and developer tools" },
  { id: "git", title: "Git", subtitle: "Review repository state" },
  { id: "docker", title: "Docker", subtitle: "Manage Compose projects" },
  { id: "servers", title: "Servers", subtitle: "Inspect local listening ports" },
] as const;
```

- [ ] **Step 4: Implement the home view**

Render the four definitions as Raycast `List.Item` entries. Each item uses `Action.Push` to open its feature view. Keep `projectsRoot` loaded once in `src/cockpit.tsx` and pass it to Projects, Git, and Docker.

- [ ] **Step 5: Update user documentation**

Document the four tools, confirmation behavior, supported installed apps, development commands, and the feature-based source structure.

- [ ] **Step 6: Run the release gate**

Run: `npm test && npm run lint && npm run build`

Expected: all tests pass, lint exits with code 0, TypeScript checks pass, and Raycast builds `src/cockpit.tsx`.

## Recommended execution order

1. Projects extraction and installed application actions.
2. Git tool.
3. Docker tool.
4. Servers tool.
5. Cockpit home screen and documentation.

Each numbered task should be reviewed and committed separately after user approval.
