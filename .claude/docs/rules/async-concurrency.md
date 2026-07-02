## Async and concurrency

Never `await` inside a `for` / `for...of` loop to run independent async calls
sequentially — it serializes work that could run in parallel. Use `Promise.all`
(or `Promise.allSettled` when partial failure is acceptable and you need to know
which items failed).

```ts
// ❌ sequential — N round trips, one after another
for (const id of ids) {
  await sendInvite(id);
}

// ✅ concurrent — all N round trips in parallel
await Promise.all(ids.map((id) => sendInvite(id)));

// ✅ when some calls may fail and you still need the rest to complete
const results = await Promise.allSettled(ids.map((id) => sendInvite(id)));
```

This applies anywhere independent async work is looped — server actions, route
handlers, data-fetching helpers, and client-side batch operations alike.
