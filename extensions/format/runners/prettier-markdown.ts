import { defineRunner, direct } from "./helpers.js";

const prettierMarkdownRunner = defineRunner({
  id: "prettier-markdown",
  launcher: direct("prettier"),
  args: ["--write"],
});

export default prettierMarkdownRunner;
