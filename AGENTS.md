# Navano Frontend Agent Instruction

Go outside of this project and read `../navano/docs/ai` first!

# Navano Frontend Modification Instructions

This client project is being migrated from `nestar-next` to `navano-client`
(real estate marketplace → flower / chocolate / cake marketplace).

## Rules

- Preserve current project architecture (Next.js pages router, `apollo/`, `libs/`, `scss/`)
- Keep GraphQL/Apollo integration
- Do not rewrite the whole app
- Improve UI incrementally
- Follow the backend migration phases — do not change GraphQL operations before the backend schema changes ship
- Keep i18n (`public/locales/{en,kr,ru}/common.json`) in sync when changing UI text

## Backend Context

Before making any changes, read (path: `D:\MiT\MOD2\navano\docs\ai`):

- `docs/ai/BACKEND_MIGRATION.md`
- `docs/ai/DECISIONS.md`
- `docs/ai/FRONTEND_MIGRATION.md`
- `docs/ai/NEXT_STEPS.md`
- `docs/ai/COMPLETED_TASKS.md`
- `docs/ai/PROMPTS.md`
  and etc inside of `navano/docs/ai`

If anything in this client conflicts with those docs, the docs win (`DECISIONS.md` has the final say).

## Workflow

1. Analyze before editing.
2. Backend (`navano-api`) is running on http://localhost:5070/graphql now (WS: `ws://localhost:5070`).
3. Make small incremental changes.
4. Run typecheck (`npx tsc --noEmit`) after each phase.
5. Do not remove working logic unless replaced safely.
6. Update `navano/docs/ai/COMPLETED_TASKS.md` after major changes.

## Package Manager

- Use Yarn for all frontend commands.
- Do not use npm or pnpm.
- Install dependencies with:

```bash
yarn install
```
