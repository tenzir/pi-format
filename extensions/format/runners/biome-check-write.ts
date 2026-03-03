import { defineRunner, direct } from "./helpers.js";
import { BIOME_CONFIG_PATTERNS } from "./config-patterns.js";

const biomeCheckWriteRunner = defineRunner({
  id: "biome-check-write",
  launcher: direct("biome"),
  when: (ctx) => ctx.hasConfig(BIOME_CONFIG_PATTERNS),
  args: ["check", "--write"],
});

export default biomeCheckWriteRunner;
