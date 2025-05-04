#!/usr/bin/env node
import {exec as defaultExec} from 'node:child_process';
import {access, cp, unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {promisify} from 'node:util';

const exec = promisify(defaultExec);

const defaultPaths = [
    'src',
    'lib',
    'index.ts',
    'tests.ts',
    'index.js',
    'tests.js',
];

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

    let paths = process.argv.slice(2);

    if (paths.length === 0) {
        paths = (
            await Promise.all(
                defaultPaths.map(async path => {
                    try {
                        await access(path);

                        return path;
                    } catch {
                        return null;
                    }
                }),
            )
        ).filter(path => path !== null);
    }

    await exec(`npx @biomejs/biome check --write ${paths.join(' ')}`);
}

(async () => {
    try {
        await run();
    } finally {
        await Promise.all(tempFiles.map(x => unlink(x)));
    }
})();
