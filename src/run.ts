#!/usr/bin/env node
import { exec as defaultExec } from "node:child_process";
import { access, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { getPaths } from "./getPaths";
import { isFlag } from "./isFlag";

const exec = promisify(defaultExec);
const execOutput = async (cmd: string) => (await exec(cmd)).stdout.trim();

const { argv } = process;

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

function getCommitMessage() {
  let k = argv.indexOf("-m");

  return k !== -1 && argv[k + 1] && !isFlag(argv[k + 1]) ? argv[k + 1] : "lint";
}

type BiomeConfig = {
  $schema?: string;
  files?: {
    includes?: string[];
  };
  vcs?: {
    enabled?: boolean;
  };
};

async function run() {
  let isGitDir = false;
  let includes: string[] = [];

  try {
    await access("./.git");
    isGitDir = true;
  }
  catch {}

  try {
    includes = (await readFile("./.biomeincludes"))
      .toString()
      .trim()
      .split(/\r?\n/)
      .filter(x => x !== "");
  }
  catch {}

  let hasOwnConfig = (await Promise.all(
    ["./biome.json", "./biome.jsonc"].map(async (path) => {
      try {
        await access(path);
        return true;
      }
      catch {
        return false;
      }
    }),
  )).includes(true);

  if (!hasOwnConfig) {
    let configPath = join(__dirname, "_biome.json");
    let config = JSON.parse((await readFile(configPath)).toString()) as BiomeConfig;

    if (config.$schema) {
      let version = await execOutput("npm view @biomejs/biome version");

      if (version)
        config.$schema = config.$schema.replace(/\/\d+\.\d+\.\d+\//, `/${version}/`);
    }

    config.vcs = {
      ...config.vcs,
      enabled: isGitDir && !argv.includes("--vcs-disabled"),
    };

    if (includes.length !== 0)
      config.files = {
        ...config.files,
        includes,
      };

    await writeFile("./biome.json", JSON.stringify(config, null, 2));

    tempFiles.push("./biome.json");
  }

  let { stdout, stderr } = await exec(
    `npx @biomejs/biome check --write ${(await getPaths()).join(" ")}`,
  );

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await cleanup();

  if (isGitDir && !stderr && !argv.includes("--no-commit")) {
    try {
      await exec("git add *");

      let updated = (await execOutput("git diff --cached --name-only")) !== "";

      if (updated) await exec(`git commit -m ${JSON.stringify(getCommitMessage())}`);
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
