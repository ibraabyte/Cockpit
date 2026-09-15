# Cockpit

Cockpit opens your local development projects and tools from Raycast. It scans one projects folder and identifies supported project types. Each action keeps project changes under your control.

## What Cockpit supports

Cockpit currently works with these project types:

- **Next.js**: detected from the `next` package in `package.json`
- **Django**: detected from `manage.py`
- **Python**: detected from `pyproject.toml` or `requirements.txt`
- **Docker Compose**: detected from standard Compose file names

For each project, Cockpit can:

- Open the folder in Visual Studio Code, Terminal, or Finder
- Start Codex or Claude Code in the project folder
- Show the current Git branch
- Open the GitHub repository when the `origin` remote points to GitHub
- Open the expected local URL for Next.js or Django
- Copy development and Docker commands to the clipboard

## Requirements

Install these tools before you start:

- macOS
- [Raycast](https://www.raycast.com/)
- Node.js 22.14 or newer
- npm 7 or newer

Codex and Claude Code actions expect these executable paths:

```text
/Users/ibrahim/.local/bin/codex
/Users/ibrahim/.local/bin/claude
```

## Run Cockpit locally

Clone the repository and install its packages:

```bash
git clone git@github.com:ibraabyte/Cockpit.git
cd Cockpit
npm install
npm run dev
```

Search Raycast for **Cockpit**, then open the command. Select your development projects directory in **Projects Folder**.

Cockpit scans only the immediate child folders. It does not search your full filesystem.

## Safety

Cockpit reads project markers and Git metadata. It does not start servers or run migrations. It also does not change Git repositories or control Docker.

Development and Docker commands are copied to the clipboard. Review each command before you run it.

## Development checks

Run these commands from the repository root:

```bash
npm test
npm run lint
npm run build
```

The scripts perform these checks:

- `npm test`: runs the Vitest test suite
- `npm run lint`: validates the Raycast manifest, formatting, and lint rules
- `npm run build`: compiles the Raycast command and checks TypeScript

## Project structure

```text
src/
├── cockpit.tsx
├── features/
│   ├── git/
│   └── projects/
└── shared/
test/
├── git/
├── projects/
└── shared/
docs/
└── plans/
```

The [architecture guide](docs/architecture.md) explains file responsibilities. The [roadmap](docs/roadmap.md) lists the planned Projects, Git, Docker, and Servers tools.

## License

Cockpit uses the MIT License.
