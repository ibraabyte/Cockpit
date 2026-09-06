import type { ProjectKind } from "./model";

export type DevelopmentCommand = {
  title: string;
  value: string;
};

export function developmentCommands(kinds: ProjectKind[]): DevelopmentCommand[] {
  return [
    ...(kinds.includes("nextjs") ? [{ title: "Copy Next.js Dev Command", value: "npm run dev" }] : []),
    ...(kinds.includes("django") ? [{ title: "Copy Django Dev Command", value: "python manage.py runserver" }] : []),
    ...(kinds.includes("docker")
      ? [
          { title: "Copy Docker Up Command", value: "docker compose up" },
          { title: "Copy Docker Down Command", value: "docker compose down" },
          { title: "Copy Docker Logs Command", value: "docker compose logs -f" },
        ]
      : []),
  ];
}
