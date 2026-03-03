import { defineRunner, pypi } from "./helpers.js";

const ruffCheckRunner = defineRunner({
  id: "ruff-check",
  launcher: pypi("ruff"),
  args: ["check", "--fix"],
});

export default ruffCheckRunner;
