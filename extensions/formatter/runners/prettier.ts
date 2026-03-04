import { defineRunner, direct } from "./helpers.js";

const prettierRunner = defineRunner({
  id: "prettier",
  launcher: direct("prettier"),
  args: ["--write"],
});

export default prettierRunner;
