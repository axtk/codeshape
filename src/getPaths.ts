export async function getPaths(): Promise<string[]> {
    let paths: string[] = [];

    for (let arg of process.argv.slice(2)) {
        let isFlag =
            arg.length === 2 ? arg.startsWith('-') : arg.startsWith('--');

        if (isFlag) break;

        paths.push(arg);
    }

    return paths;
}
