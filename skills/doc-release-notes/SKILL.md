---
name: doc-release-notes
description: >-
  Generate release notes and changelogs from git commits, updates, or feature lists.
  Use when creating, editing or updating `CHANGELOG.md`, `RELEASE_NOTES.md`, `RELEASE_NOTES_TECHNICAL.md` or when the user mentions update changelog, update release notes, update technical release notes, create changelog, create release notes, create technical release notes, generate changelog, generate release notes, generate technical release notes.
license: MIT
metadata:
  owner: dariopalminio/agile-sddf-extension
---

# Doc Release Notes

Generate professional release notes and changelogs from commits, feature lists, or updates.

Each target file has its own template in `assets/`. Read the template at run time and instantiate
it — never write one of these files from memory.

The templates are the sole source of the output's structure. Nothing in this document enumerates
their sections or slots; where this document and a template disagree about shape, the template wins.

## Boundaries

- Write only the release documentation file that was asked for. Never modify source code, tests, or
  configuration.
- Work from the commit messages, feature list, or change descriptions provided. This skill does not
  read git repositories directly — ask for the input rather than inferring it.
- Do not invent changes. Every entry traces to something in the supplied input.
- Do not copy content from `examples/`. Those are finished documents kept for tone and density only;
  their releases are fictional.
- Semantic versioning cannot be verified automatically. Propose a version, state the reasoning, and
  let the user correct it.

## 1. Choose the format and target file

Three formats, each with its own template, target, and update strategy:

| Format | Template | Target file | Strategy |
|--------|----------|-------------|----------|
| Standard Changelog (Keep a Changelog) | `assets/changelog.template.md` | `CHANGELOG.md` | Cumulative — prepend a version block |
| User-Friendly Release Notes | `assets/release-notes.template.md` | `RELEASE_NOTES.md` | Cumulative — insert below the fixed `# What's New` title |
| Technical Release Notes | `assets/release-notes-technical.template.md` | `RELEASE_NOTES_TECHNICAL.md` (root or `docs/`) | Snapshot — overwrite with the current release |

If the request names a file, that settles it. If it names an audience — "for our users", "for the
deploy" — pick the matching format and say which you chose. If neither is clear, ask.

Each format's reference carries its routing rules and is loaded on demand:
[standard-changelog.md](references/standard-changelog.md),
[user-friendly-release-notes.md](references/user-friendly-release-notes.md),
[technical-release-notes.md](references/technical-release-notes.md).

## 2. Gather and categorize the changes

Collect the raw input: commit messages, a feature list, change descriptions, or an existing
`[Unreleased]` section to promote.

Route each change into a section using **the chosen format's reference**, not a general mapping. The
routing differs per format by design — a `perf` commit is `Changed` in a changelog but
`🚀 Improvements` in user-facing notes, and a `refactor` commit appears in technical notes while
producing nothing at all in the other two.

