const js = {
    general: require('../rules/js-general'),
    formatting: require('../rules/js-formatting'),
    imports: require('../rules/js-imports'),
    tests: require('../rules/js-tests'),
};

const mdRules = require('../rules/md');

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
        'markdown',
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
                '**/?(_)_tests/**/*.js',
                '**/*.test?(s).js',
                '**/test?(s).js',
            ],
            env: {
                jest: true,
            },
            rules: js.tests,
        },
        {
            files: ['**/*.md/*.js'],
            rules: mdRules,
        },
    ],
    root: true,
};
