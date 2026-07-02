---
name: coding-standards
description: Canonical implementation standards for this Next.js Supabase boilerplate. Use for any frontend or full-stack coding task in this repository — components, forms, tables, data fetching, server actions, styling, or file placement. Resolves conflicts between local docs and generic/external skills.
---

# Coding Standards

Apply these standards to every coding task in this repository, especially frontend
work. Detailed, generic rules live one-per-topic under `.claude/docs/` — read the
relevant file(s) before writing code, not after.

## Priority order when guidance conflicts

1. Explicit user instruction in the current chat
2. `CLAUDE.md` (repo root)
3. This skill and `.claude/docs/*`
4. Local docs in `docs/*` — start at `docs/index.md`
5. Generic external skills (`.agents/skills/*`, marketplace skills)

## Stack baseline (already installed — don't introduce alternatives)

- Next.js App Router, TypeScript strict mode, React 19
- `@tanstack/react-query` v5 for data fetching
- `@tanstack/react-table` v8 via `src/components/ui/data-table/*` for all tabular data
- **shadcn/ui + Radix + Tailwind CSS for every UI surface**
- React Hook Form + Zod (`@hookform/resolvers`) for every form
- Supabase for auth/db, `next-safe-action` for server actions
- `sonner` for toasts, `lucide-react` / `react-icons` for icons
- pnpm as package manager

## Rules, by topic

Read the file for whatever you're touching. Split into two folders: `rules/` for
general engineering rules, `ui/` for frontend/component rules.

### `.claude/docs/rules/`

- [`typescript.md`](../../docs/rules/typescript.md) — strict mode, no `any`, no
  unexplained `as`/`@ts-ignore`, Zod at every boundary
- [`file-placement.md`](../../docs/rules/file-placement.md) — schemas/types/content
  data never inlined in components or actions, keep component/page files short, no
  premature abstraction
- [`react-query.md`](../../docs/rules/react-query.md) — query key centralization,
  invalidation, `useAction` vs `useMutation`
- [`async-concurrency.md`](../../docs/rules/async-concurrency.md) — `Promise.all`,
  never `await` inside a `for` loop
- [`server-client-components.md`](../../docs/rules/server-client-components.md) —
  default to Server Components
- [`config-and-routes.md`](../../docs/rules/config-and-routes.md) — no hardcoded
  routes/thresholds/currency formatting

### `.claude/docs/ui/`

- [`ui-and-styling.md`](../../docs/ui/ui-and-styling.md) — shadcn + Tailwind are
  mandatory, semantic tokens, spacing, typography, a11y
- [`data-tables.md`](../../docs/ui/data-tables.md) — always `DataTable`, never a
  hand-rolled `<table>`
- [`forms.md`](../../docs/ui/forms.md) — React Hook Form + Zod + shadcn `Form`, always
- [`states.md`](../../docs/ui/states.md) — loading/empty/error states

## Verification before calling frontend work done

- [ ] No `any`; no unexplained `@ts-ignore`/`@ts-expect-error`/`as` cast
- [ ] Types/schemas live in `src/types|schema/*`, not inlined in a component or action
      file (a component's own `Props` type is the one exception)
- [ ] Static content/config data (feature lists, step copy, nav items, etc.) lives in
      `src/constants/*`, not declared inline in a page or component
- [ ] Component/page files are short (~150–180 lines of JSX/logic) — large pages are
      split into section components under `src/components/<feature>/*`
- [ ] Tables use `DataTable`; forms use React Hook Form + Zod + shadcn `Form`
- [ ] Every UI surface uses shadcn primitives and Tailwind CSS — no ad-hoc HTML/CSS
- [ ] Query keys come from `src/constants/query-keys.ts`; affected keys are invalidated
      after writes
- [ ] Loading → `Skeleton`/`isLoading`; empty → explicit empty state; error →
      `toast.error`/`FormMessage`
- [ ] Independent async calls run via `Promise.all`, never a `for` loop with `await`
      inside
- [ ] Only semantic Tailwind tokens, spacing on the 4px grid
- [ ] `pnpm typecheck` and `pnpm lint` pass

## Non-goals

- Don't replace the local `Button`/`Form` API with generic shadcn examples that skip
  `isLoading`/`icon`/`iconLeft`.
- Don't force React Query v3/v4 style patterns.
- Don't invent UI components that don't exist in this repo — e.g. don't assume a
  membership/feature-gate component exists unless you actually find one under
  `src/components/*`.
