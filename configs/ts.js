const jsConfig = require('./js');

const ts = {
    specific: require('../rules/ts-specific'),
    general: require('../rules/ts-general'),
    formatting: require('../rules/ts-formatting'),
    imports: require('../rules/ts-imports'),
    tests: require('../rules/ts-tests'),
    cli: require('../rules/ts-cli'),
};

module.exports = {
    ...jsConfig,
    overrides: [
        ...jsConfig.overrides,
        {
            files: ['**/*.ts?(x)'],
            extends: [
                ...jsConfig.extends,
                'plugin:@typescript-eslint/recommended',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['./tsconfig.codeshape.json'],
            },
            plugins: ['@typescript-eslint'],
            settings: {
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx'],
                },
                'import/resolver': {
                    typescript: true,
                    node: true,
                },
            },
            rules: {
                ...jsConfig.rules,
                ...ts.specific,
                ...ts.general,
                ...ts.formatting,
                ...ts.imports,
            },
        },
        {
            files: [
                '**/?(_)_tests/**/*.ts',
                '**/*.test?(s).ts',
                '**/test?(s).ts',
            ],
            env: {
                jest: true,
            },
            rules: ts.tests,
        },
        {
            files: [
                '**/cli/**/*.ts',
            ],
            rules: ts.cli,
        },
    ],
};
