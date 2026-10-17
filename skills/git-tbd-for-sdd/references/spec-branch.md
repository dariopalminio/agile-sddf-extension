# Spec Branch (SDD + TBD)

**Purpose:** Separate spec authoring from code implementation so a feature
branch never mixes the specification of one story with the implementation of
another. Complements the TBD flow in `SKILL.md` without changing the trunk
model.

main
 ├── spec/STORY-043-draft   → PR → main   (spec only)
 ├── spec/STORY-044-draft   → PR → main   (spec only)
 └── feat/STORY-042-foo      → PR → main   (code + the spec it implements)

## Why it exists

In Spec-Driven Development the branch that implements a story often starts
before the specs of future stories are written. When both activities share
one branch, the PR diff mixes code, in-progress specs, and drafts that are
not part of the story. Reviewers cannot tell what belongs to what, and the
history becomes ambiguous.

Spec Branch removes the contamination by construction: specs travel in
`spec/*` branches, code travels in `feat/*` branches, and neither carries
the other's work.

## When to use it

| Situation | Spec Branch applies |
|---|---|
| Specs written before implementation | ✅ Yes — merge specs first, then branch `feat/*` |
| Specs discovered during implementation | ✅ Yes — use `docs/specs/_inbox/` inside `feat/*`, promote later |
| Specs exclusively written after code | ⚠️ Not the primary flow — still keeps diffs clean |
| Non-SDD feature work | ❌ No — plain `feat/*` is enough |

## Branch naming and path discipline

| Prefix | Touches | Never touches |
|---|---|---|
| `feat/*` | Code, derived artifacts, documentation | Canonical specs (`docs/specs/` beyond the one being implemented) |
| `spec/*` | Only `docs/specs/**` | Code, derived artifacts |
| `docs/*` | `docs/**` except `docs/specs/` | Code, specs |

**Draft buffer.** While inside a `feat/*` branch, new specs discovered during
implementation go to `docs/specs/_inbox/`. The inbox is explicitly
non-canonical: it may be rewritten freely and is not consumed by the pipeline
until promoted. Promotion from `_inbox/` to the canonical tree (`03-stories/`,
etc.) happens in a `spec/*` branch with its own PR.

## Enforcement (CI or pre-commit)

Reject any `spec/*` branch that touches files outside `docs/specs/`:

```bash
# .husky/pre-commit  or  CI job
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == spec/* ]] && git diff --name-only main | grep -qv '^docs/specs/'; then
  echo "Branch spec/* only touches docs/specs/"
  exit 1
fi
```

The rule is one-directional and cheap: if the branch is not `spec/*`, or every
changed path lives under `docs/specs/`, the hook does nothing.

## Spec-first PRs

**Rule:** a new spec is merged to `main` before it is implemented. The
`feat/*` branch is cut from `main` after the spec is already there, and
touches only code plus the spec it implements.

```
1. spec/STORY-043-draft       → PR → main
2. spec/STORY-044-draft       → PR → main
3. feat/STORY-042-foo (from main) → PR → main   # STORY-042 spec already in main
```

When step 3 runs, the specs for 043 and 044 are on `main`. They never appear
in the feature diff.

## Cheatsheet: Spec Branch flow

```bash
##############################################
# STEP 1: AUTHOR THE SPEC (in its own branch)
##############################################
git checkout main
git pull origin main
git checkout -b spec/STORY-043-draft

# Write docs/specs/.../STORY-043/story.md
git add docs/specs
git commit -m "docs(spec): add STORY-043 draft"
git push -u origin spec/STORY-043-draft
# Open PR → merge to main

##############################################
# STEP 2: IMPLEMENT (from up-to-date main)
##############################################
git checkout main
git pull origin main
git checkout -b feat/STORY-042-foo

# Code + the STORY-042 spec only.
# New specs discovered here go to docs/specs/_inbox/.
git add <code>
git commit -m "feat(...): ..."
git push -u origin feat/STORY-042-foo
# Open PR → merge to main

##############################################
# STEP 3 (optional): PROMOTE FROM INBOX
##############################################
git checkout main
git pull origin main
git checkout -b spec/promote-043-044
# Move docs/specs/_inbox/STORY-043.md → docs/specs/03-stories/...
git commit -m "docs(spec): promote STORY-043, STORY-044 from inbox"
# Open PR → merge to main
```

## Relationship to TBD

Spec Branch does not replace the TBD model; it specializes it. The trunk
(`main`) remains the only integration point, `feat/*` branches stay
short-lived, and releases follow `release-from-trunk.md` or
`release-branches.md` unchanged. Spec Branch only adds a branch class
(`spec/*`) and a rule that specs and code travel separately.

## Common pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Writing canonical specs inside `feat/*` | Feature PR contains unrelated `story.md` files | Move drafts to `docs/specs/_inbox/`; promote later in `spec/*` |
| Merging a spec PR that also touches code | `spec/*` diff includes code files | CI rejects it; split the PR |
| Cutting `feat/*` from a stale `main` | PR has spurious diffs and conflicts | `git pull origin main` before branching |
| Promoting directly to canonical from `_inbox/` in `feat/*` | Branch violates path discipline | Promote only in a `spec/*` branch |

