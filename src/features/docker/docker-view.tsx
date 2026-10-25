import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  Detail,
  getApplications,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { showFailureToast, usePromise } from "@raycast/utils";
import { findDeveloperApplications } from "../../shared/applications";
import { discoverProjects } from "../projects/discover-projects";
import type { Project } from "../projects/types";
import { readComposeServices, runComposeAction } from "./docker-client";
import type { ComposeService, DockerAction } from "./types";

type DockerProject = {
  project: Project;
  services: ComposeService[];
  error?: string;
};

async function readDockerProjects(projectsRoot: string): Promise<DockerProject[]> {
  const projects = (await discoverProjects(projectsRoot)).filter((project) => project.kinds.includes("docker"));

  return Promise.all(
    projects.map(async (project) => {
      try {
        return { project, services: await readComposeServices(project.path) };
      } catch (error) {
        return { project, services: [], error: error instanceof Error ? error.message : String(error) };
      }
    }),
  );
}

function serviceSummary(services: ComposeService[]): string {
  if (services.length === 0) return "No services running";
  return services.map((service) => `${service.service}: ${service.state}`).join(" · ");
}

function DockerLogsView({ project }: { project: Project }) {
  const { data = "", isLoading, error, revalidate } = usePromise(runComposeAction, [project.path, "logs"]);

  return (
    <Detail
      isLoading={isLoading}
      navigationTitle={`${project.name} Logs`}
      markdown={
        error ? `# Could not read logs\n\n${error.message}` : `# ${project.name}\n\n\`\`\`text\n${data}\n\`\`\``
      }
      actions={
        <ActionPanel>
          <Action title="Refresh Logs" icon={Icon.ArrowClockwise} onAction={revalidate} />
          <Action.CopyToClipboard title="Copy Logs" content={data} />
        </ActionPanel>
      }
    />
  );
}

export function DockerView({ projectsRoot }: { projectsRoot: string }) {
  const { data = [], isLoading, error, revalidate } = usePromise(readDockerProjects, [projectsRoot]);
  const { data: installedApplications = [] } = usePromise(getApplications);
  const dockerDesktop = findDeveloperApplications(installedApplications).find(
    (application) => application.id === "docker-desktop",
  );

  async function changeProjectState(project: Project, action: Extract<DockerAction, "start" | "stop">) {
    const stopping = action === "stop";
    const confirmed = await confirmAlert({
      title: `${stopping ? "Stop" : "Start"} ${project.name}?`,
      message: `${stopping ? "Stop" : "Start"} the Docker Compose services for ${project.name}.`,
      primaryAction: {
        title: `${stopping ? "Stop" : "Start"} Services`,
        style: stopping ? Alert.ActionStyle.Destructive : Alert.ActionStyle.Default,
      },
    });
    if (!confirmed) return;

    try {
      await runComposeAction(project.path, action);
      await showToast({
        style: Toast.Style.Success,
        title: `${project.name} ${stopping ? "stopped" : "started"}`,
      });
      await revalidate();
    } catch (actionError) {
      await showFailureToast(actionError, {
        title: `Could not ${stopping ? "stop" : "start"} ${project.name}`,
      });
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Docker projects…">
      {!isLoading && error ? (
        <List.EmptyView icon={Icon.Warning} title="Could not scan Docker projects" description={error.message} />
      ) : null}
      {!isLoading && !error && data.length === 0 ? (
        <List.EmptyView icon={Icon.Box} title="No Docker projects found" />
      ) : null}
      {data.map(({ project, services, error: projectError }) => (
        <List.Item
          key={project.path}
          icon={Icon.Box}
          title={project.name}
          subtitle={projectError ?? serviceSummary(services)}
          accessories={[
            { text: `${services.filter((service) => service.state === "running").length}/${services.length} running` },
          ]}
          actions={
            <ActionPanel>
              <Action.Push title="View Logs" icon={Icon.Document} target={<DockerLogsView project={project} />} />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
              {dockerDesktop ? <Action.Open title="Open Docker Desktop" target={dockerDesktop.path} /> : null}
              <Action title="Start Services" icon={Icon.Play} onAction={() => changeProjectState(project, "start")} />
              <Action
                title="Stop Services"
                icon={Icon.Stop}
                style={Action.Style.Destructive}
                onAction={() => changeProjectState(project, "stop")}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
