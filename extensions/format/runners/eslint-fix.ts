import { ESLINT_CONFIG_PATTERNS } from "./config-patterns.js";
import { defineRunner, direct } from "./helpers.js";

const eslintFixRunner = defineRunner({
  id: "eslint-fix",
  launcher: direct("eslint"),
  when: (ctx) => ctx.hasConfig(ESLINT_CONFIG_PATTERNS),
  args: ["--fix"],
});

export default eslintFixRunner;