Determine the version from the changes present:

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (incompatible API changes)
MINOR: New features (backwards compatible)
PATCH: Bug fixes (backwards compatible)
```

State the version you derived and what drove it. If the input contains a breaking change, say so
explicitly — that is the decision most often gotten wrong.

## 3. Read the template

Read the chosen template from `assets/` and copy it as the base of the output. Identify its two
parts from its own comments:

- the **preamble** — written once, only when the target file is being created
- the **repeating block** — emitted once per release

For the technical template the whole file is the repeating block, because it is overwritten.

If the template cannot be read, stop and report it. Do not reconstruct it from this document.

## 4. Fill the slots

The templates use two kinds of slot, and both must be gone from the output:

- **Bare capitalized tokens** — `VERSION`, `DATE`, `ADVISORY-ID`, `TRACKER-ID`. These sit inside
  punctuation the output format requires, so only the word is replaced.
- **`[bracketed phrases]`** — prose slots. Replace the whole thing, brackets included, or delete the
  line.

Two bracketed forms are literal and must survive intact:

- **Markdown link labels** — a bracket immediately followed by `(` is a link, not a slot.
  `[Keep a Changelog](https://keepachangelog.com/)` keeps its brackets; in
  `[Help Center]([URL])` only the inner `[URL]` is the slot.
- **Keep a Changelog headings** — `## [2.1.0] - 2026-01-29` and `## [Unreleased]` keep their square
  brackets; inside the version heading only the word `VERSION` is replaced.

Any other bracket left in the output is a defect.

Delete every subsection and table row the release leaves empty, and delete every HTML comment
inherited from the template.

## 5. Apply the update strategy

**Cumulative targets** (`CHANGELOG.md`, `RELEASE_NOTES.md`) — if the file exists, insert the new
version block and leave everything already in it byte-identical. Never regenerate the preamble,
never rewrite a published block, never reorder older versions. In `CHANGELOG.md` the block goes
below `[Unreleased]`; in `RELEASE_NOTES.md` it goes directly below the fixed title. If the file does
not exist, write the preamble first, then the block.

**Snapshot target** (`RELEASE_NOTES_TECHNICAL.md`) — overwrite with the current release. If the file
already exists, report the path and offer:

- `(r) Regenerate` — overwrite with this release
- `(n) No modificar` — stop, change nothing
- `(c) Comparar` — show a diff against the current file, then ask again

With `--force`, overwrite directly. Overwriting loses nothing: the previous version stays reachable
through its git tag and its release artifact — see
[technical-release-notes.md](references/technical-release-notes.md).

### Where each file sits in the release lifecycle

Full detail in [release-workflow.md](references/release-workflow.md), loaded on demand.

1. **Day-to-day development** — developers only touch `CHANGELOG.md`, accumulating entries under
   `[Unreleased]`. The other two stay frozen on the last shipped version.
2. **Release preparation** — rename `[Unreleased]` to the version and date; insert the new block in
   `RELEASE_NOTES.md`; overwrite `RELEASE_NOTES_TECHNICAL.md`.
3. **Release day (CI/CD)** — the pipeline extracts only the top block of `RELEASE_NOTES.md` for the
   public announcement and attaches `RELEASE_NOTES_TECHNICAL.md` as an artifact.
4. **Post-release** — add a fresh empty `[Unreleased]` to `CHANGELOG.md`; leave the other two alone
   until the next release PR.

Golden rule: `CHANGELOG.md` grows during development, `RELEASE_NOTES.md` grows only at release
preparation, `RELEASE_NOTES_TECHNICAL.md` is ephemeral and always shows the latest version.

## 6. Validate before saving

Check the drafted content against this list. Fix and re-check; do not save a file that fails.

- No slot remains: no bare capitalized token, no `[bracketed phrase]`. The only surviving brackets
  are markdown link labels and the literal Keep a Changelog headings.
- Every markdown link still resolves — no link left pointing at a slot instead of a URL.
- No HTML comment inherited from the template remains.
- **No content from `examples/` appears** unless it genuinely came from the user's input — no
  `lodash`, no `@developer1`, no `CVE-2026-XXXX`, no `support@example.com`, no invented dark-mode
  feature. This is the most likely failure; check it explicitly.
- The version and date are real, and the version matches what step 2 derived.
- Every entry traces to something in the supplied input.
- No empty section or placeholder table row survives.
- For a cumulative target: the preamble and every pre-existing version block are unchanged, and the
  new block sits in the right position.

## 7. Report

Return:

- the format chosen and the file written
- the version and the reasoning behind it
- how many entries landed in each section
- changes dropped as internal, and why
- anything the user must confirm — the version, a breaking change, a guessed severity

## Flags

| Flag | Behavior |
|------|----------|
| `--dry-run` | Report the target, the version, and the entries per section. Write nothing. |
| `--force` | Overwrite the snapshot target without asking. |
| `--interactive` | Confirm format, version and entries before writing. |

## References

| Topic | Reference | Load when |
|-------|-----------|-----------|
| Output templates | `assets/` | Required. Read the chosen template before writing — it is the sole source of the output's structure. |
| Format routing | `references/standard-changelog.md`, `references/user-friendly-release-notes.md`, `references/technical-release-notes.md` | Categorizing changes for the chosen format, or deciding its update strategy. |
| Release lifecycle | `references/release-workflow.md` | Deciding which files a given moment in the release cycle should touch. |
| Finished examples | `examples/` | Judging tone and density. Never a source of content — the releases in them are fictional. |
