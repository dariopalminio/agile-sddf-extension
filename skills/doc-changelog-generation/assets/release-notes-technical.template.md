<!-- ------------------------------------------------------------------ -->
<!-- TEMPLATE — RELEASE_NOTES_TECHNICAL.md (deployment manifest)        -->
<!--                                                                    -->
<!-- Strategy: SNAPSHOT / OVERWRITE. This whole file is the repeating   -->
<!-- unit. It always describes the current release only — the one in    -->
<!-- staging or about to ship. Overwrite it on every release; it is not -->
<!-- a cumulative history. History lives in Git tags and in the release -->
<!-- artifacts (see references/technical-release-notes.md).             -->
<!--                                                                    -->
<!-- Two kinds of slot, both of which must be gone from the output:     -->
<!--   BARE CAPS  (VERSION, DATE)  — a value inside format punctuation  -->
<!--   [phrase]                    — a prose slot; replace or delete    -->
<!-- Delete every section and every table row left with no content, and -->
<!-- delete every one of these comments.                                -->
<!--                                                                    -->
<!-- Audience is QA, DevOps/SRE and the release manager. They need to   -->
<!-- know what to verify, what to migrate, and what to sign off.        -->
<!-- ------------------------------------------------------------------ -->

# Release vVERSION

<!-- Literal example: `# Release v2.1.0`. Use the full semver here. -->

**Release Date**: DATE
**Type**: [Major | Minor | Patch] Release
**Compatibility**: Breaking changes: [None | a one-line summary of what breaks]

## Summary

[One or two sentences: what this release delivers and why it is going out]

## Changes

### Features

<!-- One row per shipped feature. ID is the tracker key; PR is the -->
<!-- merge request. Delete the section if the release has none.    -->

| ID | Description | PR |
|----|-------------|-----|
| [TRACKER-ID] | [What the feature does] | [#PR] |

### Fixes

<!-- Severity drives QA's verification order. Use the project's own -->
<!-- scale; Critical/High/Medium/Low if it has none.                -->

| ID | Description | Severity | PR |
|----|-------------|----------|-----|
| [TRACKER-ID] | [What was broken] | [Severity] | [#PR] |

### Dependencies Updated

<!-- Everything DevOps must know changed underneath the application. -->
<!-- Reason matters most when it is a security patch.                -->

| Package | From | To | Reason |
|---------|------|-----|--------|
| [package] | [old version] | [new version] | [why it moved] |

## Migration Guide

<!-- Ordered, runnable steps. If nothing is required, say exactly    -->
<!-- that — an empty section reads as an oversight.                  -->

[Ordered steps to run before or during deployment, or: No migration required for this release.]

## Known Issues

<!-- Shipping with a known defect is a decision. Record it here so   -->
<!-- QA does not reopen it and support can answer for it.            -->

- [Defect that ships with this release, and its workaround if there is one]

## Contributors

[@handles of the people who contributed to this release]
