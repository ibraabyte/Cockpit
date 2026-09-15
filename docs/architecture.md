# Cockpit Architecture

Cockpit is a Raycast extension for opening and managing local development projects.

## Structure

- `src/cockpit.tsx` is the Raycast command entry point.
- `src/features/projects` owns project discovery, project types, actions, and development commands.
- `src/features/git` reads Git branch and GitHub remote information without changing repositories.
- `src/shared` contains helpers used by more than one feature.
- `test` mirrors the source feature groups.

New tools such as Docker and local server views should be added under `src/features` when implemented.
