import { basename } from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
  commandTimeoutMs,
  hideCallSummariesInTui,
} from "./formatter/config.js";
import { type FormatCallSummary, formatFile } from "./formatter/dispatch.js";
import {
  getPathForGit,
  pathExists,
  resolveToolPath,
} from "./formatter/path.js";
import type { SourceTool } from "./formatter/types.js";

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatSummaryPath(filePath: string, cwd: string): string {
  const pathForDisplay = getPathForGit(filePath, cwd);
  return pathForDisplay.startsWith("/")
    ? basename(pathForDisplay)
    : pathForDisplay;
}

function formatCallSuccessSummary(summary: FormatCallSummary): string {
  return `✔︎ ${summary.runnerId}`;
}

function formatCallFailureSummary(summary: FormatCallSummary): string {
  if (summary.failureMessage) {
    return `✘ ${summary.runnerId}: ${summary.failureMessage}`;
  }

  if (summary.exitCode !== undefined) {
    return `✘ ${summary.runnerId} (exit ${summary.exitCode})`;
  }

  return `✘ ${summary.runnerId}`;
}

export default function (pi: ExtensionAPI) {
  const formatQueueByPath = new Map<string, Promise<void>>();

  const enqueueFormat = async (
    filePath: string,
    run: () => Promise<void>,
  ): Promise<void> => {
    const previous = formatQueueByPath.get(filePath) ?? Promise.resolve();
    const next = previous
      .catch(() => {
        // Keep the queue alive after a failure.
      })
      .then(run)
      .finally(() => {
        if (formatQueueByPath.get(filePath) === next) {
          formatQueueByPath.delete(filePath);
        }
      });

    formatQueueByPath.set(filePath, next);
    await next;
  };

  pi.on("tool_result", async (event, ctx) => {
    if (event.isError) {
      return;
    }

    if (event.toolName !== "write" && event.toolName !== "edit") {
      return;
    }

    const rawPath = (event.input as { path?: unknown }).path;
    if (typeof rawPath !== "string" || rawPath.length === 0) {
      return;
    }

    const sourceTool = event.toolName as SourceTool;
    const filePath = resolveToolPath(rawPath, ctx.cwd);

    if (!(await pathExists(filePath))) {
      return;
    }

    const showSummaries = !hideCallSummariesInTui && ctx.hasUI;
    const notifyWarning = (message: string) => {
      const normalizedMessage = message.replace(/\s+/g, " ").trim();

      if (ctx.hasUI) {
        ctx.ui.notify(normalizedMessage, "warning");
        return;
      }

      console.warn(normalizedMessage);
    };

    await enqueueFormat(filePath, async () => {
      const summaries: FormatCallSummary[] = [];
      const summaryReporter = showSummaries
        ? (summary: FormatCallSummary) => {
            summaries.push(summary);
          }
        : undefined;

      const runnerWarningReporter =
        showSummaries && ctx.hasUI
          ? () => {
              // Summary mode already reports failures compactly.
            }
          : notifyWarning;

      try {
        await formatFile(
          pi,
          ctx.cwd,
          sourceTool,
          filePath,
          commandTimeoutMs,
          summaryReporter,
          runnerWarningReporter,
        );
      } catch (error) {
        const fileLabel = formatSummaryPath(filePath, ctx.cwd);
        notifyWarning(`Failed to format ${fileLabel}: ${formatError(error)}`);
      }

      if (!showSummaries || summaries.length === 0) {
        return;
      }

      for (const summary of summaries) {
        if (summary.status === "succeeded") {
          ctx.ui.notify(formatCallSuccessSummary(summary), "info");
          continue;
        }

        ctx.ui.notify(formatCallFailureSummary(summary), "info");
      }
    });
  });
}
