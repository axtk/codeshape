const tsConfig = require('./ts');

const react = {
    general: require('../rules/react-general'),
    hooks: require('../rules/react-hooks'),
};

module.exports = {
    ...tsConfig,
    overrides: [
        ...tsConfig.overrides,
        {
            files: ['*.tsx'],
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
    ],
};
