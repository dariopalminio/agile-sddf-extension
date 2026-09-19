# Standard Changelog (Keep a Changelog)

Use when maintaining a structured `CHANGELOG.md` that follows the
[Keep a Changelog](https://keepachangelog.com/) format and Semantic Versioning.

- **Template:** `assets/changelog.template.md`
- **Finished example:** `examples/CHANGELOG.md`
- **Target file:** `CHANGELOG.md` at the project root
- **Strategy:** cumulative. Prepend one version block per release directly below `[Unreleased]`;
  never edit a block already in the file.

This is the day-to-day file — the only one developers touch during a sprint. Entries accumulate
under `[Unreleased]` and are renamed to the version number at release preparation.

## Routing commits into sections

Each Conventional Commit type maps to exactly one section of the template. Types marked N/A are
internal and do not belong in a public changelog at all.

| Type | Description | Section |
|------|-------------|---------|
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

A commit whose type routes to N/A is dropped, not filed under "Changed". A release consisting only
of N/A commits gets no version block.

## Turning a commit into an entry

Rewrite the commit subject as a statement about what changed for the reader. Drop the type prefix,
drop the scope, keep the issue or PR number when the project cites them.

```
Input:  feat(auth): add OAuth 2.0 support (#123)
Output: - Added OAuth 2.0 authentication support
```

```
Input:  Users reported export failing on files > 10MB
Output: - Fixed export functionality for large files (> 10MB)
```

Entries are specific and grouped: "Fixed export button not responding on mobile" earns its line,
"various fixes" does not. Order each section by impact, most significant first.
