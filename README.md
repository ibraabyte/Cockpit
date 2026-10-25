# Cockpit

Cockpit groups local development tools in one Raycast command. Open projects, review Git state, manage Docker Compose services, and inspect local servers.

## Cockpit tools

Cockpit includes four tools:

- **Projects**: discover and open local development projects
- **Git**: review branches and working tree changes without changing repositories
- **Docker**: view Compose services, read logs, and start or stop services after confirmation
- **Servers**: inspect listening ports and stop a process after confirmation

## Supported projects

Cockpit detects these project types:

- **Next.js**: the `next` package exists in `package.json`
- **Django**: `manage.py` exists
- **Python**: `pyproject.toml` or `requirements.txt` exists
- **Docker Compose**: a standard Compose file exists

Cockpit scans only the immediate child folders inside your configured projects directory.

## Installed applications

Project actions show only applications installed on your Mac. Cockpit recognizes:

- Visual Studio Code
- Cursor
- Zed
- Warp
- iTerm
- GitHub Desktop
- Docker Desktop
- Postman
- Bruno
- TablePlus
- DBeaver

You can also open Codex or Claude Code in a project terminal. These actions expect:

```text
/Users/ibrahim/.local/bin/codex
/Users/ibrahim/.local/bin/claude
```

## Safety boundaries

Cockpit keeps Git actions read-only. It does not commit, push, pull, switch branches, or reset files.

Docker start and stop actions require confirmation. Stopping a local server also requires confirmation and sends `SIGTERM` to the selected process. Cockpit never reads `.env` contents.

## Requirements

Install these tools:

- macOS
- [Raycast](https://www.raycast.com/)
- Node.js 22.14 or newer
- npm 7 or newer

Docker actions also require Docker Desktop or a Docker command-line installation in a supported macOS location.

## Run Cockpit locally

Clone the repository and install its packages:

```bash
git clone git@github.com:ibraabyte/Cockpit.git
cd Cockpit
npm install
npm run dev
```

Open **Cockpit** in Raycast. Select your development projects directory in **Projects Folder**.

## Development checks

Run these checks from the repository root:

```bash
npm test
npm run lint
npm run build
```

## Project structure

```text
src/
├── cockpit.tsx
├── features/
│   ├── docker/
│   ├── git/
│   ├── home/
│   ├── projects/
│   └── servers/
└── shared/
test/
├── docker/
├── git/
├── home/
├── projects/
├── servers/
└── shared/
```

Read the [architecture guide](docs/architecture.md) for file responsibilities and safety rules.

## License

Cockpit uses the MIT License.
