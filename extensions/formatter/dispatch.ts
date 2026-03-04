import type { ExecResult, ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { FormatRunContext, type FormatWarningReporter } from "./context.js";
import { detectFileKind } from "./path.js";
import { FORMAT_PLAN } from "./plan.js";
import { RUNNERS } from "./runners/index.js";
import {
  isDynamicRunner,
  type ResolvedLauncher,
  type RunnerContext,
  type RunnerDefinition,
  type RunnerGroup,
  type RunnerLauncher,
} from "./types.js";

async function resolveLauncher(
  launcher: RunnerLauncher,
  ctx: RunnerContext,
): Promise<ResolvedLauncher | undefined> {
  if (launcher.type === "direct") {
    if (await ctx.hasCommand(launcher.command)) {
      return { command: launcher.command, argsPrefix: [] };
    }

    return undefined;
  }

  if (launcher.type === "pypi") {
    if (await ctx.hasCommand(launcher.tool)) {
      return { command: launcher.tool, argsPrefix: [] };
    }

    if (await ctx.hasCommand("uv")) {
      return {
        command: "uv",
        argsPrefix: ["tool", "run", launcher.tool],
      };
    }

    return undefined;
  }

  if (await ctx.hasCommand(launcher.tool)) {
    return { command: launcher.tool, argsPrefix: [] };
  }

  if (await ctx.hasCommand("go")) {
    return {
      command: "go",
      argsPrefix: ["run", launcher.module],
    };
  }

  return undefined;
}

function defaultVersionCommand(launcher: RunnerLauncher): string {
  if (launcher.type === "direct") {
    return launcher.command;
  }

  return launcher.tool;
}

async function satisfiesRunnerRequirements(
  ctx: RunnerContext,
  runner: RunnerDefinition,
): Promise<boolean> {
  const requirement = runner.requires?.majorVersionFromConfig;
  if (!requirement) {
    return true;
  }

  const requiredVersion = await ctx.getRequiredMajorVersionFromConfig(
    requirement.patterns,
  );

  if (requiredVersion === undefined) {
    return true;
  }

  if (requiredVersion === "invalid") {
    const onInvalid = requirement.onInvalid ?? "warn-skip";
    if (onInvalid === "warn-skip") {
      ctx.warn(
        `${runner.id} skipped: invalid version requirement in ${requirement.patterns.join(", ")}`,
      );
    }

    return false;
  }

  const versionCommand =
    requirement.command ?? defaultVersionCommand(runner.launcher);
  const installedVersion =
    await ctx.getInstalledToolMajorVersion(versionCommand);

  if (installedVersion === requiredVersion) {
    return true;
  }

  const onMismatch = requirement.onMismatch ?? "warn-skip";
  if (onMismatch === "warn-skip") {
    ctx.warn(
      `${runner.id} skipped: ${versionCommand} version mismatch (have ${installedVersion ?? "unknown"}, need ${requiredVersion})`,
    );
  }

  return false;
}

async function resolveRunnerArgs(
  ctx: RunnerContext,
  runner: RunnerDefinition,
): Promise<string[] | undefined> {
  if (isDynamicRunner(runner)) {
    return runner.buildArgs(ctx);
  }

  const args = [...runner.args];
  if (runner.appendFile !== false) {
    args.push(ctx.filePath);
  }

  return args;
}

type RunnerOutcome = "skipped" | "failed" | "succeeded";

export interface FormatCallSummary {
  runnerId: string;
  status: "succeeded" | "failed";
  exitCode?: number;
  failureMessage?: string;
}

export type FormatCallSummaryReporter = (summary: FormatCallSummary) => void;

const MAX_FAILURE_MESSAGE_LENGTH = 140;
const ANSI_ESCAPE = String.fromCharCode(27);
const ANSI_COLOR_SEQUENCE_PATTERN = new RegExp(
  `${ANSI_ESCAPE}\\[[0-9;]*m`,
  "g",
);

function normalizeFailureLine(line: string): string {
  return line
    .replace(ANSI_COLOR_SEQUENCE_PATTERN, "")
    .replace(/^\s*\[error\]\s*/i, "")
    .replace(/^\s*error:\s*/i, "")
    .replace(/^\s*[×✖✘]\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeFailureMessage(result: ExecResult): string | undefined {
  const lines = `${result.stderr}\n${result.stdout}`
    .split(/\r?\n/)
    .map((line) => normalizeFailureLine(line))
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return undefined;
  }

  const withMarker = lines.find((line) =>
    /\b(error|failed|invalid|unexpected|expected|syntax)\b/i.test(line),
  );
  const message = withMarker ?? lines[0];

  return message.length <= MAX_FAILURE_MESSAGE_LENGTH
    ? message
    : `${message.slice(0, MAX_FAILURE_MESSAGE_LENGTH - 1)}…`;
}

async function runRunner(
  ctx: RunnerContext,
  runner: RunnerDefinition,
  summaryReporter?: FormatCallSummaryReporter,
): Promise<RunnerOutcome> {
  const launcher = await resolveLauncher(runner.launcher, ctx);
  if (!launcher) {
    return "skipped";
  }

  if (runner.when && !(await runner.when(ctx))) {
    return "skipped";
  }

  if (!(await satisfiesRunnerRequirements(ctx, runner))) {
    return "skipped";
  }

  const args = await resolveRunnerArgs(ctx, runner);
  if (!args) {
    return "skipped";
  }

  const commandArgs = [...launcher.argsPrefix, ...args];

  const result = await ctx.exec(launcher.command, commandArgs);

  if (result.code !== 0) {
    const failureMessage = summarizeFailureMessage(result);

    summaryReporter?.({
      runnerId: runner.id,
      status: "failed",
      exitCode: result.code,
      failureMessage,
    });

    ctx.warn(
      `${runner.id} failed (${result.code})${failureMessage ? `: ${failureMessage}` : ""}`,
    );
    return "failed";
  }

  summaryReporter?.({
    runnerId: runner.id,
    status: "succeeded",
  });

  return "succeeded";
}

async function runRunnerGroup(
  ctx: RunnerContext,
  group: RunnerGroup,
  summaryReporter?: FormatCallSummaryReporter,
): Promise<void> {
  if (group.mode === "all") {
    for (const runnerId of group.runnerIds) {
      const runner = RUNNERS.get(runnerId);
      if (!runner) {
        ctx.warn(`unknown runner in format plan: ${runnerId}`);
        continue;
      }

      await runRunner(ctx, runner, summaryReporter);
    }

    return;
  }

  const fallbackSummaries: FormatCallSummary[] = [];
  const fallbackSummaryReporter = summaryReporter
    ? (summary: FormatCallSummary) => {
        fallbackSummaries.push(summary);
      }
    : undefined;

  for (const runnerId of group.runnerIds) {
    const runner = RUNNERS.get(runnerId);
    if (!runner) {
      ctx.warn(`unknown runner in format plan: ${runnerId}`);
      continue;
    }

    const outcome = await runRunner(ctx, runner, fallbackSummaryReporter);
    if (outcome === "succeeded") {
      if (!summaryReporter) {
        return;
      }

      const successSummary = [...fallbackSummaries]
        .reverse()
        .find((summary) => summary.status === "succeeded");
      if (successSummary) {
        summaryReporter(successSummary);
      }

      return;
    }
  }

  if (!summaryReporter) {
    return;
  }

  const lastFailureSummary = [...fallbackSummaries]
    .reverse()
    .find((summary) => summary.status === "failed");

  if (lastFailureSummary) {
    summaryReporter(lastFailureSummary);
  }
}

export async function formatFile(
  pi: ExtensionAPI,
  cwd: string,
  filePath: string,
  timeoutMs: number,
  summaryReporter?: FormatCallSummaryReporter,
  warningReporter?: FormatWarningReporter,
): Promise<void> {
  const kind = detectFileKind(filePath);
  if (!kind) {
    return;
  }

  const groups = FORMAT_PLAN[kind];
  if (!groups || groups.length === 0) {
    return;
  }

  const runContext = new FormatRunContext(
    pi,
    cwd,
    filePath,
    kind,
    timeoutMs,
    warningReporter,
  );

  for (const group of groups) {
    await runRunnerGroup(runContext, group, summaryReporter);
  }
}
