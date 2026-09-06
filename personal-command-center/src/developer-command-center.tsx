import { getPreferenceValues, Icon, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { discoverProjects } from "./discover-projects";
import { ProjectActions } from "./project-actions";

type Preferences = { projectsRoot: string };

export default function Command() {
  const { projectsRoot } = getPreferenceValues<Preferences>();
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
