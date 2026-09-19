# Technical Release Notes

Use for detailed, table-based release documentation aimed at developers, with IDs, PRs,
severities, dependency updates, and migration notes.

- **Template:** `assets/release-notes-technical.template.md`
- **Finished example:** `examples/RELEASE_NOTES_TECHNICAL.md`
- **Target file:** `RELEASE_NOTES_TECHNICAL.md` at the project root (or under `docs/`)

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

## Routing changes into the tables

Every row must be traceable — an ID and a PR, so QA and DevOps can open the work item.

| Change | Destination |
|--------|-------------|
| Shipped feature | `Features` table — ID, description, PR |
| Bug fix | `Fixes` table — ID, description, **severity**, PR |
| Dependency version bump | `Dependencies Updated` table — package, from, to, reason |
| Schema change, data backfill, config change | `Migration Guide` as ordered steps |
| Defect shipping unfixed, with its workaround | `Known Issues` |

Severity drives QA's verification order, so it is required on every fix row; use the project's own
scale, or Critical / High / Medium / Low if it has none. A dependency moved for a CVE says so in
its Reason — that is the row DevOps reads first.

Unlike the other two formats, internal changes belong here. A refactor with no user-visible effect
still matters to whoever verifies the deployment.

State "No migration required for this release" explicitly rather than leaving the section empty —
an empty section reads as an oversight, not as an all-clear.

