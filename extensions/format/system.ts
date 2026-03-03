import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { delimiter, join } from "node:path";

const commandAvailability = new Map<string, boolean>();

function getExecutableCandidates(command: string): string[] {
  if (process.platform !== "win32") {
    return [command];
  }

  const pathExt = process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM";
  const extensions = pathExt
    .split(";")
    .map((ext) => ext.trim())
    .filter((ext) => ext.length > 0);

  const hasExtension = extensions.some((ext) =>
    command.toLowerCase().endsWith(ext.toLowerCase()),
  );

  if (hasExtension) {
    return [command];
  }

  return [command, ...extensions.map((ext) => `${command}${ext}`)];
}

export async function hasCommand(command: string): Promise<boolean> {
  const cached = commandAvailability.get(command);
  if (cached !== undefined) {
    return cached;
  }

  const pathValue = process.env.PATH ?? "";
  const pathDirs = pathValue
    .split(delimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const candidates = getExecutableCandidates(command);

  for (const directory of pathDirs) {
    for (const candidate of candidates) {
      try {
        await access(join(directory, candidate), constants.X_OK);
        commandAvailability.set(command, true);
        return true;
      } catch {
        // Try next candidate.
      }
    }
  }

  commandAvailability.set(command, false);
  return false;
}
