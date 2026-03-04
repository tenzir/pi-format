import type { RunnerDefinition } from "../types.js";
import biomeRunner from "./biome.js";
import clangFormatRunner from "./clang-format.js";
import cmakeFormatRunner from "./cmake-format.js";
import eslintRunner from "./eslint.js";
import markdownlintRunner from "./markdownlint.js";
import prettierRunner from "./prettier.js";
import ruffCheckRunner from "./ruff-check.js";
import ruffFormatRunner from "./ruff-format.js";
import shfmtRunner from "./shfmt.js";

export const RUNNER_DEFINITIONS: RunnerDefinition[] = [
  clangFormatRunner,
  cmakeFormatRunner,
  markdownlintRunner,
  biomeRunner,
  eslintRunner,
  prettierRunner,
  shfmtRunner,
  ruffFormatRunner,
  ruffCheckRunner,
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
