# {skill-name}

<!-- A skill README documents the skill for humans.
     Documentation for the agent lives in SKILL.md.
     This file answers: what does it do?, when to use it?, how to invoke it? -->

> **Type:** skill · **Category:** {orchestrator | worker | utility | guardrail}  
> **Location:** `.claude/skills/{skill-name}/SKILL.md`  
> **Status:** {stable | beta | experimental}

---

## What it does

<!-- Description in 1-3 sentences. Start with a third-person verb:
     "Generates...", "Validates...", "Orchestrates...". Avoid empty adjectives
     like "powerful" or "flexible". State exactly what it produces or changes. -->

{Concise description of the skill.}

**Produces:**
- {Artifact 1 it generates}
- {Artifact 2 it modifies}
- {State it updates}

**Does not do:**
- {What a reader might assume but the skill does NOT cover}

---

## When to use

<!-- Legitimate use cases + trigger phrases that activate the skill.
     Helps the user decide if this skill is the right one
     or if they should use another. -->

**Use it when:**
- {Situation 1}
- {Situation 2}
- The user mentions: `"{trigger phrase 1}"`, `"{trigger phrase 2}"`, `"{trigger phrase 3}"`.

**Do NOT use it when:**
- {Contraindication 1} → use `[[other-skill]]` instead.
- {Contraindication 2} → use `[[other-skill]]` instead.

---

## Installation

<!-- How the skill is installed. 
    If it's part of the SDDF core, indicate the minimum version. 
    If it's from the extension, indicate the repo. 
    If it's only skill, indicate how to install it. -->

Example for installing if it's part of the SDDF core:
**Core (included in `agile-sddf`):**
```bash
npm install -g agile-sddf@^{version}
```
Example for installing from the extension: 
```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-guardrail-generation
```
