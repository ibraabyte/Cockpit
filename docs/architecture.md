# Cockpit architecture

Cockpit is a Raycast extension with one home screen and four independent developer tools. Each feature owns its data readers, views, types, and tests.

## Source structure

- `src/cockpit.tsx` loads preferences and renders the searchable home screen
- `src/features/home` defines the tool order and labels
- `src/features/projects` discovers supported projects and builds project actions
- `src/features/git` reads branches, remotes, and working tree counts
- `src/features/docker` reads Compose state and runs confirmed Compose actions
- `src/features/servers` reads listening ports and stops confirmed processes
- `src/shared` contains installed application and terminal helpers
- `test` mirrors the source feature groups

## Data flow

The home screen passes `projectsRoot` to the Projects, Git, and Docker views. Project discovery scans only immediate child directories and returns recognized project types.

Git and Docker reuse the discovered projects. Servers reads listening processes directly because a listening port may not belong to a discovered project.

## Safety rules

- Run external commands with `execFile` and argument arrays
- Keep Git operations read-only
- Confirm Docker start and stop actions
- Confirm process termination and use `SIGTERM`
- Do not read `.env` contents
- Show only developer applications installed on the current Mac
