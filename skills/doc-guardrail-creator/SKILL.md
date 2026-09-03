---
name: doc-guardrail-creator
description: >-
  Creates a guardrail Markdown file — one domain, one pass, every rule classified by how it is
  verified: deterministic (tool, rule id, error/warn) or semantic (AI / human review). Use when
  asked to write, draft or update a guardrail, a rules file or the lint gate for a stack, standard
  or framework. Triggers on "create a guardrail", "guardrail for", "doc-guardrail-creator".
---

# Create a guardrail file

Produce one guardrail for one domain. A guardrail is neither a skill nor a policy: a skill teaches
how to build and runs to thousands of lines; a policy governs, with version, owner and change
history. A **guardrail is a single file read in one pass**, holding rules already sorted by *how
they are verified*, and it stays close to ~200 lines. That classification is the whole value of the
artifact — a rule the reader cannot act on mechanically is a rule in the wrong layer.

`assets/guardrail.template.md` is the single definition of the output shape. Read it at run time and
instantiate it. Never write a guardrail from memory and never edit the template during a run.

Nothing in this document enumerates the template's sections, headings or line formats — derive them
by reading the template. Where this document and the template disagree about structure, the template
wins. This document owns the *method*: how arguments resolve, how evidence is gathered, how a rule is
classified, and what must hold before the file is saved.

## Boundaries

- Write exactly one guardrail file. Do not touch source code, configuration, CI, or other guardrails.
- One guardrail covers one domain. If the request spans two unrelated domains, say so and write the
  first, or ask which one — do not merge them into a single file.
- Do not invent rules. Every rule comes from the user's request, a repository document, or a standard
  the user named. If you cannot say where a rule comes from, it is an opinion, not a rule.
- Do not restate general engineering advice ("write clean code", "test thoroughly"). If a line does
  not change what a reader does, delete it.
- Do not cite a tool rule id you have not verified exists in the current version of that tool.
- Do not create the guardrail when the domain is unknown. Ask first.
- Write the file in English, whatever language the conversation uses.

## 1. Resolve the arguments

Every argument is optional. Resolve each one in order, taking the first that applies.

| Argument | Resolution order |
|----------|------------------|
| Guardrail name | The name the user gave → the domain derived from the subject they described → ask |
| Output folder | The path the user gave → an existing `guardrails/` → an existing `docs/guardrails/` → `guardrails/`, created |
| Subject, candidate rules, sources | The user's request → the source-of-truth files or URLs they named → the repository documents in step 2 |
| Template | A template path the user gave → `assets/guardrail.template.md` |

The **name** is the domain in kebab-case, and the file is `<name>-checklist.md` —
`test-cypress-cucumber-checklist.md`, `docker-compose-services-checklist.md`. The suffix is
idempotent: a name that already ends in `-checklist` is used as it is, never suffixed twice. No
`-guardrail` suffix either: the directory already says what these files are.

If the request identifies neither a name nor a subject — "create a guardrail", "write me a rules
file" — stop and ask what the guardrail governs. Write nothing until you have it. A name alone is
enough to proceed; a subject alone is enough to proceed and derive the name from it.

### Existing file

The target whose existence you check is the `<name>-checklist.md` path. If only a legacy `<name>.md`
sits in that folder, report it instead of quietly creating a second file beside it, and ask whether
to rename it or write the new one.

If the target already exists, do not overwrite it. Report the path and offer:

- `(r) Regenerate` — replace the file
- `(n) Do not modify` — stop, change nothing
- `(c) Compare` — show a diff of the proposed content against the current file, then ask again

With `--force`, overwrite directly and emit `[INFO] <path> overwritten with --force`.
With `--update`, keep the existing rules and their ids, apply only the requested change, and leave
the rest of the file untouched.

## 2. Gather the evidence

Collect what the sections need before opening the template. Ask only for what you cannot find.

| Needed | Where to look first |
|--------|---------------------|
| Scope, and the exclusion that prevents misuse | The user's request |
| Candidate rules | The user's request; the source-of-truth files they named |
| The tool that decides each rule | The repo's linter and CI configuration; the tool's published ruleset |
| Domain vocabulary and layout | Existing specs, `skills/`, sibling guardrails |
| The authoritative expansion this file summarises | The skill, standard or URL the user named |

Read every source-of-truth file the user names. If one **does not exist**, report it — do not
silently continue and never attribute an invented rule to it:

> ⚠️ Source of truth not found: `<path>`.
> Do you want me to continue with the rules in your request alone, or give me the correct path?

Recurrence in code is not evidence of intent. Do not promote a habit you observed in the repository
into a rule.

## 3. Read the template and derive its structure

Read `assets/guardrail.template.md` from this skill's directory and copy it as the base of the
output. If the user named a different template path, read that one instead — it replaces the
default for the whole run. Everything below operates on that copy.

Before filling anything, derive the inventory from the copy — never from this document:

- **Sections and headings** — their order and exact wording. They are the contract every guardrail
  shares; keep them verbatim.
- **Paragraphs marked to be kept verbatim** — copy them character for character. The on-breach
  paragraph is what turns a severity marker into an instruction; without it the file is a checklist,
  not a guardrail.
