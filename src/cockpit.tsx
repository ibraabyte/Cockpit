import { getPreferenceValues } from "@raycast/api";
import { ProjectsView } from "./features/projects/projects-view";

type Preferences = { projectsRoot: string };

export default function Command() {
  const { projectsRoot } = getPreferenceValues<Preferences>();
  return <ProjectsView projectsRoot={projectsRoot} />;
}
