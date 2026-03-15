import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDuration } from "dateshape";
import { exec } from "./utils/exec.ts";
import { getArgValue } from "./utils/getArgValue.ts";
import { getArgValues } from "./utils/getArgValues.ts";
import { log } from "./utils/log.ts";

const { argv } = process;

export async function compile() {
  let t0 = Date.now();
  log("Compile [tsdown]");

  let input = getArgValues("--compile-input", ["./index.ts"]);
  let outputDir = getArgValue("--compile-output", "./dist");
  let platform = getArgValue("--compile-platform");
  let tsConfigPath = getArgValue("--tsconfig");

  let esmOnly = argv.includes("--esm-only");
  let hasDts = !argv.includes("--no-dts");

  let params = [
    input.join(" "),
    `-d ${outputDir}`,
    hasDts && "--dts",
    argv.includes("--minify") && "--minify",
    platform && `--platform ${platform}`,
    tsConfigPath && `--tsconfig ${tsConfigPath}`,
    "--format esm",
  ].filter((x) => typeof x === "string");

  if (!esmOnly) params.push("--format cjs");

  let { stdout, stderr } = await exec(`tsdown ${params.join(" ")}`);
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  try {
    await unlink(join(outputDir, "index.d.cts"));
  } catch {}

  try {
    await rename(join(outputDir, "index.d.mts"), join(outputDir, "index.d.ts"));
  } catch {}

  await Promise.all(
    ["index.cjs", "index.mjs", "index.d.ts"].map(async (name) => {
      try {
        let path = join(outputDir, name);
        let s = (await readFile(path)).toString();

        s = s
          .replace(/^\/\/#(region \S+|endregion)$/gm, "")
          .replace(/\r\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .replace(/^\t+/gm, (t) => t.replaceAll("\t", "  "))
          .trim();

        await writeFile(path, `${s}\n`);
      } catch {}
    }),
  );

  let outputFiles: Record<string, string> = {};

  if (esmOnly) {
    try {
      await rename(join(outputDir, "index.mjs"), join(outputDir, "index.js"));
    } catch {}

    outputFiles.main = `${outputDir}/index.js`;
  }
  else {
    outputFiles.main = `${outputDir}/index.cjs`;
    outputFiles.module = `${outputDir}/index.mjs`;
  }

  if (hasDts) outputFiles.types = `${outputDir}/index.d.ts`;

  console.log(JSON.stringify(outputFiles, null, 2));
}
