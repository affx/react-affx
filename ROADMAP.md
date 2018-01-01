## Roadmap

Here are some features coming soon

### Allow to extract value from the `React.SyntheticEvent`

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

Instead, a more conventional `mapDispatchToProps` is considered viable.
