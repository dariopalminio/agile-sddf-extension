# Epic Branch (TBD + SDD)

**Purpose:** Batch multiple features into a single integration branch when they
must merge to `main` together — for joint regression, coordinated release, or
cross-team work. An epic branch is a **time-boxed integration branch**, not a
permanent `develop`.

main ──●──●──●──●──●──●──●──●──●──●──►   (trunk, always deployable)
        ╲                      ╱
         epic/EPIC-007 ───●───┘          (time-boxed, ≤ 6 weeks)
          ╲    ╱  ╲    ╱
          feat  feat feat                 (PRs go to epic, not main)

## Why it exists

Some work cannot be released feature-by-feature: a new subsystem, a migration,
a coordinated multi-team change. Merging those features to `main` one at a time
either breaks the trunk or forces behind-the-scenes flags. An epic branch gives
those features a private integration point, a single regression pass, and one
merge to `main` at the end.

It is a controlled reintroduction of Git Flow's `develop`, with a hard time
limit. Without the time limit and the rules below, it erodes TBD.

## When to use it

| Situation | Epic branch applies |
|---|---|
| 3–15 features must land together | ✅ Yes |
| Joint regression before touching `main` | ✅ Yes |
| Multiple teams coordinating a subsystem | ✅ Yes |
| Features are independent and can merge individually | ❌ No — use plain `feat/*` |
| Work exceeds ~6 weeks | ❌ No — split into two epics or a `release/*` |
| `main` must stay release-ready for daily deploys | ⚠️ Only if sync is weekly |

## Branch naming and rules

| Rule | Value |
|---|---|
| Name | `epic/EPIC-NNN-slug` |
| Base | `main` (up to date) |
| Lifetime | ≤ 6 weeks, hard limit |
| Features branch from | `epic/EPIC-NNN` |
| Feature PRs target | `epic/EPIC-NNN` |
| Sync with `main` | Weekly, via `merge` (never `rebase`) |
| Merge to `main` | One PR at close, squash or merge commit |
| After merge | Delete the branch. No archives. |

**Never name it `develop` or `develop/*`.** The name signals temporariness.

## Daily flows

**Open an epic:**
```bash
git switch main && git pull
git switch -c epic/EPIC-007-user-analytics
git push -u origin epic/EPIC-007-user-analytics
```

**Work on a feature inside the epic:**
```bash
git switch epic/EPIC-007-user-analytics
git pull
git switch -c feat/STORY-042-track-events
# code + commits
git push -u origin feat/STORY-042-track-events
# PR → epic/EPIC-007-user-analytics   (NOT main)
```

**Weekly sync (on the epic):**
```bash
git switch epic/EPIC-007-user-analytics
git pull
git merge origin/main
# resolve conflicts here, once — not in every feature PR
git push
```

**Close the epic:**
```bash
git switch epic/EPIC-007-user-analytics
git pull
git merge origin/main          # final sync
# run full regression on this branch
git push
# PR → main (single merge)
git branch -d epic/EPIC-007-user-analytics
git push origin --delete epic/EPIC-007-user-analytics
```

## Rules

1. **Time-boxed.** ≤ 6 weeks. At the limit: split, abandon, or partial merge.
2. **One epic at a time per team.** Two open epics means `main` is no longer
   the only integration point.
3. **Features branch from the epic, not from `main`.**
4. **Feature PRs target the epic, not `main`.** Reviewer is the epic owner.
5. **Sync with `main` weekly minimum.** Use `merge`, never `rebase` — the epic
   is a shared branch; rewriting its history breaks collaborators.
6. **Specs still travel in `spec/*` → `main`.** The epic consumes them on sync.
   Never write canonical specs inside the epic.
7. **One PR from `epic/*` to `main` at close.** Not one per feature.
8. **Delete the epic after merge.** No resurrection; create a new one if needed.
9. **WIP = 1 per developer still applies.** A 10-feature epic does not mean 10
   parallel features per person.
10. **`main` must not advance after the final sync.** If it does, re-sync and
    re-run regression before the merge PR.

## Enforcement (CI)

**Age warning:**
```bash
age=$(( ($(date +%s) - $(git log -1 --format=%ct origin/epic/$EPIC)) / 86400 ))
[ "$age" -gt 42 ] && echo "::warning::epic/$EPIC open for $age days (limit 42)"
```

**Divergence warning:**
```bash
behind=$(git rev-list --count origin/epic/$EPIC..origin/main)
[ "$behind" -gt 100 ] && echo "::warning::epic/$EPIC $behind commits behind main — sync required"
```

**Block merge if `main` advanced after last sync:**
```bash
last_sync=$(git log -1 --format=%ct --merges origin/epic/$EPIC)
main_head=$(git log -1 --format=%ct origin/main)
if [ "$main_head" -gt "$last_sync" ]; then
  echo "::error::main advanced after last sync — sync and re-run regression"
  exit 1
fi
```

## Epic branch vs feature flags

| Aspect | Epic branch | Feature flags |
|---|---|---|
| Integration with `main` | Deferred to close | Continuous |
| Regression | Once at the end | Continuous on staging |
| Conflict risk | High if epic runs long | Low |
| Infrastructure | None | Flag system required |
| TBD compliance | Weakened, controlled | Full |
| Team coordination | Weekly sync | Minimal |
| "Test the whole" cost | Natural | Requires flag orchestration |

**Rule of thumb:** > 6 weeks or > 15 features → prefer feature flags. Short,
tight epics → epic branch is simpler and needs no infra.

## Common pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Epic becomes permanent `develop` | Nobody closes it; new features keep branching from it | Hard 6-week limit; delete at close |
| Features branch from `main` instead of epic | Feature PRs land in `main`, defeating the batch | Branch from the epic; document in the epic PR |
| No weekly sync | 300-commit divergence, unresolvable conflicts at close | Calendar reminder; CI warning at > 100 behind |
| `rebase` on the epic | Collaborators lose commits | Enforce `merge` only on shared branches |
| Canonical specs written inside the epic | Specs never reach `main` until epic closes | Specs stay in `spec/*`; epic consumes on sync |
| `main` advances after final sync | Regression invalid; merge introduces untested change | Block the merge PR until re-sync + re-test |
| Two epics open at once | `main` is no longer the only integration point | One epic per team at a time |
| Epic lasts > 6 weeks | Conflicts dominate; value delivery stalls | Split, or convert to `release/*` flow |

## Relationship to the rest of TBD

- **Does not replace `release/*`.** Release branches freeze versions for
  hotfixes; epics batch features before `main`. Orthogonal — both can coexist.
- **Does not replace `spec/*`.** Specs continue to merge to `main`
  independently. The epic consumes them on sync.
- **Does not break WIP = 1.** WIP is per developer, not per branch.
- **Does not become a second trunk.** Every epic closes. If one does not, the
  model has failed and should be reverted to `feat/*` + feature flags.
