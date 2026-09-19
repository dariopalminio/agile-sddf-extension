# Release Workflow — File Change Management

How the three documentation files change across the release lifecycle. The focus is on the
**strategy** and the **exact moment each file is loaded** with content, so that no developer
touches the "marketing" or "operations" files by mistake during a sprint, and the CI/CD pipeline
always has the correct, polished material on release day.

The three files:

- `CHANGELOG.md` — structured technical history (cumulative).
- `RELEASE_NOTES.md` — user-facing announcements (cumulative).
- `RELEASE_NOTES_TECHNICAL.md` — developer-facing deployment manifest (snapshot / overwrite).

## The lifecycle of the 3 files

### Phase 1 — Day-to-day development

Only developers touch one file: `CHANGELOG.md`. All incoming features, fixes, and raw technical
changes accumulate here under the `[Unreleased]` heading. The other two files
(`RELEASE_NOTES.md` and `RELEASE_NOTES_TECHNICAL.md`) stay completely frozen, reflecting the last
version in production.

### Phase 2 — Release preparation (the key moment)

A dedicated Pull Request is opened for the new version. This is where the "loading" of content
happens:

- **`CHANGELOG.md`**: rename the `[Unreleased]` section so it carries the version number and
  today's date.
- **`RELEASE_NOTES.md`** *(the big load)*: the product team or Tech Writer **inserts** (does not
  overwrite) the new version block at the very top of the file, right below the main title. This
  keeps it a cumulative history of news for end users.
- **`RELEASE_NOTES_TECHNICAL.md`**: the Lead Developer **completely overwrites** this file with the
  tables of IDs, PRs, dependencies, and migration guides specific to this version. The previous
  version is dropped on purpose, because it is a "snapshot" of the current deployment.

### Phase 3 — Release day (CI/CD)

When the version tag is created, the automated pipeline kicks in with clearly separated roles:

- **For the public announcement**: the script extracts **only the top block** of
  `RELEASE_NOTES.md` (the new version) and injects it as the main body of the GitHub Release, the
  customer email, or the blog post.
- **For technical teams**: the pipeline reads the full content of `RELEASE_NOTES_TECHNICAL.md` and
  attaches it as an artifact or publishes it to the developer documentation, ensuring DevOps and QA
  have the migration and dependency details at hand.

### Phase 4 — Post-release & reset

Once published, the repository prepares for the next cycle:

- Add a new, empty `[Unreleased]` section in `CHANGELOG.md` so developers can start writing again.
- **`RELEASE_NOTES.md`** and **`RELEASE_NOTES_TECHNICAL.md`** are left untouched. They stay exactly
  as they are, reflecting that `v2.1.0` is now the version live in production. They will not move
  until the next release Pull Request.
