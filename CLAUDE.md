# MEDIA-DASHBOARD (afrisinc-web)

Vite 5 + React 18 + TypeScript strict + Tailwind + shadcn/Radix + TanStack Query v5. Package manager is **pnpm**.

This is the dashboard for the `content-service` microservice (`../content-service`). Every API route it calls lives under the `/media` prefix and returns the `{ success, resp_msg, resp_code, data }` envelope.

## Required for every coding task

Before writing, modifying, refactoring, or reviewing any code in this repository, load the `frontend-standards` skill (`.claude/skills/frontend-standards/SKILL.md`) and follow it. It defines the layering, the data-layer contracts, the design tokens, the primitives to reuse, and the checks that must pass before a task is reported complete.

## Generated documentation

Every markdown document generated for this repository goes in `docs/`. The only root-level markdown files are `README.md` and this file.

## Commands

```bash
pnpm dev            # vite
pnpm build          # vite build
pnpm type-check     # tsc --noEmit
pnpm lint           # eslint
pnpm lint:fix       # eslint --fix
pnpm format         # prettier --write
pnpm checks         # format + lint:fix + type-check + build
```
