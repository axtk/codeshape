#!/usr/bin/env node
import { compile } from "./compile.ts";
import { availableScriptNames } from "./const/availableScriptNames.ts";
import { runLintFormat } from "./runLintFormat.ts";
import { runTypeCheck } from "./runTypeCheck.ts";
import { isExecError } from "./utils/isExecError.ts";
import { tempFiles } from "./utils/tempFiles.ts";

function getScriptSequence(): string[] {
  let args = process.argv.slice(2);

  // Deprecated
  if (args.includes("--typecheck-only")) return ["typecheck"];
  if (args.includes("--lint-format-only")) return ["lint", "format"];
  if (args.includes("--compile-only")) return ["compile"];
  if (args.includes("--check")) return ["typecheck", "lint", "format"];

  let scripts: string[] = [];

  for (let arg of args) {
    if (!availableScriptNames.has(arg)) break;

    if (arg === "check") scripts.push("typecheck", "lint", "format");
    else scripts.push(arg);
  }

  if (scripts.length === 0)
    scripts = ["typecheck", "lint", "format", "compile"];

  let scriptSet = new Set(scripts);

  // Deprecated
  if (args.includes("--no-typecheck")) scriptSet.delete("typecheck");
  if (args.includes("--no-lint-format")) {
    scriptSet.delete("lint");
    scriptSet.delete("format");
  }
  if (args.includes("--no-compile")) scriptSet.delete("compile");

  return Array.from(scriptSet);
}

async function run() {
  let scripts = getScriptSequence();

  let lintIndex = scripts.indexOf("lint");
  let formatIndex = scripts.indexOf("format");

  // Combine linting and formatting, if these tasks are adjacent in the list
  let shouldLintFormatCombined = lintIndex !== -1 && formatIndex !== -1 && Math.abs(lintIndex - formatIndex) === 1;

  for (let name of scripts) {
    switch (name) {
      case "typecheck":
        await runTypeCheck();
        break;
      case "lint":
        await runLintFormat({ lint: true, format: shouldLintFormatCombined });
        break;
      case "format":
        if (!shouldLintFormatCombined)
          await runLintFormat({ lint: false, format: true });
        break;
      case "compile":
        await compile();
        break;
    }
  }
}

(async () => {
  try {
    await run();
  } catch (error) {
    await tempFiles.remove("all");

    if (!isExecError(error)) throw error;

    if (error.stderr) console.log(error.stderr);
    if (error.stdout) console.log(error.stdout);

    process.exit(1);
  }
})();
