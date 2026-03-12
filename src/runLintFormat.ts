import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDuration } from "dateshape";
import type { BiomeConfig } from "./types/BiomeConfig.ts";
import { canAccess } from "./utils/canAccess.ts";
import { currentDirName } from "./utils/currentDirName.ts";
import { exec } from "./utils/exec.ts";
import { execOutput } from "./utils/execOutput.ts";
import { getArgValue } from "./utils/getArgValue.ts";
import { getPaths } from "./utils/getPaths.ts";
import { log } from "./utils/log.ts";
import { tempFiles } from "./utils/tempFiles.ts";

async function getEffectiveLines(fileName: string) {
  return (await readFile(fileName))
    .toString()
    .trim()
    .split(/\r?\n/)
    .filter((x) => x.trim() !== "" && !x.startsWith("#"));
}

const ignoreFile = ".lintignore";
const supportedIncludeFiles = [
  ".lintinclude",
  ".lintincludes",
  ".biomeincludes",
];
const preferredIncludeFile = supportedIncludeFiles[0];

export type LintFormatOptions = {
  lint?: boolean;
  format?: boolean;
};

export async function runLintFormat({ lint = true, format = true }: LintFormatOptions = {}) {
  let t0 = Date.now();
  let message = "Lint";
  let cmd = "lint";

  if (lint && format) {
    message = "Lint and format";
    cmd = "check";
  }
  else if (format) {
    message = "Format";
    cmd = "format";
  }

  log(`${message} [biome]`);

  let includes: string[] = [];
  let isGitDir = await canAccess("./.git");

  for (let includeFile of supportedIncludeFiles) {
    if (await canAccess(includeFile)) {
      if (includeFile !== preferredIncludeFile)
        log(
          `File name "${includeFile}" is deprecated, use "${preferredIncludeFile}" instead.`,
        );

      try {
        includes = await getEffectiveLines(includeFile);
        break;
      } catch {}
    }
  }

  if (await canAccess(ignoreFile)) {
    try {
      let ignores = await getEffectiveLines(ignoreFile);

      if (ignores.length !== 0) includes.push(...ignores.map((s) => `!${s}`));
    } catch {}
  }

  // If `includes` lists only negations, add all files first to exclude from
  if (includes.length !== 0 && includes.every((x) => x.startsWith("!")))
    includes.unshift("**");

  let hasOwnConfig = (
    await Promise.all(["./biome.json", "./biome.jsonc"].map(canAccess))
  ).includes(true);

  if (!hasOwnConfig) {
    let configPath = join(currentDirName, "_biome.json");
    let config = JSON.parse(
      (await readFile(configPath)).toString(),
    ) as BiomeConfig;

    delete config.$schema;

    config.vcs = {
      ...config.vcs,
      enabled: isGitDir && !process.argv.includes("--vcs-disabled"),
    };

    if (config.vcs.clientKind === "git" && config.vcs.useIgnoreFile)
      config.vcs.useIgnoreFile = await canAccess("./.gitignore");

    if (includes.length !== 0)
      config.files = {
        ...config.files,
        includes,
      };

    await writeFile("./biome.json", JSON.stringify(config, null, 2));

    tempFiles.push("./biome.json", "lint-format");
  }

  let { stdout, stderr } = await exec(
    `biome ${cmd} --write ${(await getPaths()).join(" ")}`,
  );
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await tempFiles.remove("lint-format");

  if (isGitDir && !stderr && !process.argv.includes("--no-commit")) {
    try {
      await exec("git add *");

      let updated = (await execOutput("git diff --cached --name-only")) !== "";

      if (updated)
        await exec(
          `git commit -m ${JSON.stringify(getArgValue("-m", "lint"))}`,
        );
    } catch {}
  }
}
