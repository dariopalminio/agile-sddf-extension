<!-- ------------------------------------------------------------------ -->
<!-- GUARDRAIL TEMPLATE                                                 -->
<!--                                                                    -->
<!-- How to use:                                                        -->
<!-- 1. Copy this file to guardrails/<domain>-checklist.md (kebab-case). -->
<!-- 2. Fill in the [placeholders]. Delete sections that do not apply.   -->
<!-- 3. Delete ALL of these comments before publishing.                  -->
<!--                                                                    -->
<!-- A guardrail is neither a skill nor a policy:                        -->
<!--   skill     = teaches how to BUILD. Thousands of lines, loaded      -->
<!--               on demand.                                            -->
<!--   policy    = governance. Version, status, owner, change history.   -->
<!--   guardrail = one file, one pass, rules already classified by       -->
<!--               HOW THEY ARE VERIFIED. Target: ~200 lines.            -->
<!--                                                                    -->
<!-- Keep the section headings exactly as written below: they are the    -->
<!-- contract every guardrail in this repo shares. English only — see    -->
<!-- the Language section of AGENTS.md.                                  -->
<!-- ------------------------------------------------------------------ -->

# Guardrail: [Domain or standard] [version, if any]

<!-- One or two lines: what it applies to and, where it prevents misuse, -->
<!-- what it does NOT apply to. No introduction paragraph: the reader is  -->
<!-- here for the rules.                                                 -->

Applies to [concrete scope]. Does not apply to [exclusion that prevents misuse].

## Mandatory rules

<!-- Keep this paragraph verbatim. Severity alone is linter vocabulary — -->
<!-- an agent reading "(error)" does not know whether to stop the task or -->
<!-- merely note it. This line is what turns a severity marker into an    -->
<!-- instruction, and it is the one thing a governance policy does better -->
<!-- than a bare rule list. Without it the document is a checklist, not a -->
<!-- guardrail.                                                          -->

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

<!-- ================================================================== -->
<!-- THE AXIS IS VERIFIABILITY, NOT SEVERITY.                           -->
<!--                                                                    -->
<!--   Deterministic = a tool returns a binary, reproducible verdict.    -->
<!--                   Runs in CI.                                       -->
<!--   Semantic      = requires judgement about meaning. No tool can     -->
<!--                   decide it. Reviewed on the PR.                    -->
<!--                                                                    -->
<!-- TEST FOR CLASSIFYING a new rule:                                    -->
<!--   Can you name the command that fails when it is broken?            -->
<!--     Yes -> deterministic, and CITE that command.                    -->
<!--     No  -> semantic.                                                -->
<!--                                                                    -->
<!-- error/warn exists ONLY in the deterministic layer: it is the        -->
<!-- reporting tool's vocabulary, NOT a ranking of importance. The most  -->
<!-- serious rule in the document may well be a semantic one.            -->
<!--                                                                    -->
<!-- DO NOT INVENT RULES. Every rule must come from an authoritative     -->
<!-- source (the skill, a standard, a written team decision). If you     -->
<!-- cannot cite where it comes from, it is not a rule — it is an        -->
<!-- opinion.                                                            -->
<!-- ================================================================== -->

### Deterministic rules ([tools — e.g. Spectral / ESLint / tsc])

<!-- MANDATORY line format:                                              -->
<!--   - [ ] <rule> — <tool>: `<rule-id>` (error|warn)                   -->
<!--                                                                    -->
<!-- If the rule-id is your own no-restricted-syntax entry (or           -->
<!-- equivalent), put it as the MESSAGE PREFIX so it appears verbatim in -->
<!-- the linter output and stays greppable.                              -->
<!--                                                                    -->
<!-- Group rules into themed subsections of 4-8. If a group grows past   -->
<!-- ~10, it is probably two groups.                                     -->

#### [Group 1 — e.g. Base structure]

- [ ] [Verifiable rule, stated positively] — [Tool]: `[rule-id]` (error)
- [ ] [Verifiable rule] — [Tool]: `[rule-id]` (warn)

