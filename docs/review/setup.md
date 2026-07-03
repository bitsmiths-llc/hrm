# PR Review System — Setup Guide (BitSmiths HRM)

Three GitHub Actions workflows power the Claude-assisted review system for this repo.
This document covers the secrets to add, what each workflow does, and how to verify the
setup. Tracked in Linear as **BIT-2**.

---

## 1. Add secrets to GitHub

**GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret name              | Required by                                              | Value                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN` | all three workflows                                     | **Required.** Generate with `claude setup-token` in the Claude Code CLI (uses your Claude Pro/Max subscription). Paste the whole token. See note below.          |
| `LINEAR_API_KEY`         | `claude-code-review.yml` (review + final-review)         | Optional. Linear → Settings → Security & access → API → Personal API keys. Enables ticket-context lookups. Ticket lookups are silently skipped without it.        |
| `GITHUB_TOKEN`           | `claude-fix.yml`, `claude-code-review.yml`               | Automatic — provided by GitHub Actions, no manual setup.                                                                                                          |

**Generating `CLAUDE_CODE_OAUTH_TOKEN`:** run `claude setup-token` locally (requires a
Claude Pro or Max plan). This mirrors the FlyWithClass setup, which authenticates the
GitHub Action with a subscription OAuth token rather than a metered API key.

> Prefer a pay-as-you-go **Anthropic API key** instead? Add it as `ANTHROPIC_API_KEY` and,
> in each workflow, replace the line
> `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`
> with `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`. Use one or the other, not both.

---

## 2. Authorised `/final-review` users

The `final-review` job only runs when the commenter's GitHub username matches the allowlist
in the `if:` condition of that job in `claude-code-review.yml`:

```yaml
github.event.comment.user.login == 'RWPmadeZaeem' ||   # Zaeem
github.event.comment.user.login == 'TayyabSohail'       # Tayyab (repo owner)
# Add more HRM team GitHub usernames here, one per line, OR'd together.
```

Usernames are **case-sensitive**. Update this list as the team changes.

---

## 3. Workflow files and what they do

### `claude-code-review.yml` — three-job PR review system

| Job            | Trigger                                                   | Who can trigger                        | What it posts                                                                        |
| -------------- | --------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| `review`       | PR opened, or a draft marked ready-for-review, or `/claude-review` | GitHub Actions (auto) / any non-bot commenter | Heartbeat → inline `[BLOCKER]/[MAJOR]/[MINOR]/[NIT]` findings → sticky summary with the Domain Blockers checklist |
| `final-review` | PR comment starting with `/final-review`                  | Allowlisted users only (see §2)        | Pre-merge PM report: what ships, acceptance criteria, risk, deploy order, verdict     |
| `claude-agent` | PR comment starting with `/claude ` (not the commands above) | Any non-bot commenter                  | Read-only Q&A by default; commits only when you say "commit" / "push"                 |

The `review` job skips PRs that are draft or have "WIP" / "Draft" / "DO NOT MERGE" in the
title. Auto-review fires **once** per PR (on open or draft→ready); it does **not** re-run on
every push — comment `/claude-review` to request a fresh pass.

### `claude-fix.yml` — `/claude-fix` auto-fix command

Applies fixes from the latest review directly to the PR branch. Reads the sticky review
comment (`<!-- pr-review:sticky -->`), applies selected findings, runs `pnpm typecheck`,
commits, pushes, and posts a report.

**Argument grammar** after `/claude-fix`:

- _(no args)_ — fix only `[BLOCKER]` findings (safe default)
- `all` — fix every tier including `[MINOR]` / `[NIT]`
- `blocker` / `major` / `minor` / `nit` — fix only that tier
- `items:1,3,5` — fix only those finding IDs
- _(freeform text)_ — extra guidance for the agent

Restricted to commenters with OWNER, MEMBER, or COLLABORATOR association on the repo.

### `claude.yml` — `@claude` general assistant

Responds to `@claude` mentions in PR comments, PR review comments, and issues. Read-only by
default; never pushes to `main` without explicit instruction.

---

## 4. Context documents loaded on every review

Keep these current — the reviewer reads them before flagging anything.

| File                                         | Update when                                            |
| -------------------------------------------- | ------------------------------------------------------ |
| `docs/review/review-protocol.md`             | The review steps or severity rules change              |
| `docs/review/domain-blockers.md`             | A new hard rule that must block merge is introduced    |
| `.claude/skills/coding-standards/SKILL.md`   | The canonical implementation standard changes          |
| `.claude/docs/rules/*.md`                    | TypeScript / boundary / data-fetching conventions change |
| `docs/backend/auth-and-supabase.md`          | Auth, RLS, or service-role patterns change             |

---

## 5. Verification checklist (BIT-2 acceptance)

**review job**

- [ ] Open a test PR (non-draft, no "WIP" in title) → job starts within ~30s
- [ ] "🔍 Reviewing the diff…" heartbeat appears
- [ ] Inline comments appear with `[BLOCKER]` / `[MAJOR]` / `[MINOR]` / `[NIT]` prefixes
- [ ] Sticky summary appears with the 8-point Domain Blockers checklist
- [ ] Comment `/claude-review` → a fresh review runs
- [ ] Open a PR with "WIP" in the title → job posts the skip message and exits

**final-review job**

- [ ] Post `/final-review` as an allowlisted user → full pre-merge report + verdict
- [ ] Post `/final-review` as a non-allowlisted user → job does not run (silent)

**claude-agent job**

- [ ] `/claude what does authActionClient do?` → read-only answer, no file changes

**claude-fix.yml**

- [ ] After a review, post `/claude-fix` → applies `[BLOCKER]` findings, typechecks, pushes, reports

**claude.yml**

- [ ] `@claude which files handle Supabase auth?` → read-only answer citing file paths

---

## 6. Troubleshooting

**Job doesn't trigger on PR open** — Confirm `CLAUDE_CODE_OAUTH_TOKEN` is set, the PR is not
a draft, and the title has no WIP / Draft / DO NOT MERGE.

**`/final-review` does nothing** — The commenter's GitHub username must exactly match an
entry in the `final-review` job `if:` (case-sensitive). Check the Actions tab for a skipped run.

**`/claude-fix` posts "No prior PR review found"** — No `<!-- pr-review:sticky -->` comment
exists yet. Run `/claude-review` first, then retry.

**`/claude` or `/claude-fix` does nothing** — `/claude-fix` needs OWNER/MEMBER/COLLABORATOR
association. `claude-agent` allows any non-bot commenter.

**Auth error / 401 in the action logs** — The OAuth token expired or is malformed.
Regenerate with `claude setup-token` and update the secret.
