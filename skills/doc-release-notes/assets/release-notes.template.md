<!-- ------------------------------------------------------------------ -->
<!-- TEMPLATE — RELEASE_NOTES.md (user-facing announcements)            -->
<!--                                                                    -->
<!-- Strategy: CUMULATIVE. The title and the footer are written once,   -->
<!-- when the file is first created. Each release INSERTS one version   -->
<!-- block directly below the title, above every older block. Never     -->
<!-- overwrite the file and never edit a block already published.       -->
<!--                                                                    -->
<!-- Two kinds of slot, both of which must be gone from the output:     -->
<!--   BARE CAPS  (VERSION, DATE)  — a value inside format punctuation  -->
<!--   [phrase]                    — a prose slot; replace or delete    -->
<!-- Delete every subsection left with no entries, and delete every one -->
<!-- of these comments.                                                 -->
<!--                                                                    -->
<!-- Audience is the end user. No commit hashes, no internal refactors, -->
<!-- no jargon. If a change is invisible to the user, leave it out.     -->
<!-- ------------------------------------------------------------------ -->

<!-- === PREAMBLE — write once. This title is fixed; never version it. === -->

# What's New

<!-- === VERSION BLOCK — one per release, newest first, inserted     === -->
<!-- === directly below the title. Repeat for each release.          === -->

## Version VERSION (DATE)

<!-- Literal example: `## Version 2.1 (2026-01-29)`. Public notes may -->
<!-- use the marketing version (2.1) rather than the full semver.     -->

[One or two sentences naming the headline change of this release]

### ✨ New Features

<!-- One `####` subsection per notable feature: what it is, where to  -->
<!-- find it, what it does for the user. Drop the `####` level and    -->
<!-- use plain bullets when the features are small.                   -->

#### [Feature name]

[What it does, where the user finds it, and why they would want it]

### 🚀 Improvements

<!-- Things that already existed and are now better. Lead with the    -->
<!-- user-visible gain; quantify it when you have a real number.      -->

- **[Improvement]** - [What changed and what the user gains]

### 🐛 Bug Fixes

<!-- Describe the symptom the user experienced, not the root cause. -->

- [What was broken and is now working]

### ⚠️ Important Notes

<!-- Anything demanding user action: deprecations, dropped platforms, -->
<!-- migrations, behavior changes that could surprise someone.        -->

- **[Notice type]**: [What the user must know or do]

<!-- === FOOTER — write once, at the bottom of the file, below every === -->
<!-- === version block. Delete it entirely if there is no support     === -->
<!-- === channel to point at.                                         === -->

---

Questions? Contact [support address] or visit our [Help Center]([URL]).
