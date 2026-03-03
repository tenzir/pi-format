import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import type { FileKind } from "./types.js";

export function normalizeToolPath(filePath: string): string {
  const normalizedAt = filePath.startsWith("@") ? filePath.slice(1) : filePath;

  if (normalizedAt === "~") {
    return homedir();
  }

  if (normalizedAt.startsWith("~/")) {
    return join(homedir(), normalizedAt.slice(2));
  }

  return normalizedAt;
}

export function resolveToolPath(filePath: string, cwd: string): string {
  const normalizedPath = normalizeToolPath(filePath);
  return isAbsolute(normalizedPath)
    ? normalizedPath
    : resolve(cwd, normalizedPath);
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function isWithinDirectory(pathToCheck: string, directory: string): boolean {
  const relPath = relative(directory, pathToCheck);
  return (
    relPath === "" ||
    relPath === "." ||
    (!relPath.startsWith("..") && !isAbsolute(relPath))
  );
}

export function getPathForGit(filePath: string, cwd: string): string {
  const relPath = relative(cwd, filePath);
  if (
    !relPath ||
    relPath === "." ||
    relPath.startsWith("..") ||
    isAbsolute(relPath)
  ) {
    return filePath;
  }

  return relPath;
}

export function detectFileKind(filePath: string): FileKind | undefined {
  if (/\.(cpp|hpp|cpp\.in|hpp\.in)$/.test(filePath)) {
    return "cxx";
  }

  if (/\.cmake$/.test(filePath) || basename(filePath) === "CMakeLists.txt") {
    return "cmake";
  }

  if (/\.(md|mdx)$/.test(filePath)) {
    return "markdown";
  }

  if (/\.json$/.test(filePath)) {
    return "json";
  }

  if (/\.(sh|bash)$/.test(filePath)) {
    return "shell";
  }

  if (/\.py$/.test(filePath)) {
    return "python";
  }

  if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(filePath)) {
    return "jsts";
  }

  return undefined;
}
