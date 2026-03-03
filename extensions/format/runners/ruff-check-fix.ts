import { defineRunner, pypi } from "./helpers.js";

const ruffCheckFixRunner = defineRunner({
  id: "ruff-check-fix",
  launcher: pypi("ruff"),
  args: ["check", "--fix"],
});

export default ruffCheckFixRunner;
