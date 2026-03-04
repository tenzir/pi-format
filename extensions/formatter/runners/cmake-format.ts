import { defineRunner, pypi } from "./helpers.js";

const cmakeFormatRunner = defineRunner({
  id: "cmake-format",
  launcher: pypi("cmake-format"),
  args: ["--in-place"],
});

export default cmakeFormatRunner;
