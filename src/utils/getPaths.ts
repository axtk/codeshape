import { availableScriptNames } from "../const/availableScriptNames.ts";
import { isFlag } from "./isFlag.ts";

export async function getPaths(): Promise<string[]> {
  let scriptNamesEnded = false;
  let paths: string[] = [];

  for (let arg of process.argv.slice(2)) {
    if (isFlag(arg)) break;

    if (scriptNamesEnded) paths.push(arg);

    if (!scriptNamesEnded && availableScriptNames.has(arg))
      scriptNamesEnded = true;
  }

  return paths;
}
