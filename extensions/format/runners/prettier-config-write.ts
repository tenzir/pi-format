import { PRETTIER_CONFIG_PATTERNS } from "./config-patterns.js";
import { defineRunner, direct } from "./helpers.js";

const prettierConfigWriteRunner = defineRunner({
  id: "prettier-config-write",
  launcher: direct("prettier"),
  when: (ctx) => ctx.hasConfig(PRETTIER_CONFIG_PATTERNS),
  args: ["--write"],
});

export default prettierConfigWriteRunner;
