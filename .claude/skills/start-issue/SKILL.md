---
name: start-issue
description: Start work on a GitHub issue from the Hair Diary roadmap. Reads the issue, creates a branch, moves the card to In Progress on the project board, and ends with a PR that closes the issue. Use when the user says "work on issue #N", "start #N", or "pick up the next ticket".
---

# Start an issue

Repo: `hecbatista/hairdiary`. Project board: user project **1** (`--owner hecbatista`), "Hair Diary Roadmap", with fields Status (Todo / In Progress / Done), Sprint (2-week iterations) and Size (S/M/L).

## 1. Read the issue

```bash
gh issue view <N> -R hecbatista/hairdiary
```

Treat the acceptance-criteria checklist as the definition of done. If the issue says "Depends on:" another issue that is still open, tell the user before starting.

If the user asks for "the next ticket", list the open issues in the current sprint and suggest the smallest one that unblocks the others:

```bash
gh project item-list 1 --owner hecbatista --format json --limit 100
```

## 2. Create a branch

Start from an up-to-date `main`:

```bash
git checkout main && git pull --ff-only
git checkout -b <type>/<N>-short-name   # type: feat, chore, fix, docs
```

## 3. Move the card to In Progress

```bash
PID=$(gh project view 1 --owner hecbatista --format json --jq .id)
ITEM=$(gh project item-list 1 --owner hecbatista --format json --limit 100 --jq '.items[] | select(.content.number==<N>) | .id')
STATUS=$(gh project field-list 1 --owner hecbatista --format json --jq '.fields[] | select(.name=="Status")')
FID=$(echo "$STATUS" | jq -r .id)
OID=$(echo "$STATUS" | jq -r '.options[] | select(.name=="In Progress") | .id')
gh project item-edit --id "$ITEM" --project-id "$PID" --field-id "$FID" --single-select-option-id "$OID"
```

## 4. Implement

- Follow the conventions in `CLAUDE.md`, plus the `add-screen`, `add-data-function` and `add-form-field` skills where they apply.
- Run `npx tsc --noEmit` before committing, and lint or tests too once they exist. Report any pre-existing failures instead of hiding them.
- If the change adds commands, tooling or conventions, update `CLAUDE.md` (and the README setup section if it affects setup).

## 5. Open the PR

Ask the user before committing and pushing. Then:

```bash
gh pr create -R hecbatista/hairdiary --base main --title "<summary>" --body "..."
```

The body summarizes the change, lists how it was verified, and includes `Closes #<N>` so merging closes the issue. GitHub's project automation moves closed issues to Done. If it doesn't, set Status to Done with the same `item-edit` command as in step 3.
