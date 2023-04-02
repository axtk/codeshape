const js = {
    general: require('../rules/js-general'),
    formatting: require('../rules/js-formatting'),
    imports: require('../rules/js-imports'),
};

module.exports = {
    env: {
        es2022: true,
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:markdown/recommended',
    ],
    plugins: [
        'import',
        'simple-import-sort',
        'prefer-let',
    ],
    parserOptions: {
        sourceType: 'module',
    },
    rules: {
        ...js.general,
        ...js.formatting,
        ...js.imports,
    },
    overrides: [
        {
            files: [
                '**/_tests/**/*.[jt]s?(x)',
                '**/?(*.)test.[jt]s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
    root: true,
};
