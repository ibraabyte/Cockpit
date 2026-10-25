export type DockerAction = "start" | "stop" | "logs";

export type ComposeService = {
  name: string;
  service: string;
  state: string;
  status: string;
};
