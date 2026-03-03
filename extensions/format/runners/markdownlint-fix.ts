import { defineRunner, direct } from "./helpers.js";

const markdownlintFixRunner = defineRunner({
  id: "markdownlint-fix",
  launcher: direct("markdownlint"),
  args: ["--fix"],
});

export default markdownlintFixRunner;