#### [Group 2 — e.g. Configuration & secrets]

- [ ] [Verifiable rule] — grep (error)
- [ ] [Generated artefacts and credentials are git-ignored] — `git check-ignore` (error)

<!-- OPTIONAL clarifying note. Use it when a sibling guardrail holds the  -->
<!-- opposite rule, so nobody carries it over by inertia.                -->
<!-- Real example from the Cypress guardrail:                            -->
<!--   > Arrow functions ARE correct in Cypress step definitions: there  -->
<!--   > is no this-bound World. Do not carry over the opposite rule.    -->

---

### Semantic rules (AI / human review)

<!-- Prose. NO rule-id and NO severity: there is no tool to report them.  -->
<!--                                                                    -->
<!-- This is where intent, domain language, coverage, meaning-based       -->
<!-- naming and sensitive data belong.                                   -->
<!--                                                                    -->
<!-- DESIGN TRICK: one concern usually splits across both layers.        -->
<!-- PRESENCE is deterministic, CORRECTNESS is semantic.                 -->
<!--   deterministic: "every scenario carries a run-level tag" (grep)    -->
<!--   semantic:      "the tag matches the scenario's real scope"        -->

- [ ] [Rule requiring judgement about meaning].
- [ ] [Rule about coverage or intent].
- [ ] [No credentials or personal data are committed in [artefacts]].

## Minimum expected structure

<!-- The minimum that must exist to comply: a tree and at most 2-3 SHORT -->
<!-- snippets chosen by error density — the fragment where the most      -->
<!-- breaches concentrate.                                               -->
<!--                                                                    -->
<!-- Do NOT include full templates, CI pipelines or advanced cases: that -->
<!-- lives in the skill, and their absence is what keeps the guardrail    -->
<!-- light.                                                              -->

```[yaml|typescript|json]
[minimum structure or canonical snippet]
```

## How to run the validation

<!-- Commands that run as written, copyable without editing.             -->
<!--                                                                    -->
<!-- If a published ruleset exists, cite and link it.                    -->
<!-- If it does NOT exist, DEFINE it here (the full config block): it is  -->
<!-- the only thing that makes the deterministic layer operational.      -->

```bash
[command 1]            # what it checks
[command 2]

# grep-level checks
[grep / git check-ignore / node -e "…"]
```

<!-- ================================================================== -->
<!-- BEFORE PUBLISHING, VERIFY FOR REAL — not by inspection:            -->
<!--                                                                    -->
<!-- 1. Do the published rules you cite EXIST in the current version of  -->
<!--    the plugin/ruleset? Check it, do not recall it.                  -->
<!-- 2. If you cite a preset, does it actually enable the rules you      -->
<!--    require? A "recommended" preset usually enables far less than    -->
<!--    its name suggests. Declare whatever it leaves out explicitly.    -->
<!-- 3. Run the config against TWO fixtures:                             -->
<!--      - one with a violation per rule -> all of them must fire;      -->
<!--      - the canonical snippet from THIS document -> must report 0.   -->
<!--    If the canonical one fails, two of your rules contradict.        -->
<!-- 4. Check the tool's minimum version and state it.                   -->
<!-- ================================================================== -->

## Verification

| Level | Action |
|-------|--------|
| Deterministic | [The commands above finish with zero errors.] |
| Semantic | [Review the semantic checklist against the diff (AI or human) and attach the result to the PR.] |

## Source of truth

<!-- A guardrail SUMMARISES. Name the authoritative source and say which -->
<!-- one wins on disagreement. If this guardrail IS the norm itself and   -->
<!-- summarises nothing, delete the whole section rather than inventing   -->
<!-- a source.                                                           -->

This guardrail **summarises** [scope]. The authoritative expansion — [what is left
out: setup, templates, CI, advanced cases] — lives in [path or URL]. Where this
file and [source] disagree, [source] prevails.

<!-- Optional, when the guardrail belongs to a family:                   -->
<!-- See also: [guardrails/[family]/README.md](README.md) — two-layer     -->
<!-- validation model.                                                   -->
