# Agent instructions

This is a pi extension that auto-formats files. Read `README.md` for an
overview and `DOCUMENTATION.md` for the runner API.

## Structure

- `extensions/index.ts`: extension entry point (hooks into `tool_result`)
- `extensions/format/`: core logic (dispatch, plan, context, types)
- `extensions/format/runners/`: one file per formatter
- `extensions/format/plan.ts`: maps file kinds to runner groups

## Add a new formatter

1. Create `extensions/format/runners/<name>.ts` using `defineRunner` and a
   launcher helper (`direct`, `pypi`, or `goTool`) from `helpers.ts`.
2. Register the runner in `extensions/format/runners/index.ts`.
3. Add its id to a group in `extensions/format/plan.ts`.
