# Personal Command Center

A local Raycast project launcher for Next.js, Django, Python, and Docker Compose work.

## Start development

```bash
npm install
npm run dev
```

Search Raycast for **Developer Command Center**. Set **Projects Folder** in the extension preferences if your projects move.

## Safety

The extension reads marker files and Git metadata. It does not start servers, run migrations, or control Docker. Development commands are copied to the clipboard so you can inspect them first.

## Checks

```bash
npm test
npm run lint
npm run build
```
