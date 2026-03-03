import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_COMMAND_TIMEOUT_MS = 10_000;
const DEFAULT_HIDE_CALL_SUMMARIES_IN_TUI = false;
const FORMATTER_CONFIG_FILE = "formatter.json";

const TRUE_CONFIG_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_CONFIG_VALUES = new Set(["0", "false", "no", "off"]);

type FormatterConfig = {
  commandTimeoutMs: number;
  hideCallSummariesInTui: boolean;
};

function expandHome(pathValue: string): string {
  if (pathValue === "~") {
    return homedir();
  }

  if (pathValue.startsWith("~/") || pathValue.startsWith("~\\")) {
    return join(homedir(), pathValue.slice(2));
  }

  return pathValue;
}

function getAgentDir(): string {
  return process.env.PI_CODING_AGENT_DIR
    ? expandHome(process.env.PI_CODING_AGENT_DIR)
    : join(homedir(), ".pi", "agent");
}

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
  if (typeof value === "number") {
    if (Number.isInteger(value) && value > 0) {
      return value;
    }

    return defaultValue;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!/^[1-9][0-9]*$/.test(normalized)) {
      return defaultValue;
    }

    const parsed = Number.parseInt(normalized, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return defaultValue;
}

function parseBooleanValue(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) {
    return defaultValue;
  }

  if (TRUE_CONFIG_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_CONFIG_VALUES.has(normalized)) {
    return false;
  }

  return defaultValue;
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
