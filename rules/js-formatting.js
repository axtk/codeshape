module.exports = {
    'array-bracket-newline': ['error', 'consistent'],
    'array-bracket-spacing': 'error',
    'array-element-newline': ['error', 'consistent'],
    'arrow-parens': ['error', 'as-needed'],
    'arrow-spacing': 'error',
    'block-spacing': 'error',
    'brace-style': ['error', 'stroustrup', {allowSingleLine: true}],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'multiline-arguments'],
    'generator-star-spacing': ['error', 'after'],
    'indent': 'error',
    'jsx-quotes': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'lines-between-class-members': ['error', 'always', {exceptAfterSingleLine: true}],
    'max-len': ['error', {code: 100, ignoreUrls: true, ignoreRegExpLiterals: true}],
    'no-extra-parens': ['error', 'all', {
        nestedBinaryExpressions: false,
        ignoreJSX: 'multi-line',
    }],
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', {max: 1, maxBOF: 0, maxEOF: 1}],
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-newline': ['error', {consistent: true}],
    'object-curly-spacing': 'error',
    'operator-linebreak': 'error',
    'padded-blocks': ['error', 'never'],
    'padding-line-between-statements': [
        'error',
        {blankLine: 'always', prev: '*', next: 'return'},
        {blankLine: 'always', prev: ['const', 'let', 'var'], next: '*'},
        {blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
        {blankLine: 'always', prev: 'import', next: '*'},
        {blankLine: 'any', prev: 'import', next: 'import'},
        {blankLine: 'always', prev: 'block-like', next: '*'},
        {blankLine: 'always', prev: '*', next: 'block-like'},
        {blankLine: 'always', prev: 'directive', next: '*'},
        {blankLine: 'any', prev: 'directive', next: 'directive'},
    ],
    'quotes': ['error', 'single', {avoidEscape: false}],
    'rest-spread-spacing': 'error',
    'semi': 'error',
    'semi-spacing': 'error',
    'semi-style': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
    }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', {words: true, nonwords: false}],
    'switch-colon-spacing': 'error',
    'template-curly-spacing': 'error',
    'template-tag-spacing': 'error',
    'wrap-iife': ['error', 'inside'],
    'yield-star-spacing': ['error', 'after'],
};
