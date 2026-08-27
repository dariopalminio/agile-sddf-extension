# doc-release-notes

Generate release notes from git commits, updates, or feature lists.

## What it does

Transforms git commits, feature lists, or change descriptions into professional, readable
changelogs and release notes. It categorizes changes by type (Added, Fixed, Changed…),
supports multiple output formats (Keep a Changelog, user-friendly notes, technical release
notes), and follows Conventional Commits and Semantic Versioning conventions.

Each target file is instantiated from its own template in `assets/`, so the output shape is fixed
by the template rather than reinvented per run. The three formats differ in how they update:
`CHANGELOG.md` and `RELEASE_NOTES.md` are cumulative — a new version block is inserted and older
ones are left untouched — while `RELEASE_NOTES_TECHNICAL.md` is a snapshot, overwritten each
release, with its history preserved by git tags and release artifacts.

## When to use

- Turning a list of git commits into a structured changelog
- Writing user-facing release notes for a new version
- Summarizing a set of code changes into a changelog entry
- Maintaining a `CHANGELOG.md` over time

> Note: this skill works from commit messages or change descriptions you provide — it does not
> read git repositories directly.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-release-notes
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Usage

Paste the changes and say which file you want. Nothing else is required — no configuration, no flags:

```text
> Generate a changelog from these commits:
  - fix: resolve login timeout issue
  - feat: add dark mode support
  - chore: bump eslint to 9.14
> Write release notes for 2.1 — new dashboard, 50% faster loading, fixed the export button
> Update RELEASE_NOTES_TECHNICAL.md for the release going to staging
```

The second form matters: if you name an audience rather than a file — "for our users", "for the
deploy" — the skill picks the matching format and tells you which one it chose. If neither the file
nor the audience is clear, it asks before writing.

What happens next, in order:

1. **Picks the format and target.** `CHANGELOG.md`, `RELEASE_NOTES.md`, or
   `RELEASE_NOTES_TECHNICAL.md` — each has its own template and its own update strategy.
2. **Categorizes the changes** using that format's routing rules. The routing differs per format
   deliberately: a `perf` commit is `Changed` in a changelog but `🚀 Improvements` in user-facing
   notes, and a `chore` commit is dropped from both while still appearing in the technical manifest.
3. **Derives the version** from what is present — MAJOR for breaking changes, MINOR for features,
   PATCH for fixes — and tells you the reasoning so you can overrule it.
4. **Instantiates the template** from `assets/`, filling every slot and deleting every section the
   release leaves empty.
5. **Applies the update strategy.** For a cumulative file it inserts the new version block and
   leaves everything already there byte-identical. For the technical snapshot it overwrites, asking
   first — regenerate, skip, or show a diff — unless you pass `--force`.
6. **Validates before saving**: no slot left unfilled, no template comment surviving, every markdown
   link still resolving, and no content leaking in from the fictional examples.

You get the file written, plus a report: the format chosen, the version and why, how many entries
landed in each section, which changes were dropped as internal, and anything you should confirm.

The result reads like this — a new block prepended, the previous version untouched below it:

```markdown
## [Unreleased]

## [2.2.0] - 2026-08-26

### Added
- Dark mode across all pages

### Fixed
- Login no longer times out on slow connections

## [2.1.0] - 2026-01-29
```

Two things it will not do: it never rewrites a version block that has already been published — older
entries are preserved exactly as they are — and it never invents a change, so every entry traces
back to something you supplied.

### Flags

| Flag | Behavior |
|------|----------|
| `--dry-run` | Report the target, the version and the entries per section. Write nothing. |
| `--force` | Overwrite `RELEASE_NOTES_TECHNICAL.md` without asking. |
| `--interactive` | Confirm format, version and entries before writing. |

## Contents

- `SKILL.md` — main instructions
- `assets/` — one output template per target file: `changelog.template.md`,
  `release-notes.template.md`, `release-notes-technical.template.md`
- `references/` — loaded on demand: per-format routing guides (standard, user-friendly, technical)
  and the release workflow guide
- `examples/` — finished documents for tone and density: `CHANGELOG.md`, `RELEASE_NOTES.md`,
  `RELEASE_NOTES_TECHNICAL.md`. Illustrative only; the releases in them are fictional

## License

MIT © Dario Palminio
