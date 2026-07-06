# Final Review Protocol — BitSmiths HRM

Triggered by `/final-review` on a PR. This is the pre-merge, product-manager-facing report
— not a line-by-line code review (the auto-review already did that). Substitute
`{PR_NUMBER}` with the real PR number throughout.

Produce **one** PR comment with the marker `<!-- final-review:sticky -->` as its first line
(edit the existing one if present). Use this structure:

```
<!-- final-review:sticky -->
## Final Review — PR #{PR_NUMBER}

**Merge recommendation:** MERGE | MERGE AFTER FIXES | DO NOT MERGE
**Open blockers from auto-review:** X (list finding IDs, or "none")

---

### What this PR ships
3–6 plain-language bullets a non-engineer can follow. Reference the Linear ticket
(scan the PR title/body for `[A-Z]+-\d+`; call the Linear MCP `get_issue` for intent and
acceptance criteria) and state explicitly whether each acceptance criterion is met.

### Acceptance criteria
For each criterion on the linked ticket: ✓ met / ✗ not met / ⚠️ partial — one line each.
If no ticket is linked, say so and infer intent from the PR description.

### Risk & blast radius
- Auth / RLS surface touched? (server actions, `authQuery`, middleware)
- Schema / migration changes? Are generated types (`src/types/supabase.ts`) regenerated?
- Server/client boundary or `src/env.ts` touched?
- Anything that could affect existing users or data.

### Migration & deploy order
If the PR includes `supabase/migrations/**`: state the order (migration first, then app),
and confirm `pnpm supa:types` was run. Otherwise: "No migrations — standard deploy."

### Pre-merge checklist
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] All `[BLOCKER]` findings from the auto-review resolved
- [ ] Acceptance criteria met
- [ ] No secrets in the diff

### Verdict
One paragraph: merge now, merge after the listed fixes, or hold — and why.
```

Rules:

- Do not re-post every inline finding; summarise the auto-review's open blockers by ID.
- Read the latest sticky auto-review (`<!-- pr-review:sticky -->`) to pull current findings.
- Be decisive. If blockers are open, the recommendation is MERGE AFTER FIXES or DO NOT MERGE.
- Make no code changes in this job — report only.
