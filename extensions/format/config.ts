const DEFAULT_COMMAND_TIMEOUT_MS = 10_000;

const configuredTimeoutMs = Number.parseInt(
  process.env.PI_FORMAT_COMMAND_TIMEOUT_MS ?? "",
  10,
);

export const commandTimeoutMs =
  Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
    ? configuredTimeoutMs
    : DEFAULT_COMMAND_TIMEOUT_MS;

const TRUE_ENV_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_ENV_VALUES = new Set(["0", "false", "no", "off"]);

function parseBooleanEnv(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) {
    return defaultValue;
  }

  if (TRUE_ENV_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_ENV_VALUES.has(normalized)) {
    return false;
  }

  return defaultValue;
}

export const showCallSummariesInTui = parseBooleanEnv(
  process.env.PI_FORMAT_SHOW_CALL_SUMMARIES_IN_TUI,
  true,
);
