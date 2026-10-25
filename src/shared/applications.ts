import type { Application } from "@raycast/api";

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

const supportedApplications: ReadonlyArray<{
  id: DeveloperApplicationId;
  name: string;
  aliases: readonly string[];
}> = [
  { id: "vscode", name: "Visual Studio Code", aliases: ["Visual Studio Code", "Code"] },
  { id: "cursor", name: "Cursor", aliases: ["Cursor"] },
  { id: "zed", name: "Zed", aliases: ["Zed"] },
  { id: "warp", name: "Warp", aliases: ["Warp"] },
  { id: "iterm", name: "iTerm", aliases: ["iTerm", "iTerm2"] },
  { id: "github-desktop", name: "GitHub Desktop", aliases: ["GitHub Desktop"] },
  { id: "docker-desktop", name: "Docker Desktop", aliases: ["Docker Desktop", "Docker"] },
  { id: "postman", name: "Postman", aliases: ["Postman"] },
  { id: "bruno", name: "Bruno", aliases: ["Bruno"] },
  { id: "tableplus", name: "TablePlus", aliases: ["TablePlus"] },
  { id: "dbeaver", name: "DBeaver", aliases: ["DBeaver", "DBeaver Community"] },
];

export function findDeveloperApplications(applications: Application[]): DeveloperApplication[] {
  return supportedApplications.flatMap((supported) => {
    const application = applications.find((candidate) => supported.aliases.includes(candidate.name));
    return application ? [{ id: supported.id, name: supported.name, path: application.path }] : [];
  });
}
