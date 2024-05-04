# codeshape

*A linting utility with a built-in set of code-style rules for JS, TS, and CSS*

## Usage

- Install `codeshape` globally: `npm i -g codeshape`;
- Run `codeshape` in a project directory.

## Features

### Consistent spacing for arrays and objects

As in the mathematical notation of vectors and set elements: *(x, y, z)*, *{x, y, z}*.

```ts
[x, y, z]
{x, y, z}
{x: 0, y: 1, z: -1}

import {x} from './x';
```

### Stroustrup indentation style

`else` and `catch` on the next line after `}` allow for comments covering the entire following block to be consistently located above the block:

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

### Keywords are spaced, `function()` is not

As in the mathematical notation.

`function(params)`, `setCustomValue(value)` as in *f(x)*, no space before the bracket.

`if (x)`, `for (let i...)`, `while (ok)` as in regular logical statements, with a space before the conditional expression.

### Arrow function brackets only when necessary

`let f = x => x + 10;` — akin to mapping a scalar *x*, normally unbracketed.

`let g = (x, y) => x + y - 10;` — akin to mapping a vector *(x, y)*, normally bracketed.

### Preferring `let` over `const`

Motivation:

- Simple decision making, reduced cognitive load: `let` is good for all variables, `let` is the default;
- Adherence to the semantic meaning of constants: `const` is an option to emphasize and communicate to other developers that a certain value should not be reassigned, which applies to intentionally fixed values and normally doesn't semantically apply to one-time local variables;
- Compliance to the [definition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const): `const` is for values that *can't be* reassigned, rather than for values that *are not* reassigned.
