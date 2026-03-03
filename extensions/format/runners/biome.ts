import { BIOME_CONFIG_PATTERNS } from "./config-patterns.js";
import { defineRunner, direct } from "./helpers.js";

const biomeRunner = defineRunner({
  id: "biome",
  launcher: direct("biome"),
  when: (ctx) => ctx.hasConfig(BIOME_CONFIG_PATTERNS),
  args: ["check", "--write"],
});

export default biomeRunner;
