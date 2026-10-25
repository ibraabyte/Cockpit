import { Action, ActionPanel, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import type { DeveloperApplication } from "../../shared/applications";
import { launchInTerminal } from "../../shared/terminal";
import type { Project } from "./types";
import { developmentCommands } from "./project-commands";

const CODEX = "/Users/ibrahim/.local/bin/codex";
const CLAUDE = "/Users/ibrahim/.local/bin/claude";

async function launch(project: Project, tool: string, title: string) {
  try {
    await launchInTerminal(project.path, tool);
  } catch (error) {
    await showFailureToast(error, { title: `Could not open ${title}` });
  }
}

export function ProjectActions({ project, applications }: { project: Project; applications: DeveloperApplication[] }) {
  const commands = developmentCommands(project.kinds);
  const editors = applications.filter((application) => ["vscode", "cursor", "zed"].includes(application.id));
  const terminals = applications.filter((application) => ["warp", "iterm"].includes(application.id));
  const githubDesktop = applications.find((application) => application.id === "github-desktop");

  return (
    <ActionPanel>
      {editors.map((application) => (
        <Action.Open
          key={application.id}
          title={`Open in ${application.name}`}
          target={project.path}
          application={application.path}
        />
      ))}
      <Action title="Open Codex" icon={Icon.Terminal} onAction={() => launch(project, CODEX, "Codex")} />
      <Action title="Open Claude Code" icon={Icon.Terminal} onAction={() => launch(project, CLAUDE, "Claude Code")} />
      <Action.Open title="Open in Terminal" target={project.path} application="Terminal" />
      {terminals.map((application) => (
        <Action.Open
          key={application.id}
          title={`Open in ${application.name}`}
          target={project.path}
          application={application.path}
        />
      ))}
      <Action.ShowInFinder path={project.path} />
      {project.githubUrl ? <Action.OpenInBrowser title="Open GitHub Repository" url={project.githubUrl} /> : null}
      {project.branch && githubDesktop ? (
        <Action.Open title="Open in GitHub Desktop" target={project.path} application={githubDesktop.path} />
      ) : null}
      {project.devUrl ? <Action.OpenInBrowser title="Open Local Development URL" url={project.devUrl} /> : null}
      <Action.CopyToClipboard title="Copy Project Path" content={project.path} />
      {commands.length > 0 ? (
        <ActionPanel.Submenu title="Copy Development Command" icon={Icon.Clipboard}>
          {commands.map((command) => (
            <Action.CopyToClipboard key={command.title} title={command.title} content={command.value} />
          ))}
        </ActionPanel.Submenu>
      ) : null}
    </ActionPanel>
  );
}