- **Line formats** — the template states the mandatory shape of a rule line in each layer. Follow it
  exactly; it is what makes the file greppable.
- **Placeholders** — every bracketed slot awaiting a value.
- **Instructional HTML comments** — guidance for you, never part of the output.

If the template cannot be read, stop and report it. Do not reconstruct it from this document.

## 4. Classify every rule by verifiability

The axis is **verifiability, not severity**. Apply one test to each candidate rule:

> Can you name the command that fails when this rule is broken?
> **Yes** → deterministic, and cite that command. **No** → semantic.

- **Deterministic** — a tool returns a binary, reproducible verdict; it runs in CI. State the rule
  positively, then cite the tool and its rule id and a severity. If the rule id is your own
  `no-restricted-syntax` entry or equivalent, put it as the message prefix so it appears verbatim in
  the tool output and stays greppable.
- **Semantic** — the rule needs judgement about meaning: intent, coverage, domain language, naming,
  sensitive data. Write it as prose, with **no rule id and no severity** — there is no tool to report
  it, so a severity marker would be a lie.

`(error)` and `(warn)` exist **only** in the deterministic layer. They are the reporting tool's
vocabulary, not a ranking of importance: the most serious rule in the document is often a semantic
one. `(error)` blocks delivery, `(warn)` does not.

**Split each concern across both layers.** Presence is usually deterministic, correctness usually
semantic — "every scenario carries a run-level tag" is grep; "the tag matches the scenario's real
scope" is review. A concern that lands wholly in one layer is worth a second look.

Group the deterministic rules into themed subsections of 4–8 rules. A group past ~10 is two groups.
Where a sibling guardrail holds the opposite rule, add a short note saying so, so nobody carries it
over by inertia.

## 5. Fill the sections

- **Scope**: what it applies to and what it explicitly does not. No introduction paragraph — the
  reader is here for the rules.
- **Rules**: as classified in step 4, in the template's line format.
- **Minimum structure**: the least that must exist to comply — a tree and at most two or three short
  snippets, chosen by error density: the fragment where breaches concentrate. No full templates, no
  CI pipelines, no advanced cases. Their absence is what keeps the file light.
- **Validation commands**: they must run as written, copyable without editing. If a published ruleset
  covers the rules, cite and link it. If it does not exist, define the config here in full — it is
  the only thing that makes the deterministic layer operational.
- **Source of truth**: name the authoritative expansion and say which side wins on disagreement. If
  this guardrail *is* the norm and summarises nothing, delete the section rather than inventing a
  source.

Before you cite a published rule, verify it for real rather than from memory: the rule exists in the
current version of the plugin; a preset you cite actually enables the rules you require (a
"recommended" preset usually enables far less than its name suggests — declare the rest explicitly);
and you state the tool's minimum version.

## 6. Prune and clean

Delete every section the domain does not support — an empty section is worse than an absent one —
except the two the artifact is defined by: the rules section, and the section that states the
on-breach action. A file with no non-negotiable rule is not a guardrail; if the request truly has
none, say so and ask.

Then remove every instructional HTML comment inherited from the template, including any inside
fenced code blocks. They are notes to the author, never output.

## 7. Validate before saving

Re-scan the finished output against this list. Fix and re-check; do not save a file that fails.

- No placeholder remains: no bracketed slot, no `TODO`, no unresolved literal.
- No HTML comment inherited from the template remains anywhere, including inside code blocks.
- Every heading the template gives a retained section is present, verbatim.
- Every paragraph the template marks verbatim is character-for-character identical.
- Every deterministic rule cites a tool and a rule id and carries exactly one of `(error)` / `(warn)`.
- No semantic rule carries a rule id or a severity marker.
- Every tool named in a rule appears in the validation commands, and every command runs as written.
- No rule is unsourced — each traces to the request, a repository document, or a named standard.
- Deterministic groups hold 4–8 rules each.
- The file is close to ~200 lines. Well past it means content belongs in the skill, not here.
- The file name is `<domain>-checklist.md` in kebab-case, with the suffix present exactly once, and the title names the same domain.

## 8. Report

Return:

- the created or updated path
- the domain the guardrail binds and the exclusion it declares
- the rule count per layer, and the `(error)` / `(warn)` split
- the sections dropped and why
- anything the user must decide — a rule you could not source, a tool id you could not verify, a
  source-of-truth file that was missing

## Flags

| Flag | Behavior |
|------|----------|
| `--dry-run` | Report the target path and the rules classified into each layer. Write nothing. |
| `--force` | Overwrite an existing guardrail without asking. |
| `--update` | Amend an existing guardrail in place, preserving its rules and their ids. |
| `--interactive` | Confirm the name, path and rule set before writing (default when the request is vague). |

## References

| Topic | Reference | Load when |
|-------|-----------|-----------|
| Output template | `assets/guardrail.template.md` | Required. Read before writing any guardrail. It is the sole source of the output's structure — section order, headings, verbatim paragraphs, rule line formats — and this document never enumerates it. |
| Worked example | `examples/security-checklist.md` | Comparing against a completed guardrail — both layers filled, every deterministic rule backed by a command defined in the file itself. Reference shape only, never a source of rules. |
| Test cases | `evals/evals.json` | Verifying a change to this skill did not regress its behavior. |
