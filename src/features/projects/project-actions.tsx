import { Action, ActionPanel, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import type { Project } from "./types";
import { developmentCommands } from "./project-commands";
import { launchInTerminal } from "../../shared/terminal";

const CODEX = "/Users/ibrahim/.local/bin/codex";
const CLAUDE = "/Users/ibrahim/.local/bin/claude";

async function launch(project: Project, tool: string, title: string) {
  try {
    await launchInTerminal(project.path, tool);
  } catch (error) {
    await showFailureToast(error, { title: `Could not open ${title}` });
  }
}

export function ProjectActions({ project }: { project: Project }) {
  const commands = developmentCommands(project.kinds);

  return (
    <ActionPanel>
      <Action.Open title="Open in Visual Studio Code" target={project.path} application="Visual Studio Code" />
      <Action title="Open Codex" icon={Icon.Terminal} onAction={() => launch(project, CODEX, "Codex")} />
      <Action title="Open Claude Code" icon={Icon.Terminal} onAction={() => launch(project, CLAUDE, "Claude Code")} />
      <Action.Open title="Open in Terminal" target={project.path} application="Terminal" />
      <Action.ShowInFinder path={project.path} />
      {project.githubUrl ? <Action.OpenInBrowser title="Open GitHub Repository" url={project.githubUrl} /> : null}
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
