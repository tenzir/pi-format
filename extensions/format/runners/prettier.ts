import { PRETTIER_CONFIG_PATTERNS } from "./config-patterns.js";
import { defineRunner, direct } from "./helpers.js";

const prettierRunner = defineRunner({
  id: "prettier",
  launcher: direct("prettier"),
  when: (ctx) =>
    ctx.kind === "markdown" || ctx.hasConfig(PRETTIER_CONFIG_PATTERNS),
  args: ["--write"],
});

export default prettierRunner;
