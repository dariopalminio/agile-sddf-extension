---
name: git-tbd-for-sdd
description: Apply Trunk-Based Development with SDD integration. Short-lived
  branches, trunk as the primary integration point, specs and code traveling
  separately, and time-boxed epic branches for batched feature integration.
  Use for any branching, PR, release, hotfix, or epic decision.
author: dariopalminio
version: 1.0.0
metadata:
  short-description: Expert guidance on Trunk-Based Development (TBD) branching and release management.
---

# Git TBD for SDD

Trunk-based development with a spec-first overlay for SDD (Specification-Driven Development). Branches are short-lived,
`main` is the only integration point, and specs merge before the code that
implements them.

**Use this skill when:** deciding how to branch, commit, open a PR, cut a
release, or handle a hotfix.

**Skip this skill when:** working locally with no intent to push, or on
throwaway experiments.

## Core rules

1. `main` is the only integration point. Every branch merges back to `main`.
2. Branches are short-lived — hours to 2–3 days. Never more than a week.
3. Branch prefixes are contractual:
   - `feat/*` → code + the spec it implements only
   - `spec/*` → `docs/specs/**` only
   - `docs/*` → `docs/**` except `docs/specs/`
   - `epic/*` → temporary integration branch, ≤ 6 weeks; features branch
     from it and PR back to it, not to `main`
4. A new spec merges to `main` **before** its implementation branch starts.
5. Specs discovered mid-feature go to `docs/specs/_inbox/`. Promotion to
   canonical is a deliberate act in a `spec/*` branch.
6. Releases are cut from `main` or from a short-lived `release/*` branch —
   never from a feature branch.

## Branch model

```
main ──●──●──●──●──●──●──●──►  (trunk, always deployable)
       ╲  ╲     ╱     ╱
        feat feat  release/*
        (hours–days)
```

## Two flows you will use daily

**Feature (code):**
```bash
git switch main && git pull
git switch -c feat/STORY-NNN-slug
# code + the STORY-NNN spec only
git commit -m "feat(scope): ..."
git push -u origin feat/STORY-NNN-slug   # PR → main
```

**Spec (before the feature):**
```bash
git switch main && git pull
git switch -c spec/STORY-NNN-draft
# write docs/specs/.../STORY-NNN/story.md
git commit -m "docs(spec): add STORY-NNN"
git push -u origin spec/STORY-NNN-draft  # PR → main
```

## References

Load only the file you need. Each is standalone.

| Topic | Load when… | File |
|---|---|---|
| Branch model | Onboarding, or redesigning the flow | `references/branch-model.md` |
| Spec Branch (SDD + TBD) | Separating spec authoring from implementation | `references/spec-branch.md` |
| Commit conventions | Writing a commit message | `references/commits.md` |
| PR discipline | Opening or reviewing a PR | `references/pr.md` |
| Release from trunk | Cutting a release without a branch | `references/release-from-trunk.md` |
| Release branches | Maintaining frozen versions with hotfixes | `references/release-branches.md` |
| Hotfix flow | Fixing production urgently | `references/hotfix.md` |
| Feature flags | Merging incomplete work safely | `references/feature-flags.md` |
| Rollback | Reverting a bad release | `references/rollback.md` |
| Epic branches | Batching features with joint regression before main | `references/epic-branch.md` |

## Enforcement (optional but recommended)

Reject any `spec/*` branch that touches files outside `docs/specs/`:

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == spec/* ]] && git diff --name-only main | grep -qv '^docs/specs/'; then
  echo "spec/* only touches docs/specs/"; exit 1
fi
```

Place it in `.husky/pre-commit` or a CI job. One-directional, cheap, effective.
