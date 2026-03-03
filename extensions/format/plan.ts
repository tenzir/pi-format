import type { FileKind, RunnerGroup } from "./types.js";

export const FORMAT_PLAN: Record<FileKind, RunnerGroup[]> = {
  cxx: [{ mode: "all", runnerIds: ["clang-format"] }],
  cmake: [{ mode: "all", runnerIds: ["cmake-format"] }],
  markdown: [
    {
      mode: "all",
      runnerIds: ["markdownlint-fix", "prettier-markdown"],
    },
  ],
  json: [
    {
      mode: "fallback",
      runnerIds: ["biome-check-write", "prettier-config-write"],
    },
  ],
  shell: [{ mode: "all", runnerIds: ["shfmt"] }],
  python: [{ mode: "all", runnerIds: ["ruff-format", "ruff-check-fix"] }],
  jsts: [
    {
      mode: "fallback",
      runnerIds: ["biome-check-write", "eslint-fix", "prettier-config-write"],
    },
  ],
};
