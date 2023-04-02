/* eslint-disable no-console */

const configDeps = {};

configDeps.js = [
    'eslint',
    'eslint-plugin-import',
    'eslint-plugin-simple-import-sort',
    'eslint-plugin-prefer-let',
    'eslint-plugin-markdown',
];

configDeps.ts = [
    ...configDeps.js,
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-import-resolver-typescript',
];

configDeps['ts-react'] = [
    ...configDeps.ts,
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'eslint-plugin-jsx-a11y',
];

configDeps.css = [
    'stylelint',
    'stylelint-config-standard',
];

function hasPackage(name) {
    try {
        process.moduleLoadList.includes(`NativeModule ${name}`) || require.resolve(name);

        return true;
    }
    catch {
        return false;
    }
}

function ensureConfigDeps(configKeys = []) {
    let requiredDeps = [];

    for (let key of configKeys) {
        if (key in configDeps)
            requiredDeps.push(...configDeps[key]);
    }

    let missingDeps = Array.from(new Set(requiredDeps)).filter(name => !hasPackage(name));

    if (missingDeps.length !== 0) {
        console.log('Install missing dependencies:');
        console.log(`npm i -D ${missingDeps.join(' ')}`);

        return false;
    }

    return true;
}

if (require.main === module)
    ensureConfigDeps(process.argv.slice(2));
else {
    module.exports = {
        configDeps,
        hasPackage,
        ensureConfigDeps,
    };
}
