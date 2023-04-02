module.exports = {
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/naming-convention': [
        'error',
        {
            selector: 'default',
            format: ['camelCase'],
        },
        {
            selector: 'parameter',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
        },
        {
            selector: 'property',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
        },
        {
            selector: 'property',
            format: null,
            filter: '^__html$',
        },
        {
            selector: 'variable',
            modifiers: ['const'],
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
            selector: 'typeLike',
            format: ['PascalCase'],
            custom: {
                regex: '^[ITC][A-Z][a-z]+',
                match: false,
            },
        },
        {
            selector: [
                'classProperty',
                'objectLiteralProperty',
                'typeProperty',
                'classMethod',
                'objectLiteralMethod',
                'typeMethod',
                'accessor',
                'enumMember',
            ],
            format: null,
            modifiers: ['requiresQuotes'],
        },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
        'error',
        {allowComparingNullableBooleansToFalse: false},
    ],
    // reports `x ?? ''` as an error
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/unified-signatures': 'error',
};
