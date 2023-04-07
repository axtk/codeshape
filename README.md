# codeshape

Code-style rules for *eslint*, *typescript-eslint*, and *stylelint*

- Install: `npm i -D codeshape`
- Import rulesets from `codeshape/rules` or complete configs from `codeshape/configs`, or run `npx codeshape` for quick linting.

## Features

### consistent spacing for arrays and objects

as in the mathematical notation of vectors and set elements: *(x, y, z)*, *{x, y, z}*

```ts
[x, y, z]
{x, y, z}
{x: 0, y: 1, z: -1}

import {x} from './x';
```

### Stroustrup identation style

`else` and `catch` on the next line after `}` allow for comments covering the entire following block to be consistently located above the block

```ts
// this is a sample comment to the condition
if (condition) {
    // ...
}
// another comment
else if (otherCondition) {
    // ...
}
// yet another comment
else {
    // ...
}
```

### keywords are spaced, `function()` is not

as in the mathematical notation

`function(params)`, `setCustomValue(value)` as in *f(x)*, no space before the bracket

`if (x)`, `for (let i...)`, `while (ok)` as in regular logical statements, with a space before the conditional expression

### arrow function brackets only when necessary

`let f = x => x + 10;` (akin to mapping a scalar *x*, normally unbracketed)

`let g = (x, y) => x + y - 10;` (akin to mapping a vector *(x, y)*, normally bracketed)

### preferring `let` over `const`

It gives simple decision making: `let` is good for all variables, that's the default.

`const` is an option to emphasize and communicate to other developers that a certain value should not be reassigned, which applies to intentionally fixed values and normally doesn't apply to one-time local variables. It is also in line with the [definition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const): `const` is for values that *can't be* reassigned, rather than for values that *are not* reassigned.
