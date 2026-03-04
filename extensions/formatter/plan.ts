import type { FileKind, RunnerGroup } from "./types.js";

export const FORMAT_PLAN: Record<FileKind, RunnerGroup[]> = {
  cxx: [{ mode: "all", runnerIds: ["clang-format"] }],
  cmake: [{ mode: "all", runnerIds: ["cmake-format"] }],
  markdown: [
    {
      mode: "fallback",
      runnerIds: ["prettier", "markdownlint"],
    },
  ],
  json: [
    {
      mode: "fallback",
      runnerIds: ["biome", "prettier"],
    },
  ],
  shell: [{ mode: "all", runnerIds: ["shfmt"] }],
  python: [{ mode: "all", runnerIds: ["ruff-format", "ruff-check"] }],
  jsts: [
    {
      mode: "fallback",
      runnerIds: ["biome", "eslint", "prettier"],
    },
  ],
};
