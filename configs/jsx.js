const jsConfig = require('./js');

const js = {
    tests: require('../rules/js-tests'),
};

const react = {
    general: require('../rules/react-general'),
    hooks: require('../rules/react-hooks'),
};

const mdRules = require('../rules/md');
const mdxRules = require('../rules/mdx');

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
            files: [
                '**/?(_)_tests/**/*.jsx',
                '**/*.test?(s).jsx',
                '**/test?(s).jsx',
            ],
            env: {
                jest: true,
            },
            rules: js.tests,
        },
        {
            files: ['**/*.md/*.jsx'],
            rules: {
                ...mdRules,
                ...mdxRules,
            },
        },
    ],
};
