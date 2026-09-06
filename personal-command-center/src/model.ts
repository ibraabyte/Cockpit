export type ProjectKind = "nextjs" | "django" | "python" | "docker";

export type Project = {
  name: string;
  path: string;
  kinds: ProjectKind[];
  branch?: string;
  githubUrl?: string;
  devUrl?: string;
};

export const composeFiles = ["compose.yaml", "compose.yml", "docker-compose.yaml", "docker-compose.yml"];
