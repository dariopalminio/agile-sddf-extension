# doc-release-notes

Generate release notes from git commits, updates, or feature lists.

## What it does

Transforms git commits, feature lists, or change descriptions into professional, readable
changelogs and release notes. It categorizes changes by type (Added, Fixed, Changed…),
supports multiple output formats (Keep a Changelog, user-friendly notes, technical release
notes), and follows Conventional Commits and Semantic Versioning conventions.

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

## Contents

- `SKILL.md` — main instructions
- `references/` — loaded on demand: changelog format templates (standard, user-friendly, technical) and the release workflow guide

## License

MIT © Dario Palminio
