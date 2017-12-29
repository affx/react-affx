## Roadmap

Here are some features coming soon

### 1. Allow to extract value from the `React.SyntheticEvent`

It _may_ be like the following :

```typescript
<input
  onChange={dispatch.always(
    { type: "CHANGE_VALUE" },
    { extractValueAs: "value" },
  )}
/>
```

The value would be taken from the event.currentTarget object and composed with the given action, giving an action looking like :

```typescript
{ type: "CHANGE_VALUE", value: "..." }
```

Nonetheless, typing issues would occur with this solution.

### 2. Basically a mapStateToProps function

For the moment the _whole_ state is given back to the Affxed Component. Because of the nature of the re-rendering process, and the immutability of the State (which is a good thing in itself), it may result in potential performance issues especially if our state is fairly huge.

Also, the state may be sometimes pretty "obfuscated", that is, it may contain informations that have to be computed. It's relaty to the principle of "[normalization](https://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html)".

To avoid these, a third, optionnal, parameter will be allowed in the `withAffx` HOC. It will allow us to flatten and to pick up data in our state.

Some sort of "memoization" is considered too, following the [reselect](https://github.com/reactjs/reselect) pattern.

e.g. :

```typescript
const affx = withAffx(
  initialState,
  update,
  // Here is the "mapStateToProps"
  state => ({
    aValue: state.very.deep.value,
    anOtherValue: performAHeavyAndComplexComputation(state),
  }),
);
```

### 3. Composing Affxed Components

We'll may need a "main" Affxed Component, tracking the others, and allowing them to dispatch more "general" actions.

If for example we have an Affxed Component A wants to dispatch an action that is supposed to make an Affxed Component B to re-render, we'll need to pass by a Meta-Affxed Component M that will do the job in its update function.

This whole part is still in heavy studied.

Please take a look [here](https://www.elm-tutorial.org/en-v01/02-elm-arch/06-composing.html), [here](https://www.elm-tutorial.org/en-v01/02-elm-arch/07-composing-2.html), and [here](https://www.elm-tutorial.org/en-v01/02-elm-arch/08-composing-3.html) for more informations