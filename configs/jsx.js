const jsConfig = require('./js');

const react = {
    general: require('../rules/react-general'),
    hooks: require('../rules/react-hooks'),
};

const mdRules = require('../rules/md');

module.exports = {
    ...jsConfig,
    overrides: [
        ...jsConfig.overrides,
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
            files: ['**/*.md/*.jsx'],
            rules: mdRules,
        },
    ],
};
