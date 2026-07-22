---
name: using-git-tbd
description: Use this skill when managing git branches, releases, or hotfixes according to the Trunk-Based Development (TBD). It enforces naming conventions and synchronization policies.
author: dariopalminio
version: 1.0.0
metadata:
  short-description: Expert guidance on Trunk-Based Development (TBD) branching and release management.
---

# Using Git TBD (Branching Strategy)

Using Git branching with the Trunk-Based Development (TBD) strategy.

## Overview

Trunk-Based Development is a branching model in which developers make frequent commits to the main branch, which is always release-ready. There are several styles of trunk-based development, either committing directly to the main branch or using short-lived feature branches. It relies on continuous integration and continuous delivery (CI/CD) to validate that builds succeed and that developers don't break the build process.

The characteristics of Trunk-Based Development are:
* There is a single main branch (main) that acts as the trunk.
* Developers integrate changes into main frequently.
* Feature branches, when they exist, are very short-lived.
* All CI/CD is oriented toward validating and deploying from main.
* Small, incremental commits are encouraged.
* There are no develop or release branches that get merged into main.
* Developers do not commit to release branches.
* Release branches are cut from the main branch.
* Only changes from the main branch can be merged into a release branch.

## TBD Branch Flow Diagram

```
    main
     |
     * ---> feature/login (development)
     * <---- feature/login * (merge)
     |
     * ---> feature/payment (development) 
     * <---- feature/payment * (merge)
     |
     * ---------> release/1.0 (cut) --> (validate) --> tag v1.0
     |           (not merged back)
     |
     * ---> hotfix/auth (cut from main)
     |           |
     |           * (fix) 
     * <---- hotfix/auth (merge to main)
     |
     * ---------> cherry-pick to release/1.0 --> tag v1.0.1
```

## Release Strategies

There are different release strategies within trunk-based development. We can release directly from the main branch or by using release branches. How you work depends directly on your release cadence.

1. Strategy 1 (continuous): Release from trunk (Continuous Deployment): "Teams with a higher release cadence do the former [release from trunk]." (`references/release-from-trunk.md`)
2. Strategy 2 (batch): Release from a release branch (Branch for Release): "Teams with a lower release cadence do the latter [branch for release]." (`references/release-branches.md`)

Choosing between one and the other is not a matter of taste, but a technical decision based on your delivery cycle. Let's look at each one in detail.


## Best Practices

* **Branch convention**: Follow the recommended "Branch Convention" [Conventional Branches](https://conventionalbranch.org/).
* **Commit convention**: Use "Conventional Commits" [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to keep a clear, structured commit history, which makes it easier to generate changelogs and trace changes.
* **Branch protection**: Configure rules in GitHub to require PRs and successful CI on main.
* **Atomic commits**: Each commit should have a clear purpose and pass all tests locally.
* **Small Pull Requests**: A story or PR should be atomic (fewer than 200 lines of change).
* **Semantic Versioning**: Use "Semantic Versioning 2.0.0" [Semantic Versioning 2.0.0](https://semver.org/) and update the version (in package.json) before merging to main.
* Always update your source branch (main) with git pull before creating a new branch or opening a PR to avoid conflicts.
* **Ephemeral branch cleanup**: Delete feat/ branches after merging them and release/ branches after publishing.
* Purpose-driven Branch Names: Each branch name clearly indicates its purpose, making it easy for all developers to understand what the branch is for.

## Git Safety Protocol

- NEVER commit secrets (.env, credentials.json, private keys).
- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless user asks
- NEVER force push to main/master
- If commit fails due to hooks, fix and create NEW commit (don't amend)

## References

For more details, consult these reference files (loaded on demand):

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Feature Development (Short-Lived Feature Branches) | `references/features.md` | Creating feature branches, committing feature changes, merging them into main |
| Releases (Branch for Release) | `references/release-branches.md` | Cutting a release branch (Release Branches), tagging a release, deploying to production |
| Release from Trunk (Continuous Deployment) | `references/release-from-trunk.md` | Publishing directly from main, high release frequency |
| Bugfix / Hotfix Resolution | `references/hotfixes.md` | Cutting a hotfix branch, resolving a hotfix, merging a hotfix into main, applying the fix to the release branch (Cherry-pick) |
| `Conventional Commits` | `references/conventional-commit.md` | Following the commit convention to keep a clear, structured history |
| Pull Request | `references/pull-request.md` | Creating and managing Pull Requests on GitHub |

External references:
* [Trunk-Based Development](https://trunkbaseddevelopment.com)
* [Trunk-Based Development: Branch for Release](https://trunkbaseddevelopment.com/branch-for-release/)
* [Trunk-Based Development for Beginners](https://ingram.technology/blogs/20-11-2024-trunk-based-development-for-beginners.htm)
