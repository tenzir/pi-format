import { defineRunner, direct } from "./helpers.js";

const markdownlintRunner = defineRunner({
  id: "markdownlint",
  launcher: direct("markdownlint"),
  args: ["--fix"],
});

export default markdownlintRunner;
