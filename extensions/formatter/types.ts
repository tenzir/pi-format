import type { ExecResult } from "@mariozechner/pi-coding-agent";

export type FileKind =
  | "cxx"
  | "cmake"
  | "markdown"
  | "json"
  | "shell"
  | "python"
  | "jsts";

export type RunnerMode = "all" | "fallback";
export type RequiredMajorVersion = "invalid" | string | undefined;

export interface DirectLauncher {
  type: "direct";
  command: string;
}

export interface PypiLauncher {
  type: "pypi";
  tool: string;
}

export interface GoLauncher {
  type: "go";
  tool: string;
  module: string;
}

export type RunnerLauncher = DirectLauncher | PypiLauncher | GoLauncher;

export interface ResolvedLauncher {
  command: string;
  argsPrefix: string[];
}

export interface RunnerContext {
  readonly filePath: string;
  readonly cwd: string;
  readonly kind: FileKind;

  hasCommand(command: string): Promise<boolean>;
  hasConfig(patterns: readonly string[]): Promise<boolean>;
  findConfigFile(patterns: readonly string[]): Promise<string | undefined>;
  hasEditorConfigInCwd(): Promise<boolean>;

  exec(command: string, args: string[]): Promise<ExecResult>;
  getChangedLines(): Promise<string[]>;
  getRequiredMajorVersionFromConfig(
    patterns: readonly string[],
  ): Promise<RequiredMajorVersion>;
  getInstalledToolMajorVersion(command: string): Promise<string | undefined>;

  warn(message: string): void;
}

export type RunnerPredicate =
  | ((ctx: RunnerContext) => Promise<boolean> | boolean)
  | undefined;

export interface MajorVersionFromConfigRequirement {
  patterns: readonly string[];
  /**
   * Optional command used for <cmd> --version lookup.
   * Defaults to the command/tool declared in launcher.
   */
  command?: string;
  onInvalid?: "warn-skip" | "skip";
  onMismatch?: "warn-skip" | "skip";
}

export interface RunnerRequirements {
  majorVersionFromConfig?: MajorVersionFromConfigRequirement;
}

interface RunnerBase {
  id: string;
  launcher: RunnerLauncher;
  when?: RunnerPredicate;
  requires?: RunnerRequirements;
}

export interface StaticRunnerDefinition extends RunnerBase {
  args: string[];
  /**
   * Whether to append the target file path as the final argument.
   * Defaults to true.
   */
  appendFile?: boolean;
}

export interface DynamicRunnerDefinition extends RunnerBase {
  buildArgs: (
    ctx: RunnerContext,
  ) => Promise<string[] | undefined> | string[] | undefined;
}

export type RunnerDefinition = StaticRunnerDefinition | DynamicRunnerDefinition;

export interface RunnerGroup {
  mode: RunnerMode;
  runnerIds: string[];
}

export function isDynamicRunner(
  runner: RunnerDefinition,
): runner is DynamicRunnerDefinition {
  return "buildArgs" in runner;
}
