# User-Friendly Release Notes

Use for public, end-user-facing announcements that highlight new features and improvements
in approachable language.

- **Template:** `assets/release-notes.template.md`
- **Finished example:** `examples/RELEASE_NOTES.md`
- **Target file:** `RELEASE_NOTES.md` at the project root
- **Strategy:** cumulative. Keep a single fixed `# What's New` title and insert a new
  `## Version X.X (YYYY-MM-DD)` block directly below it, newest on top, so versions accumulate in
  the same file.

This file is loaded only during release preparation, by the product team or a tech writer — never
during day-to-day development. On release day CI extracts just the top block for the public
announcement, so that block must stand alone without the rest of the file.

## Routing changes into sections

The four sections are audience-driven, not commit-driven. Ask what the user experiences, not what
the code did.

| Change | Section |
|--------|---------|
| Something the user could not do before | ✨ New Features |
| Something that existed and is now better or faster | 🚀 Improvements |
| Something that was broken and now works | 🐛 Bug Fixes |
| Something demanding user action — deprecation, dropped platform, migration | ⚠️ Important Notes |
| Internal refactor, test, or chore with no user-visible effect | Omitted entirely |

The mapping from `standard-changelog.md` does not apply here. A `perf` commit is an Improvement,
not a "Changed"; a `refactor` commit usually produces nothing at all.

## Writing the entries

✅ **Do**:
- Write from the user's perspective
- Be specific about what changed
- Say where in the product to find it
- Group related changes
- Quantify a gain when you have a real measurement

❌ **Don't**:
- Use technical jargon
- Include internal changes
- Be vague ("various fixes")
- Include commit hashes or internal ticket IDs

Lead each version block with one or two sentences naming the headline change — that sentence is
often what gets quoted in the release email.
