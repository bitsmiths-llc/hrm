# PR Review Protocol — BitSmiths HRM

Follow these steps in order. Do not skip any step.

---

## Step 1 — Heartbeat

Post a single PR comment: "🔍 Reviewing the diff…"

---

## Step 2 — Abort gate

If the PR title contains "WIP", "wip", "Draft", or "DO NOT MERGE":
post "⏭️ Skipping review: PR marked as work-in-progress." and stop immediately.

---

## Step 2.5 — Linear ticket context

Scan the PR title and body for a ticket ID matching `[A-Z]+-\d+` (e.g. `BIT-2`). If found,
call the Linear MCP `linear_search_issues` tool, searching for that identifier (e.g. query
`BIT-2`), to fetch the ticket's title, description, and acceptance criteria. Hold this for
Step 4 — flag if the implementation diverges from the ticket intent or leaves acceptance
criteria unaddressed. Skip silently if no ticket ID is found or the Linear tool is
unavailable (it is disabled when no `LINEAR_API_KEY` secret is set).

---

## Step 3 — Load context files

Always load before reviewing (these are the canonical standard for this repo):

- `CLAUDE.md`
- `.claude/skills/coding-standards/SKILL.md`
- `docs/review/domain-blockers.md`
- `.claude/docs/rules/typescript.md`
- `.claude/docs/rules/server-client-components.md`
- `.claude/docs/rules/react-query.md`
- `.claude/docs/rules/async-concurrency.md`
- `.claude/docs/rules/file-placement.md`
- `.claude/docs/rules/config-and-routes.md`

Also load the extra context below for any path the diff touches:

