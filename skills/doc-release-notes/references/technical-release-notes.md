# Technical Release Notes

Use for detailed, table-based release documentation aimed at developers, with IDs, PRs,
severities, dependency updates, and migration notes.

## Strategy: snapshot / overwrite

`RELEASE_NOTES_TECHNICAL.md` lives at the project root (or under `docs/`) and **always represents
the current release only** — the one in staging or about to ship. Overwrite it on every release;
it is **not** a cumulative history.

It is a **deployment manifest**: an operational, point-in-time artifact, not meant to be read
historically. Its audiences:

- **QA**: exactly what to verify in this specific release.
- **DevOps / SRE**: which dependencies were updated and which database migrations to run before deploying.
- **Release manager**: a checklist to sign off the production go-live.

## Preserving the technical history

Overwriting the file does not lose history, because:

1. **Git keeps it.** Tag each release (`git tag v2.1.0`) and recover the exact file later with
   `git show v2.1.0:RELEASE_NOTES_TECHNICAL.md`.
2. **Release artifacts.** Attach `RELEASE_NOTES_TECHNICAL.md` to the GitHub/GitLab Release so the
   platform stores it permanently against that version.
3. **Optional frozen copies (compliance only).** If internal policy requires a physical history in
   the repo, keep frozen copies under `docs/technical-releases/` (`v2.1.0.md`, `v2.0.0.md`). This
   is exceptional — options 1 and 2 are normally enough.

The summarized, human-readable history lives in `CHANGELOG.md`; the full history lives in Git.

## Template

```markdown
# Release v2.1.0

**Release Date**: 2026-01-29
**Type**: Minor Release
**Compatibility**: Breaking changes: None

## Summary
This release introduces dark mode, CSV export, and significant performance improvements.

## Changes

### Features
| ID | Description | PR |
|----|-------------|-----|
| FEAT-123 | Dark mode theme support | #456 |
| FEAT-124 | CSV export functionality | #457 |
| FEAT-125 | Keyboard shortcuts | #458 |

### Fixes
| ID | Description | Severity | PR |
|----|-------------|----------|-----|
| BUG-789 | Login timeout on slow connections | High | #459 |
| BUG-790 | Mobile export button | Medium | #460 |

### Dependencies Updated
| Package | From | To | Reason |
|---------|------|-----|--------|
| lodash | 4.17.20 | 4.17.21 | Security patch |

## Migration Guide
No migration required for this release.

## Known Issues
- Dark mode does not apply to embedded iframes

## Contributors
@developer1, @developer2, @designer1
```
