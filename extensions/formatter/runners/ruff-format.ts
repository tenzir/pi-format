import { defineRunner, pypi } from "./helpers.js";

const ruffFormatRunner = defineRunner({
  id: "ruff-format",
  launcher: pypi("ruff"),
  args: ["format"],
});

export default ruffFormatRunner;
