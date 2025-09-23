#!/usr/bin/env node
import { exec as defaultExec } from "node:child_process";
import { access, cp, unlink } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { getPaths } from "./getPaths";
import { isFlag } from "./isFlag";

const exec = promisify(defaultExec);

let tempFiles: string[] = [];

async function cleanup() {
  tempFiles = (
    await Promise.all(
      tempFiles.map(async (path) => {
        try {
          await access(path);
          await unlink(path);

          return path;
        } catch {
          return null;
        }
      }),
    )
  ).filter((path) => path !== null);
}

async function run() {
  try {
    await Promise.all(["./biome.json", "./biome.jsonc"].map((x) => access(x)));
  } catch {
    await cp(join(__dirname, "_biome.json"), "./biome.json");

    tempFiles.push("./biome.json");
  }

  let { stdout, stderr } = await exec(
    `npx @biomejs/biome check --write ${(await getPaths()).join(" ")}`,
  );

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await cleanup();

  let commitFlagIndex = process.argv.indexOf("--git-commit");

  if (!stderr && commitFlagIndex !== -1) {
    let commitMessage = process.argv[commitFlagIndex + 1];

    if (!commitMessage || isFlag(commitMessage)) commitMessage = "lint";

    try {
      await exec("git add *");

      let updated =
        (await exec("git diff --cached --name-only")).stdout.trim() !== "";

      if (updated) await exec(`git commit -m ${JSON.stringify(commitMessage)}`);
    } catch {}
  }
}

type ExecError = {
  cmd: string;
  stdout?: string;
  stderr?: string;
};

function isExecError(x: unknown): x is ExecError {
  return x instanceof Error && "cmd" in x;
}

(async () => {
  try {
    await run();
  } catch (error) {
    await cleanup();

    if (!isExecError(error)) throw error;

    if (error.stderr) console.log(error.stderr);
    if (error.stdout) console.log(error.stdout);

    process.exit(1);
  }
})();
