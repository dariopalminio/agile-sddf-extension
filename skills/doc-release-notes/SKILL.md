---
name: doc-release-notes
description: "Generate release notes and changelogs from git commits, updates, or feature lists"
license: MIT
metadata:
  owner: dariopalminio/agile-sddf-extension
---

# Doc Release Notes

Generate professional release notes and changelogs from commits, feature lists, or updates.

## Overview

This skill helps you generate professional release notes and changelogs from commits, feature lists, or updates.

**Capabilities:**
- Transform git commits into readable changelogs
- Categorize changes by type
- Write user-friendly release notes
- Maintain changelog history
- Follow conventional formats

**Limitations:**
- Cannot access git repositories directly
- Requires commit messages or change descriptions as input
- Cannot verify semantic versioning automatically
- Technical details should be verified by developers

## Prerequisites

- Git commit messages, a feature list, or change descriptions provided as input.
- (Optional) An existing changelog file to append new entries to.
- Familiarity with the target format (Keep a Changelog, Semantic Versioning).

## Output

Description of what the skill produces: a formatted changelog or release notes in one of the supported formats below.

### Output Formats

Pick one of these templates (full content lives in `references/`, loaded on demand). Each targets a different file and update strategy:

| Format | Template | Target file | Update strategy |
|--------|----------|-------------|-----------------|
| Standard Changelog (Keep a Changelog) | [references/standard-changelog.md](references/standard-changelog.md) | `CHANGELOG.md` | Cumulative — structured history; prepend a new version section |
| User-Friendly Release Notes | [references/user-friendly-release-notes.md](references/user-friendly-release-notes.md) | `RELEASE_NOTES.md` | Cumulative — public announcements; fixed `# What's New` title, one `## Version X.X.X` per release |
| Technical Release Notes | [references/technical-release-notes.md](references/technical-release-notes.md) | `RELEASE_NOTES_TECHNICAL.md` (root or `docs/`) | Snapshot / overwrite — developer-facing deployment manifest; always the current release only |

> These files are only loaded if the agent needs additional context.

**Technical Release Notes is a snapshot, not a history.** `RELEASE_NOTES_TECHNICAL.md` is an operational "deployment manifest" for the release currently in staging / about to ship — overwrite it each release. The detailed technical history is preserved by Git tags (`git show v2.1.0:RELEASE_NOTES_TECHNICAL.md`) and by attaching the file to the GitHub/GitLab Release; the summarized history lives in `CHANGELOG.md`. See [references/technical-release-notes.md](references/technical-release-notes.md) for the full strategy.

### Category Definitions

#### Change Types (Conventional Commits)
| Type | Description | Changelog Section |
|------|-------------|-------------------|
| `feat` | New feature | Added |
| `fix` | Bug fix | Fixed |
| `docs` | Documentation | Documentation |
| `style` | Formatting | Changed |
| `refactor` | Code restructuring | Changed |
| `perf` | Performance | Changed |
| `test` | Tests | N/A (internal) |
| `chore` | Maintenance | N/A (internal) |
| `breaking` | Breaking change | ⚠️ BREAKING |
| `security` | Security fix | Security |
| `deprecate` | Deprecation | Deprecated |
| `remove` | Removal | Removed |

#### Semantic Versioning
```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (incompatible API changes)
MINOR: New features (backwards compatible)
PATCH: Bug fixes (backwards compatible)
```

## Change Management Workflow

How the three files change across the release lifecycle. Full details in [references/release-workflow.md](references/release-workflow.md) (loaded on demand).

1. **Day-to-day development** — Developers only touch `CHANGELOG.md`, accumulating entries under `[Unreleased]`. `RELEASE_NOTES.md` and `RELEASE_NOTES_TECHNICAL.md` stay frozen on the last shipped version.
2. **Release preparation (the key moment)** — In the release PR: rename `[Unreleased]` to the new version + date in `CHANGELOG.md`; **insert** the new version block at the top of `RELEASE_NOTES.md`; **overwrite** `RELEASE_NOTES_TECHNICAL.md` with this version's tables.
3. **Release day (CI/CD)** — On tagging, the pipeline extracts **only the top block** of `RELEASE_NOTES.md` for the public announcement (GitHub Release, email, blog), and attaches the full `RELEASE_NOTES_TECHNICAL.md` as an artifact / dev docs for QA and DevOps.
4. **Post-release & reset** — Add a fresh empty `[Unreleased]` to `CHANGELOG.md`; leave `RELEASE_NOTES.md` and `RELEASE_NOTES_TECHNICAL.md` untouched until the next release PR.

**Golden rule — what to remember:**

- **`CHANGELOG.md`** grows upward during development (the day-to-day file).
- **`RELEASE_NOTES.md`** grows upward **only during release preparation** (inserting the new version).
- **`RELEASE_NOTES_TECHNICAL.md`** is ephemeral — it always shows the **latest** version, because it is overwritten on every release.

## Examples

### How to Use

#### From Git Commits
```
"Generate a changelog from these commits:
- fix: resolve login timeout issue
- feat: add dark mode support
- docs: update API documentation"
```

#### From Feature List
```
"Create release notes for version 2.0:
- New dashboard design
- Performance improvements (50% faster)
- Fixed: export button not working
- Removed: legacy API v1"
```

#### From Diff/Changes
```
"Summarize these code changes into a changelog entry"
```

### Templates

#### Commit to Changelog Entry
```
Input: feat(auth): add OAuth 2.0 support (#123)
Output: - Added OAuth 2.0 authentication support
```

#### Bug Report to Fix Entry
```
Input: Users reported export failing on files > 10MB
Output: - Fixed export functionality for large files (> 10MB)
```

### Best Practices

#### Writing Good Entries
✅ **Do**:
- Write from user's perspective
- Be specific about what changed
- Include relevant issue/PR numbers
- Group related changes

❌ **Don't**:
- Use technical jargon for user-facing notes
- Include internal changes in public changelog
- Be vague ("various fixes")
- Include commit hashes in user docs

#### Organizing Changes
1. **Impact first**: Most important changes at top
2. **Group logically**: By feature area or type
3. **Be consistent**: Same format throughout
4. **Date everything**: Clear version dates
