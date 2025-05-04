import {access} from 'node:fs/promises';

const defaultPaths = [
    'src',
    'lib',
    'index.ts',
    'tests.ts',
    'index.js',
    'tests.js',
];

export async function getPaths(): Promise<string[]> {
    let paths: string[] = [];

    for (let arg of process.argv.slice(2)) {
        let isFlag =
            arg.length === 2 ? arg.startsWith('-') : arg.startsWith('--');

        if (isFlag) break;

        paths.push(arg);
    }

    if (paths.length !== 0) return paths;

    return (
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