| Diff touches…                                  | Extra context                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/actions/**`                               | `docs/data/mutations-and-actions.md` — auth first via `authActionClient`, next-safe-action shape  |
| `src/hooks/queries/**`, `src/hooks/mutations/**` | `docs/data/react-query.md` — `authQuery()`, central `QueryKeys`, invalidation on mutation        |
| `src/lib/supabase/server.ts`                   | Server-only Supabase client — must never be imported by a `'use client'` module                   |
| `src/lib/supabase/client.ts`                   | Browser client only — never carries the service-role key                                          |
| `src/lib/server/safe-action.ts`                | `authActionClient` vs `safeActionClient` — auth gate lives here                                    |
| `src/middleware.ts`, `src/lib/supabase/middleware.ts` | Session refresh + route protection; high blast radius — see `docs/backend/auth-and-supabase.md` |
| `src/env.ts`                                    | t3-env — the ONLY place `process.env` may be read. Direct `process.env.X` elsewhere is a blocker  |
| `src/types/supabase.ts`                         | Generated — OFF-LIMITS; regenerate with `pnpm supa:types`, never hand-edit                         |
| `src/components/ui/**`                          | shadcn primitives — add via `pnpm ui add <component>`, never hand-edit                             |
| `supabase/migrations/**`                        | Must be paired with a regenerated `src/types/supabase.ts` (`pnpm supa:types`)                      |
| `src/app/**` (forms / tables)                   | `.claude/docs/ui/forms.md`, `.claude/docs/ui/data-tables.md`, `.claude/docs/ui/states.md`         |

---

## Step 4 — Full review

Walk the diff. Flag only substantive violations. For each finding, post one **inline**
PR comment anchored to the exact `file` and `line` with:

- Severity prefix: `[BLOCKER]` / `[MAJOR]` / `[MINOR]` / `[NIT]`
- The specific rule broken, citing the source file (e.g. `.claude/docs/rules/typescript.md`)
- A concrete, one-step fix

**How to post — required:** Use the `mcp__github_inline_comment__create_inline_comment`
tool to attach each finding to its exact line in the diff. Every finding MUST be an inline
comment — do not bury findings in the summary. Reserve the top-level summary (Step 5) for
the verdict, change summary, and Domain Blockers checklist only. If a finding's line falls
outside the diff hunks, note it in the summary instead.

**Finding IDs:** number findings sequentially from 1. Begin every inline comment with
`<!-- finding-id:N -->` as the very first line.

**Severity definitions:**

- `[BLOCKER]` Must be fixed before merge — see the hard-blocker list in `docs/review/domain-blockers.md`
- `[MAJOR]` Correctness, security, or business-logic issue
- `[MINOR]` Conventions violation (naming, file placement, imports)
- `[NIT]` Style preference, optional

**Supplemental checklist** (apply only when the diff touches the relevant area):

_Type safety_ — see `.claude/docs/rules/typescript.md`

- No new `any`, `as any`, or `@ts-ignore` without a `// reason:` comment
- `unknown` over `any` at external boundaries
- Zod validation at every external boundary (form input, server-action input, API responses)
- Env vars only via `src/env.ts` — never `process.env.X` directly

_Server vs client boundary_ — see `.claude/docs/rules/server-client-components.md`

- `src/lib/supabase/server.ts`, `src/lib/server/**` (incl. `safe-action.ts`), and any
  service-role client never appear in a `'use client'` file or any module imported by one
- Default to server components; `"use client"` only for stateful UI, effects, or browser APIs

_Authentication & authorization_ — see `docs/backend/auth-and-supabase.md`

- Every new authenticated server action goes through `authActionClient`; public ones use `safeActionClient`
- Every new authenticated query goes through `authQuery()`
- RLS stays enabled; the service-role key is used server-side only and never reaches the client
- Role checks are enforced server-side, not by client-side conditional rendering alone

_Data fetching_ — see `.claude/docs/rules/react-query.md`

- Query keys come from the central `QueryKeys` factory (`src/constants/query-keys.ts`), not inline arrays
- Mutations invalidate the correct query keys
- No `useEffect` for data React Query / RSC can handle

_Error handling & UX_ — see `docs/foundation/conventions.md`

- next-safe-action `useAction` uses `onError` from `src/lib/show-error-toast.ts`
- React Query `useMutation` shows `toast.error(error.message)` in `onError`
- No leftover `Logger.*` / `console.*` debug logs

_Performance_ — see `.claude/docs/rules/async-concurrency.md`

- No N+1 DB calls inside `.map()`
- No `await` inside `for` / `forEach` loops — use `Promise.all`

Label `[MAJOR]` if current-traffic risk, `[MINOR]` if future risk.

If a violation is in surrounding legacy code the PR isn't claiming to fix, label it
`[MAJOR — legacy, not introduced by this PR]` and do not block on it.

Skip entirely: `src/types/supabase.ts`, `pnpm-lock.yaml`, formatting nits not in the rules.

---

## Step 5 — Summary comment

Post one summary comment (edit if one already exists with marker `<!-- pr-review:sticky -->`)
using this exact structure:

```
<!-- pr-review:sticky -->
## PR Review — BitSmiths HRM

**Verdict:** APPROVE | APPROVE WITH NITS | REQUEST CHANGES | BLOCK
**Findings:** X BLOCKER · X MAJOR · X MINOR · X NIT

---

### Change summary
3–5 bullets describing what the PR does. Assume the reader hasn't read the code.

---

### Domain Blockers

Mark each ✓ (pass), ✗ BLOCKER (fail), or ✓ N/A (path not touched).

- [ ] 1. New authenticated server action uses `authActionClient`; query uses `authQuery()` — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 2. Service-role key stays server-only; never in a `'use client'` module — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 3. No server-only module imported into a client component — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 4. `process.env` read only in `src/env.ts` (t3-env) — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 5. `src/types/supabase.ts` not hand-edited (regenerated via `pnpm supa:types`) — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 6. Migration paired with regenerated types — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 7. `src/components/ui/*` added via `pnpm ui add`, not hand-edited — ✓ / ✗ BLOCKER / ✓ N/A
- [ ] 8. No secrets / `.env` values committed — ✓ / ✗ BLOCKER / ✓ N/A

---

### Code quality notes
- 1–3 things the PR does well
- Out-of-scope observations worth a follow-up ticket (file paths only, no fix suggestions)

<details>
<summary>Review metadata</summary>

<!-- pr-review-data
{
  "verdict": "APPROVE|APPROVE_WITH_NITS|REQUEST_CHANGES|BLOCK",
  "blockers": 0,
  "majors": 0,
  "minors": 0,
  "nits": 0,
  "findings": [
    {
      "id": 1,
      "tier": "BLOCKER|MAJOR|MINOR|NIT",
      "file": "src/path/to/file.ts",
      "lines": "42-55",
      "summary": "one-line description of the issue"
    }
  ]
}
-->

</details>
```

If the PR is clean, post "✅ No substantive issues found." and one praise line.
Always post the heartbeat (Step 1) and this summary, even if there are no findings.
