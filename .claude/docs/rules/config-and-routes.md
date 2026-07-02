## Config, routes, and numbers

- Never hardcode a business threshold, limit, or magic number that governs app
  behavior. Add it to `src/config/app.ts` (`appConfig`) and import it.
- Never hardcode a route string. Use `paths` from `@/constants/paths`; add a path
  builder function there for dynamic routes.
- Format currency/numbers for display through `formatCurrency` / `formatNumber` in
  `src/utils/number-functions.ts` — not `toFixed` or an ad-hoc `Intl.NumberFormat`
  scattered across components.
- If a feature performs real monetary arithmetic, do the math in integers (smallest
  currency unit) and only format for display at the UI layer — never operate on
  floating-point currency values.

```ts
// ✅
import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

if (count < appConfig.someThreshold) router.push(paths.someRoute);

// ❌
if (count < 10) router.push('/some/route');
```
