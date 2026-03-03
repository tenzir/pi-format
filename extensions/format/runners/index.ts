import type { RunnerDefinition } from "../types.js";
import biomeCheckWriteRunner from "./biome-check-write.js";
import clangFormatRunner from "./clang-format.js";
import cmakeFormatRunner from "./cmake-format.js";
import eslintFixRunner from "./eslint-fix.js";
import markdownlintFixRunner from "./markdownlint-fix.js";
import prettierConfigWriteRunner from "./prettier-config-write.js";
import prettierMarkdownRunner from "./prettier-markdown.js";
import ruffCheckFixRunner from "./ruff-check-fix.js";
import ruffFormatRunner from "./ruff-format.js";
import shfmtRunner from "./shfmt.js";

export const RUNNER_DEFINITIONS: RunnerDefinition[] = [
  clangFormatRunner,
  cmakeFormatRunner,
  markdownlintFixRunner,
  prettierMarkdownRunner,
  biomeCheckWriteRunner,
  eslintFixRunner,
  prettierConfigWriteRunner,
  shfmtRunner,
  ruffFormatRunner,
  ruffCheckFixRunner,
];

function buildRunnerRegistry(
  definitions: RunnerDefinition[],
): Map<string, RunnerDefinition> {
  const registry = new Map<string, RunnerDefinition>();

  for (const runner of definitions) {
    if (registry.has(runner.id)) {
      throw new Error(`Duplicate runner registration: ${runner.id}`);
    }

    registry.set(runner.id, runner);
  }

  return registry;
}

export const RUNNERS = buildRunnerRegistry(RUNNER_DEFINITIONS);
