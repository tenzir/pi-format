# Runner API

A *runner* wraps a single formatting tool (for example, `prettier` or `ruff`).
This document describes how runners work and how to add new ones.

## File layout

| File | Purpose |
| ---- | ------- |
| `extensions/format/runners/*.ts` | One file per runner |
| `extensions/format/runners/helpers.ts` | Helper constructors (`direct`, `pypi`, `goTool`, `defineRunner`) |
| `extensions/format/runners/index.ts` | Runner registry |
| `extensions/format/plan.ts` | File-kind → runner-group mapping |
| `extensions/format/types.ts` | Shared types |

## Add a new runner

1. Create a file under `extensions/format/runners/`.
2. Define the runner with the helper constructors from `helpers.ts`.
3. Register it in `extensions/format/runners/index.ts`.
4. Add its `id` to one or more groups in `extensions/format/plan.ts`.

## Runner definition

Every runner needs two things:

- `id`: a unique identifier
- `launcher`: how to locate and execute the tool

### Launchers

Use the helper constructors to create a launcher:

| Constructor | Behavior |
| ----------- | -------- |
| `direct("prettier")` | Run the command directly |
| `pypi("ruff")` | Run the tool natively, fall back to `uv tool run` |
| `goTool("shfmt", "mvdan.cc/sh/v3/cmd/shfmt@v3.10.0")` | Run the tool natively, fall back to `go run` |

All commands execute in the project working directory and respect the
configured timeout.

### Arguments

There are two ways to supply arguments:

- **Static** (preferred): Set `args: string[]`. The file path is appended
  automatically unless you set `appendFile: false`.
- **Dynamic**: Implement `buildArgs(ctx)` and return the argument array, or
  `undefined` to skip the runner.

### Optional predicates and requirements

- `when(ctx)`: Return `false` to skip the runner based on an extra condition.
- `requires.majorVersionFromConfig`: Gate execution on a major version match:
  - `patterns`: Config-file globs to read the required major version from.
  - `command` (optional): Command to inspect with `--version`.
  - `onInvalid` / `onMismatch`: `"warn-skip"` (default) or `"skip"`.

### Runner context

The `ctx` object passed to `when` and `buildArgs` exposes:

| Member | Description |
| ------ | ----------- |
| `filePath`, `cwd`, `sourceTool`, `kind` | Current invocation metadata |
| `hasCommand(cmd)` | Check whether a command is available |
| `hasConfig(patterns)`, `findConfigFile(patterns)` | Look up configuration files |
| `hasEditorConfigInCwd()` | Check for an `.editorconfig` in the working directory |
| `getChangedLines()` | Get the line ranges that changed |
| `warn(msg)` | Emit a warning without failing the run |

## Format plan

`extensions/format/plan.ts` maps each file kind to an ordered list of runner
groups. Each group has a mode:

- **`"all"`**: Run every qualifying runner in order.
- **`"fallback"`**: Run the first qualifying runner and stop.

## Examples

### Static runner

```ts
import { defineRunner, direct } from "./helpers.js";

const myRunner = defineRunner({
  id: "my-formatter",
  launcher: direct("my-formatter"),
  args: ["--write"],
});

export default myRunner;
```

### Dynamic runner with a version requirement

```ts
import { defineRunner, direct } from "./helpers.js";

const clangFormatRunner = defineRunner({
  id: "clang-format",
  launcher: direct("clang-format"),
  requires: {
    majorVersionFromConfig: {
      patterns: [".clang-format-version"],
    },
  },
  async buildArgs(ctx) {
    const lines = await ctx.getChangedLines();
    if (lines.length > 0) {
      return [...lines.map((line) => `--lines=${line}`), "-i", ctx.filePath];
    }
    return ["-i", ctx.filePath];
  },
});

export default clangFormatRunner;
```
