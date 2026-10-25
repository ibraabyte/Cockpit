import { Action, ActionPanel, getApplications, Icon, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { findDeveloperApplications, type DeveloperApplication } from "../../shared/applications";
import { discoverProjects } from "../projects/discover-projects";
import type { Project } from "../projects/types";
import { readGitStatus, type GitStatus } from "./git-status";

type GitProject = Project & { status: GitStatus };

async function discoverGitProjects(projectsRoot: string): Promise<GitProject[]> {
  const projects = await discoverProjects(projectsRoot);
  const statuses = await Promise.all(projects.map((project) => readGitStatus(project.path)));

  return projects.flatMap((project, index) => {
    const status = statuses[index];
    return status ? [{ ...project, status }] : [];
  });
}

function GitActions({ project, applications }: { project: GitProject; applications: DeveloperApplication[] }) {
  const editor = applications.find(
    (application) => application.id === "vscode" || application.id === "cursor" || application.id === "zed",
  );
  const githubDesktop = applications.find((application) => application.id === "github-desktop");

  return (
    <ActionPanel>
      {editor ? (
        <Action.Open
          title={`Open in ${editor.name}`}
          target={project.path}
          application={editor.path}
          icon={Icon.Code}
        />
      ) : (
        <Action.Open title="Open Project" target={project.path} icon={Icon.Folder} />
      )}
      <Action.ShowInFinder path={project.path} />
      {project.githubUrl ? <Action.OpenInBrowser title="Open GitHub Repository" url={project.githubUrl} /> : null}
      {githubDesktop ? (
        <Action.Open title="Open in GitHub Desktop" target={project.path} application={githubDesktop.path} />
      ) : null}
      <Action.CopyToClipboard title="Copy Repository Path" content={project.path} />
    </ActionPanel>
  );
}

export function GitView({ projectsRoot }: { projectsRoot: string }) {
  const { data = [], isLoading, error } = usePromise(discoverGitProjects, [projectsRoot]);
  const { data: installedApplications = [] } = usePromise(getApplications);
  const developerApplications = findDeveloperApplications(installedApplications);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Git repositories…">
      {!isLoading && error ? (
        <List.EmptyView icon={Icon.Warning} title="Could not read Git repositories" description={error.message} />
      ) : null}
      {!isLoading && !error && data.length === 0 ? (
        <List.EmptyView icon={Icon.CodeBlock} title="No Git repositories found" />
      ) : null}
      {data.map((project) => (
        <List.Item
          key={project.path}
          id={project.path}
          icon={project.status.clean ? Icon.CheckCircle : Icon.Pencil}
          title={project.name}
          subtitle={project.path}
          keywords={[project.branch ?? "", "git", "repository"]}
          accessories={[
            { text: project.branch ?? "Detached", icon: Icon.CodeBlock },
            ...(project.status.clean ? [{ tag: "Clean" }] : []),
            ...(project.status.staged > 0 ? [{ tag: `Staged ${project.status.staged}` }] : []),
            ...(project.status.changed > 0 ? [{ tag: `Changed ${project.status.changed}` }] : []),
            ...(project.status.untracked > 0 ? [{ tag: `Untracked ${project.status.untracked}` }] : []),
          ]}
          actions={<GitActions project={project} applications={developerApplications} />}
        />
      ))}
    </List>
  );
}
