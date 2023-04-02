module.exports = {
    'no-duplicate-imports': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    // named exports are better with tree-shaking, IDE suggestions, bulk replacing
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',
    'import/no-self-import': 'error',
    'import/no-unresolved': 'error',
    'import/no-useless-path-segments': ['error', {noUselessIndex: true}],
    'simple-import-sort/imports': ['error', {
        groups: [[
            // external
            '^express(/|$)',
            '^react(/|$)',
            '^react-dom(/|$)',
            '^react-',
            '^@?\\w',
            // internal
            '^~/lib(/|$)',
            '^~(/|$)',
            // parent, '..' last
            '^\\.\\.(?!/?$)',
            '^\\.\\./?$',
            // relative, '.' last
            '^\\./(?=.*/)(?!/?$)',
            '^\\.(?!/?$)',
            '^\\./?$',
            // side effects
            '^\\u0000',
            // styles
            '^.+\\.?(s?css)$',
        ]],
    }],
};
