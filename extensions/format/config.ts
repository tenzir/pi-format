const DEFAULT_COMMAND_TIMEOUT_MS = 10_000;

const configuredTimeoutMs = Number.parseInt(
  process.env.PI_FORMAT_COMMAND_TIMEOUT_MS ?? "",
  10,
);

export const commandTimeoutMs =
  Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
    ? configuredTimeoutMs
    : DEFAULT_COMMAND_TIMEOUT_MS;
