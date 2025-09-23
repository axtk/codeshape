export function isFlag(x: string) {
    return x.length === 2 ? x.startsWith('-') : x.startsWith('--');
}
