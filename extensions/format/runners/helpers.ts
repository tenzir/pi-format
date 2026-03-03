import type {
  DirectLauncher,
  GoLauncher,
  PypiLauncher,
  RunnerDefinition,
} from "../types.js";

export function direct(command: string): DirectLauncher {
  return { type: "direct", command };
}

export function pypi(tool: string): PypiLauncher {
  return { type: "pypi", tool };
}

export function goTool(tool: string, module: string): GoLauncher {
  return { type: "go", tool, module };
}

export function defineRunner<T extends RunnerDefinition>(runner: T): T {
  return runner;
}
