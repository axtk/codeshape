const tsConfig = require('./ts');

const ts = {
    tests: require('../rules/ts-tests'),
};

const react = {
    general: require('../rules/react-general'),
    hooks: require('../rules/react-hooks'),
};

const mdRules = require('../rules/md');
const mdxRules = require('../rules/mdx');

module.exports = {
    ...tsConfig,
    overrides: [
        ...tsConfig.overrides,
        {
            files: ['**/*.jsx', '**/*.md/*.jsx'],
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            extends: [
                'plugin:react/recommended',
                'plugin:jsx-a11y/recommended',
            ],
            plugins: [
                'react',
                'react-hooks',
                'jsx-a11y',
            ],
            settings: {
                react: {
                    version: 'detect',
                },
            },
            rules: {
                ...react.general,
                ...react.hooks,
            },
        },
        {
            files: ['**/*.tsx', '**/*.md/*.tsx'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: ['./tsconfig.codeshape.json'],
            },
            extends: [
                'plugin:react/recommended',
                'plugin:jsx-a11y/recommended',
            ],
            plugins: [
                'react',
                'react-hooks',
                'jsx-a11y',
            ],
            settings: {
                react: {
                    version: 'detect',
                },
            },
            rules: {
                ...react.general,
                ...react.hooks,
            },
        },
        {
            files: [
                '**/?(_)_tests/**/*.tsx',
                '**/*.test?(s).tsx',
                '**/test?(s).tsx',
            ],
            env: {
                jest: true,
            },
            rules: ts.tests,
        },
        {
            files: ['**/*.md/*.[jt]sx'],
            rules: {
                ...mdRules,
                ...mdxRules,
            },
        },
    ],
};
