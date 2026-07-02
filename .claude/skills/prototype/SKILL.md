---
name: prototype
description: Move an idea up the fidelity ladder (content-first → wireframe → low-fi → high-fi → code) with a validation plan at each level, plus user-journey mapping and usability-testing scripts. Use when the user wants to prototype, wireframe, map a user flow, or plan/run usability testing.
---

# Skill: Prototype & Research

Guide work through the right fidelity level with validation.

## Steps
1. Read [`workflows/prototyping.md`](workflows/prototyping.md) (5-level fidelity ladder, journey mapping template, usability-testing script, sample data).
2. Identify the current need and pick the **lowest** fidelity that answers it — never skip levels:
   - Content-first (info needs) → Wireframe (layout/nav) → Low-fi (task completion) → High-fi (visual/a11y) → Code (feasibility/perf).
3. For flows: produce a user-journey map with decision points, error paths, and edge cases.
4. For validation: define the usability test (tasks, success criteria, 5-user rule) using the script.
5. High-fi/code steps pull tokens ([`tokens/`](tokens/)), components ([`components/`](components/)), taste ([`taste/`](taste/)), and a11y ([`accessibility/`](accessibility/)) — for taste/judgment calls and a11y checklists. **For actual code in this repo, `tokens/*.json` here are reference-only; the real, binding tokens are the Tailwind semantic classes in `.claude/docs/ui/ui-and-styling.md` (`bg-background`, `text-foreground`, etc., backed by `src/app/globals.css` + `tailwind.config.ts`). Don't introduce a color/spacing value from `tokens/*.json` that doesn't already exist as one of this repo's semantic tokens.**

## Output
The artifact at the chosen fidelity + an explicit "what we validate next" plan.

## Verification (before declaring done)
- The fidelity matches the question being answered — no level skipped.
- Flows include decision points, **error paths, and edge cases** (empty/loading/overflow), not just the happy path.
- A concrete validation step is named (tasks + success criteria), not "test later".
- High-fi/code artifacts pass the same token + a11y bar as `design-code` (no hardcoded values, contrast, states).

## Repo-specific enforcement (this repository)
Any time this skill's "Code" fidelity level produces real frontend code in this repo,
it must also satisfy `.claude/skills/coding-standards/SKILL.md` — the canonical
implementation standard for this Next.js/Supabase boilerplate. In short: no
`any`/unexplained casts, `DataTable` for tables, React Hook Form + Zod + shadcn `Form`
for forms, `Promise.all` instead of `await` in a `for` loop, types/schemas in
`src/types|schema/*` (not inlined in components/actions), query keys from
`src/constants/query-keys.ts`, `Skeleton`/`isLoading` for loading states, explicit
empty states, `toast.error`/`FormMessage` for errors, and semantic Tailwind tokens
only. Read that skill before writing code, not after.
