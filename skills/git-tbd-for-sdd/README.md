# git-tbd-for-sdd

> **Type:** skill · **Category:** utility  
> **Location:** `.claude/skills/git-tbd-for-sdd/SKILL.md`  
> **Status:** stable

---

## What it does

Applies Trunk-Based Development (TBD) with a spec-first overlay for Specification-Driven Development (SDD). It guides branching, commits, pull requests, releases, hotfixes and epic branches so that `main` stays the only integration point and specs merge before the code that implements them.

**Produces:**
- Branch names and flows that follow the contractual prefixes (`feat/*`, `spec/*`, `docs/*`, `epic/*`, `release/*`).
- Commit messages and PR guidance following Conventional Commits and semantic versioning.
- Step-by-step release, hotfix and epic-branch procedures.

**Does not do:**
- Run git commands on its own initiative or push on your behalf without being asked.
- Cover non-trunk workflows such as GitFlow.
- Enforce rules automatically. It provides an optional pre-commit/CI snippet to reject `spec/*` branches that touch files outside `docs/specs/`.

---

## When to use

**Use it when:**
- Deciding how to name or structure a branch for code, specs or docs.
- Opening or reviewing a pull request.
- Cutting a release from trunk or from a `release/*` branch.
- Handling an urgent production hotfix.
- Batching features in a time-boxed `epic/*` branch.
- The user mentions: `"create a branch"`, `"trunk-based development"`, `"open a PR"`, `"cut a release"`, `"hotfix"`, `"epic branch"`.

**Do NOT use it when:**
- Working locally with no intent to push, or on throwaway experiments.

---

## Core rules

1. `main` is the only integration point.
2. Branches are short-lived (hours to 2–3 days, never more than a week).
3. `feat/*` carries code plus its spec, `spec/*` only touches `docs/specs/**`, `docs/*` covers the rest of `docs/**`, and `epic/*` lasts at most 6 weeks.
4. A new spec merges to `main` before its implementation branch starts.
5. Specs discovered mid-feature go to `docs/specs/_inbox/`.
6. Releases are cut from `main` or `release/*`, never from a feature branch.

---

## TBD traditional Branch model

Short-lived branches that merge straight back to `main`, which is always release-ready. Details: `references/features.md`.

```
main:      --*--------*--------*--------
              \      /        /
feature/1:     \----/        /
feature/2:      \-----------/
```

- Branch from an up-to-date `main`, using `feat/STORY-NNN-slug`.
- A branch lasts hours to 2–3 days, with one developer (or a pair) and atomic Conventional Commits.
- Sync with `main` before opening the PR, and merge only through a PR after CI passes (squash or rebase, never a local merge pushed to `main`).
- Delete the branch after merging. Never break the build.

---

## Spec-first model

Specs and code travel in separate branches, and a spec reaches `main` before its implementation starts. Details: `references/spec-branch.md`.

```
main:                --*--------*--------*--------
                        \      /          \      /
spec/story-01-draft:     \----/            \    /
feat/story-01:                              \--/
                         (1) spec merges    (2) code is cut from
                             to main first      main, after the spec
```

- `spec/*` touches only `docs/specs/**`. `feat/*` carries code plus the spec it implements.
- Cut `feat/*` from `main` after the spec is merged, so other stories' specs never appear in the feature diff.
- Specs discovered mid-feature go to `docs/specs/_inbox/` and are promoted later in a `spec/*` branch with its own PR.
- Optional enforcement: a pre-commit or CI check rejects `spec/*` branches that touch files outside `docs/specs/`.

---

## Epic model

A time-boxed integration branch for features that must land on `main` together (joint regression, coordinated release, cross-team work). Details: `references/epic-branch.md`.

```
main ──●──●──●──●──●──●──●──►
        ╲                ╱
         epic/EPIC-007 ─┘     (≤ 6 weeks)
          ╲    ╱  ╲    ╱
          feat  feat feat     (PRs go to the epic, not main)
```

- Name it `epic/EPIC-NNN-slug`, never `develop`. Lifetime is at most 6 weeks, with one open epic per team.
- Features branch from the epic and open their PRs against it.
- Sync the epic with `main` weekly using `merge`, never `rebase`.
- Specs still travel in `spec/*` to `main`; the epic consumes them on sync.
- Close with a single PR to `main` after a final sync and full regression, then delete the epic.
- Use it only for 3–15 features that must ship together. Otherwise prefer plain `feat/*` or feature flags.

---

## References

Detailed guides load on demand from `references/`:

| Topic | File |
|---|---|
| Spec branches (SDD + TBD) | `references/spec-branch.md` |
| Features | `references/features.md` |
| Conventional commits | `references/conventional-commit.md` |
| Pull requests | `references/pull-request.md` |
| Semantic versioning | `references/semantic-versioning.md` |
| Release from trunk | `references/release-from-trunk.md` |
| Release branches | `references/release-branches.md` |
| Hotfixes | `references/hotfixes.md` |
| Epic branches | `references/epic-branch.md` |

---

## Installation

```bash
npx skills add dariopalminio/agile-sddf-extension --skill git-tbd-for-sdd
```
