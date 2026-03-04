import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@mariozechner/pi-coding-agent";

const DEFAULT_COMMAND_TIMEOUT_MS = 10_000;
const DEFAULT_HIDE_CALL_SUMMARIES_IN_TUI = false;
const FORMATTER_CONFIG_FILE = "formatter.json";

type FormatterConfig = {
  commandTimeoutMs: number;
  hideCallSummariesInTui: boolean;
};

function getFormatterConfigPath(): string {
  return join(getAgentDir(), FORMATTER_CONFIG_FILE);
}

function readJsonObject(filePath: string): Record<string, unknown> | undefined {
  try {
    if (!existsSync(filePath)) {
      return undefined;
    }

    const content = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function parsePositiveInt(value: unknown, defaultValue: number): number {
  if (typeof value !== "number") {
    return defaultValue;
  }

  if (!Number.isInteger(value) || value <= 0) {
    return defaultValue;
  }

  return value;
}

function parseBooleanValue(value: unknown, defaultValue: boolean): boolean {
  if (typeof value !== "boolean") {
    return defaultValue;
  }

  return value;
}

function loadFormatterConfig(): FormatterConfig {
  const config = readJsonObject(getFormatterConfigPath());

  if (!config) {
    return {
      commandTimeoutMs: DEFAULT_COMMAND_TIMEOUT_MS,
      hideCallSummariesInTui: DEFAULT_HIDE_CALL_SUMMARIES_IN_TUI,
    };
  }

  return {
    commandTimeoutMs: parsePositiveInt(
      config.commandTimeoutMs,
      DEFAULT_COMMAND_TIMEOUT_MS,
    ),
    hideCallSummariesInTui: parseBooleanValue(
      config.hideCallSummariesInTui,
      DEFAULT_HIDE_CALL_SUMMARIES_IN_TUI,
    ),
  };
}

const formatterConfig = loadFormatterConfig();

export const commandTimeoutMs = formatterConfig.commandTimeoutMs;
export const hideCallSummariesInTui = formatterConfig.hideCallSummariesInTui;
