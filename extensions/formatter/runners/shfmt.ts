import { defineRunner, goTool } from "./helpers.js";

const SHFMT_MODULE = "mvdan.cc/sh/v3/cmd/shfmt@v3.10.0";

const shfmtRunner = defineRunner({
  id: "shfmt",
  launcher: goTool("shfmt", SHFMT_MODULE),
  async buildArgs(ctx) {
    const hasEditorConfig = await ctx.hasEditorConfigInCwd();

    if (hasEditorConfig) {
      return ["-w", ctx.filePath];
    }

    return ["-i", "2", "-ci", "-bn", "-w", ctx.filePath];
  },
});

export default shfmtRunner;
