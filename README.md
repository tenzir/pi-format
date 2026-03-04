# 🎨 pi-formatter

A [pi](https://pi.dev) extension that auto-formats files after every `write` and
`edit` tool call.

The extension hooks into successful tool results, detects the file type, and
runs the appropriate formatter. Failures never block the tool result, so
formatting is always best-effort.

## 📦 Install

```bash
pi install npm:pi-formatter
```

## ⚙️ What it does

`pi-formatter` listens to successful `write` and `edit` tool calls and applies
best-effort formatting. Formatter failures never block tool results.

Supported file types:

- C/C++
- CMake
- Markdown
- JSON
- Shell
- Python
- JavaScript/TypeScript

For JS/TS and JSON, project-configured tools are preferred first (Biome,
ESLint), with Prettier as a fallback.

## 🔧 Configuration

Create `<agent-dir>/formatter.json`, where `<agent-dir>` is pi's agent config
folder (default: `~/.pi/agent`, overridable via `PI_CODING_AGENT_DIR`):

```json
{
  "commandTimeoutMs": 10000,
  "hideCallSummariesInTui": false
}
```

- `commandTimeoutMs`: timeout (ms) per formatter command (default: `10000`)
- `hideCallSummariesInTui`: hide formatter pass/fail summaries in the TUI (default: `false`)

## 🧩 Adding formatters

Each formatter is a _runner_ that wraps a CLI tool behind a common interface.
To add one:

1. Create a file in `extensions/formatter/runners/` using `defineRunner` and a
   launcher helper (`direct`, `pypi`, or `goTool`).
2. Register it in `extensions/formatter/runners/index.ts`.
3. Add its id to a group in `extensions/formatter/plan.ts`.

The format plan maps file kinds to ordered runner groups. Each group runs in
`"all"` mode (every runner) or `"fallback"` mode (first match wins).

## 📄 License

[Apache-2.0](LICENSE)
