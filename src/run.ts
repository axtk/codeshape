#!/usr/bin/env node
import {exec as defaultExec} from 'node:child_process';
import {access, cp, unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {getPaths} from './getPaths';

const exec = promisify(defaultExec);

let tempFiles: string[] = [];

async function run() {
    try {
        await Promise.all(
            ['./biome.json', './biome.jsonc'].map(x => access(x)),
        );
    } catch {
        await cp(join(__dirname, '_biome.json'), './biome.json');

        tempFiles.push('./biome.json');
    }

    await exec(
        `npx @biomejs/biome check --write ${(await getPaths()).join(' ')}`,
    );
}

(async () => {
    try {
        await run();
    } finally {
        await Promise.all(tempFiles.map(x => unlink(x)));
    }
})();
