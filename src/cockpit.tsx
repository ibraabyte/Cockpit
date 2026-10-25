import { Action, ActionPanel, getPreferenceValues, Icon, List } from "@raycast/api";
import { DockerView } from "./features/docker/docker-view";
import { GitView } from "./features/git/git-view";
import { toolDefinitions } from "./features/home/tool-definitions";
import { ProjectsView } from "./features/projects/projects-view";
import { ServersView } from "./features/servers/servers-view";

type Preferences = { projectsRoot: string };

export default function Command() {
  const { projectsRoot } = getPreferenceValues<Preferences>();
  const tools = toolDefinitions.map((tool) => {
    switch (tool.id) {
      case "projects":
        return { ...tool, icon: Icon.Folder, view: <ProjectsView projectsRoot={projectsRoot} /> };
      case "git":
        return { ...tool, icon: Icon.CodeBlock, view: <GitView projectsRoot={projectsRoot} /> };
      case "docker":
        return { ...tool, icon: Icon.Box, view: <DockerView projectsRoot={projectsRoot} /> };
      case "servers":
        return { ...tool, icon: Icon.Network, view: <ServersView /> };
    }
  });

  return (
    <List searchBarPlaceholder="Search Cockpit tools…">
      {tools.map((tool) => (
        <List.Item
          key={tool.id}
          icon={tool.icon}
          title={tool.title}
          subtitle={tool.subtitle}
          actions={
            <ActionPanel>
              <Action.Push title={`Open ${tool.title}`} icon={tool.icon} target={tool.view} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
