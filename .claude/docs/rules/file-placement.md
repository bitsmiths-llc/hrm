## File placement

Follow `docs/foundation/directory-structure.md` for the full layout (hooks, queries,
mutations, actions, constants). The rules below are the ones most often broken.

### Keep component and page files short

- A component or page file is for composition and rendering — not for holding data,
  types, or half the feature's logic. If a file is hard to scan in one screenful,
  that's a signal to split it.
- Soft limit ~150–180 lines per component/page file (JSX + local logic, not counting
  imports). Past that, split into subcomponents.
- Splitting a page: pull each visual section into its own component under
  `src/components/<feature>/<section>.tsx` (e.g. `src/components/home/hero-section.tsx`)
  and have the page file import and compose them in order. The page file itself should
  read as a short list of sections, not the sections' implementation.
- This is about file size, not premature abstraction — don't extract a subcomponent
  that's only rendered once _unless_ it's what's keeping the parent file short. Splitting
  a 300-line page into five 60-line section components is correct even though each
  section has exactly one caller.

### Never inline types, schemas, or content data in components or actions

- Zod schemas live in `src/schema/<entity>.ts` — never inside `src/actions/*` or a
  component file.
- Shared/domain types live in `src/types/<entity>.ts`, or alongside their Zod schema
  via `z.infer` in `src/schema/*` — never inside a component file.
- Static content/config data that a component or page renders (feature lists, nav
  items, FAQ entries, step-by-step copy, etc.) lives in `src/constants/<name>.ts`,
  typed against a shape in `src/types/<name>.ts` — not declared inline above the
  component, even if only one page currently uses it. If the data needs derived
  logic (not just a literal array), put that logic in `src/lib/*` and keep the raw
  data in `src/constants/*`.
- Exception: a component's own local `Props`/`ComponentNameProps` interface may stay
  in the component file. It isn't a domain type and nothing else imports it. Trivial,
  truly one-off literals (a single className string, a threshold used once) don't need
  their own file — this rule targets structured content/config data, not every literal.

### No premature abstraction

- Three similar lines beat an early abstraction. Extract a shared component or utility
  only once the same logic appears in **3 or more places** and the abstraction
  genuinely reduces maintenance burden.
- Don't wrap a shadcn primitive in a new component unless it adds real logic.
- Don't design for hypothetical future requirements — build what the current task
  needs.

### Reuse before you rebuild

- Search `src/components/`, `src/hooks/`, and `src/utils/` for an existing
  implementation before writing a new one (dates, numbers, strings, class merging via
  `cn`, etc. all have existing helpers — see
  `docs/foundation/conventions.md`).
