module.exports = {
    'array-callback-return': 'error',
    'no-constant-binary-expression': 'error',
    'no-duplicate-imports': 'error',
    'no-promise-executor-return': 'error',
    'no-self-compare': 'error',

    'camelcase': 'error',
    'consistent-this': ['error', 'self'],
    'curly': 'off',
    'dot-notation': 'error',
    'eqeqeq': 'error',
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
    'max-classes-per-file': 'error',
    'max-lines': ['error', {max: 350}],
    'max-params': 'error',
    'no-alert': 'error',
    'no-console': 'error',
    'no-else-return': ['error', {allowElseIf: false}],
    'no-empty': ['error', {allowEmptyCatch: true}],
    'no-empty-function': 'off',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-implicit-coercion': ['error', {disallowTemplateShorthand: true}],
    'no-implied-eval': 'error',
    'no-lonely-if': 'error',
    'no-mixed-operators': 'error',
    'no-negated-condition': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-return-await': 'error',
    'no-script-url': 'error',
    'no-unneeded-ternary': ['error', {defaultAssignment: false}],
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-escape': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'operator-assignment': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'off',
    'prefer-destructuring': ['error', {
        VariableDeclarator: {
            array: false,
            object: true,
        },
        AssignmentExpression: {
            array: false,
            object: false,
        },
    }],
    'prefer-let/prefer-let': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-object-has-own': 'error',
    'prefer-object-spread': 'error',
    'prefer-regex-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'quote-props': ['error', 'consistent-as-needed'],
    'require-await': 'error',
    'sort-imports': ['error', {ignoreDeclarationSort: true}],
    'spaced-comment': ['error', 'always', {block: {balanced: true}, exceptions: ['-']}],
    'yoda': 'error',
};
