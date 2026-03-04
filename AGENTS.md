# Agent instructions

This is a pi extension that auto-formats files. Read `README.md` for an
overview.

## Structure

- `extensions/index.ts`: extension entry point (hooks into `tool_result`)
- `extensions/formatter/`: core logic (dispatch, plan, context, types)
- `extensions/formatter/runners/`: one file per formatter
- `extensions/formatter/plan.ts`: maps file kinds to runner groups

## Add a new formatter

1. Create `extensions/formatter/runners/<name>.ts` using `defineRunner` and a
   launcher helper (`direct`, `pypi`, or `goTool`) from `helpers.ts`.
2. Register the runner in `extensions/formatter/runners/index.ts`.
3. Add its id to a group in `extensions/formatter/plan.ts`.
