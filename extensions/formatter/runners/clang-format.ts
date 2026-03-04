import { defineRunner, direct } from "./helpers.js";

const clangFormatRunner = defineRunner({
  id: "clang-format",
  launcher: direct("clang-format"),
  requires: {
    majorVersionFromConfig: {
      patterns: [".clang-format-version"],
      onInvalid: "warn-skip",
      onMismatch: "warn-skip",
    },
  },
  async buildArgs(ctx) {
    const changedLines = await ctx.getChangedLines();
    if (changedLines.length > 0) {
      return [
        ...changedLines.map((line) => `--lines=${line}`),
        "-i",
        ctx.filePath,
      ];
    }

    return ["-i", ctx.filePath];
  },
});

export default clangFormatRunner;
