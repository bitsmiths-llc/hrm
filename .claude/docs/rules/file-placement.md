## File placement

Follow `docs/foundation/directory-structure.md` for the full layout (hooks, queries,
mutations, actions, constants). The rules below are the ones most often broken.

### Never inline types or schemas in components or actions

- Zod schemas live in `src/schema/<entity>.ts` — never inside `src/actions/*` or a
  component file.
- Shared/domain types live in `src/types/<entity>.ts`, or alongside their Zod schema
  via `z.infer` in `src/schema/*` — never inside a component file.
- Exception: a component's own local `Props`/`ComponentNameProps` interface may stay
  in the component file. It isn't a domain type and nothing else imports it.

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
