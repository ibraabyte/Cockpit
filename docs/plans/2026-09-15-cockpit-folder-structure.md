# Cockpit Folder Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Cockpit Raycast extension to the repository root and organize source and test files by feature.

**Architecture:** Keep Raycast's `src/cockpit.tsx` entry point at the source root. Group project discovery and actions under `src/features/projects`, Git helpers under `src/features/git`, and shared process helpers under `src/shared`. Mirror these groups in `test`.

**Tech Stack:** Raycast API, React, TypeScript, Node.js, Vitest

## Global Constraints

- Preserve all current behavior.
- Keep `src/cockpit.tsx` as the Raycast command entry point.
- Do not add Docker or server behavior in this restructuring.
- Do not commit or push without user approval.

---

### Task 1: Flatten the extension root

**Files:**
- Move: `cockpit/package.json` to `package.json`
- Move: `cockpit/package-lock.json` to `package-lock.json`
- Move: `cockpit/README.md` to `README.md`
- Move: `cockpit/assets` to `assets`
- Move: Cockpit configuration files to the repository root
- Remove: the empty `old-trash-cleaner` folder

**Interfaces:**
- Consumes: the existing Cockpit extension package
- Produces: a Raycast extension runnable from the repository root

- [x] Move the extension metadata, assets, dependencies, and configuration to the repository root.
- [x] Remove the redundant nested extension folder and obsolete placeholder folder.
- [x] Confirm `package.json` declares the `cockpit` command.

### Task 2: Group source files by feature

**Files:**
- Keep: `src/cockpit.tsx`
- Move: project files to `src/features/projects/`
- Move: `git-info.ts` to `src/features/git/`
- Move: `terminal.ts` to `src/shared/`
- Rename: `model.ts` to `src/features/projects/types.ts`

**Interfaces:**
- Consumes: existing project discovery, Git, terminal, and action modules
- Produces: the same exports at feature-based paths

- [x] Move source files into their target feature folders.
- [x] Update all TypeScript imports.
- [x] Run the test suite and confirm all 11 tests pass.

### Task 3: Mirror tests and simplify docs

**Files:**
- Move: project tests to `test/projects/`
- Move: Git tests to `test/git/`
- Move: terminal tests to `test/shared/`
- Move: plans to `docs/plans/`
- Modify: documentation paths

**Interfaces:**
- Consumes: the reorganized source paths
- Produces: tests and documentation matching the final structure

- [x] Move tests to folders matching the feature layout.
- [x] Update test imports and documentation paths.
- [x] Run `npm test`, `npm run lint`, and `npm run build` from the repository root.
