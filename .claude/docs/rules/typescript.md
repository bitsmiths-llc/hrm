## TypeScript strictness

- Strict mode stays on. Never weaken `tsconfig.json`.
- Never use `any`. At an external boundary where the shape is genuinely unknown, use
  `unknown` and narrow it with a type guard before use.
- If `any` is truly unavoidable, add a `// reason: ...` comment explaining why — don't
  use it silently.
- Never use `@ts-ignore` / `@ts-expect-error` without a `// reason: ...` comment next
  to it.
- Never use `as T` to force a narrowing cast — use a type guard or a discriminated
  union instead. (`as const` and `satisfies` are fine; neither one lies about the shape.)
- Prefer `satisfies` over `as` when you need to check a value against a type without
  widening it.
- All data entering the app from user input or an external API must be parsed through
  a Zod schema before use. Trust the resulting typed value downstream — don't
  re-validate the same data twice in one request path.

```ts
// ❌ lies to the compiler
const status = raw as OrderStatus;

// ✅ narrows safely
function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}
if (!isOrderStatus(raw)) throw new Error('Invalid status');
const status = raw; // now typed as OrderStatus
```
