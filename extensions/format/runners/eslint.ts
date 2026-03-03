import { ESLINT_CONFIG_PATTERNS } from "./config-patterns.js";
import { defineRunner, direct } from "./helpers.js";

const eslintRunner = defineRunner({
  id: "eslint",
  launcher: direct("eslint"),
  when: (ctx) => ctx.hasConfig(ESLINT_CONFIG_PATTERNS),
  args: ["--fix"],
});

export default eslintRunner;
