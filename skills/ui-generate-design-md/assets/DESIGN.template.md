<!--
DESIGN.md TEMPLATE — skills/ui-generate-design-md/assets/DESIGN.template.md

This file is the single definition of the DESIGN.md output shape. Copy it, then:
  1. Replace every <PLACEHOLDER> with normalized evidence.
  2. Uncomment ONLY the frontmatter categories and prose sections a governing source supports.
  3. Delete every commented-out category and section that stays unsupported.
  4. Delete every HTML comment in this template, including this block and the closing checklist.
  5. Run the closing checklist before saving.

Do not edit this template while generating a document. Do not invent a competing schema.
-->
---
version: alpha
name: <PRODUCT_NAME>
description: <ONE_SENTENCE_PURPOSE>
# Only `name` is required. Add a category below only when a governing source already
# defines that named system or contract. Never create token names to organize
# implementation values. Token references use {path.to.token}.
#
# colors:                        # flat mapping; every key must match ^[a-zA-Z0-9][a-zA-Z0-9-]*$
#   <TOKEN_NAME>: "<CSS_COLOR>"  # hex, rgb(), oklch(), or named CSS color
#   # valid:   background-primary, foreground-secondary, border-muted
#   # invalid: background.primary (nested), background_primary (underscore)
#
# typography:                    # mapping of NAMED SCALES; never a scalar
#   <SCALE_NAME>:                # only these fields: fontFamily, fontSize, lineHeight,
#     fontFamily: <FONT_NAME>    # fontWeight, letterSpacing, fontFeature, fontVariation
#     fontSize: <DIMENSION>
#     lineHeight: <DIMENSION>
#     fontWeight: <NUMBER>
#   # valid:   typography.mono.fontFamily: Geist Mono
#   # invalid: typography.mono: Geist Mono          (scalar child)
#   # invalid: typography.sans.family: Geist        (non-canonical field)
#   # invalid: font-family: { mono: ... }           (copied source nesting)
#
# rounded:                       # flat mapping of dimensions
#   <SCALE_LEVEL>: <DIMENSION>
#   # When the governing source defines one group-level token such as --radius,
#   # normalize it to `base` and stop. Otherwise preserve the source token names.
#   # valid:   rounded.base: 0.625rem
#   # invalid: rounded.radius, or sm/md/lg/xl derived from utility classes
#
# spacing:                       # flat mapping of dimensions or numbers
#   <SCALE_LEVEL>: <DIMENSION>
#
# components:                    # only these properties: backgroundColor, textColor,
#   <COMPONENT_NAME>:            # typography, rounded, padding, size, height, width
#     backgroundColor: "{colors.<TOKEN_NAME>}"
#   # May reference canonical token paths; may not introduce a second token schema.
#
# omitted:                       # declared omissions, when the installed spec supports it
#   - <SECTION_OR_CATEGORY>
---

<!--
Sections below are canonical and ORDERED. Keep only the supported ones, in this order.
Never reorder, duplicate, or add a section merely because it exists in the format.
Add an unknown section only when supported guidance fits no standard section.

Markdown records design intent and application guidance. Exact normative values belong in the
frontmatter whenever a category can represent them; what the schema cannot express — shadows,
container widths, motion timings, z-index contracts, alternate-theme values — is stated in prose
inside its canonical section. Outside the Overview, every sentence must change an implementation
choice.
-->

## Overview

<PRODUCT_PURPOSE_AND_EVIDENCED_DESIGN_DIRECTION>

<!--
Rule: state only the product's purpose and its evidenced design direction.
Do not summarize pages, components, tokens, or implementation.
Do not invent brand personality, audience, or emotional rationale.
Repository mode: requires explicit product intent or a design reference.
URL mode: state only the site's observable purpose and presentation, and identify the
document as a reconstructed draft.
-->

## Colors

- **<TOKEN_NAME>:** <ROLE_AND_APPLICATION_RULE>

<!--
Rule: rationale and application guidance only — which role each token plays and when to
reach for it. Exact values stay in the frontmatter. Omit the section when no color token
survived the evidence gates.
-->

## Themes

| Token | <DEFAULT_THEME_NAME> | <ALTERNATE_THEME_NAME> |
|-------|----------------------|------------------------|
| <TOKEN_NAME> | <DEFAULT_VALUE> | <ALTERNATE_VALUE> |

<!--
Rule: FALLBACK SECTION ONLY. Include it solely when `npx @google/design.md spec` shows the
installed specification cannot represent `themes` / `default-theme`. In that case put the
default-theme value under each canonical semantic token in the frontmatter and preserve the
exact alternate-theme values here.
Never create parallel -light / -dark token names, discard alternate-theme values, or use
unreleased syntax. This table is documentation only; it does not make the frontmatter
theme-aware. When the installed spec IS theme-aware, delete this section and use its syntax.
-->

## Typography

- **<SCALE_NAME>:** <ROLE_AND_APPLICATION_RULE>

<!--
Rule: which scale governs which role, and the constraints on applying it. No font stacks,
sizes, or weights here — those live in the frontmatter.
-->

## Layout

- **<LAYOUT_RULE>**

<!--
Rule: grid, containment, spacing rhythm, and responsive collapse rules that a governing
source establishes. Repository mode requires explicit guidance or a shared owner used by at
least two audited surfaces; URL mode requires the pattern to recur across at least two
sampled templates, otherwise scope the rule to the inspected page.
-->

## Elevation & Depth

<ELEVATION_STRATEGY>

<!--
Rule: how hierarchy is expressed — shadow, tonal layering, borders, or motion. The frontmatter
has no shadow category, so exact shadow values belong here when they are the only way to state
the contract. Keep them tied to a named surface role; do not list one shadow per component.
-->

## Shapes

<CORNER_RADIUS_STRATEGY>

<!--
Rule: how the radius scale is applied across surfaces. Reference the `rounded` tokens; do
not restate their values.
-->

## Components

- **<COMPONENT_NAME>:** <SURFACE_OR_INTERACTION_CONTRACT>

<!--
Rule: include a component only when the same surface or interaction treatment recurs across
the audited surfaces (URL mode: at least two sampled pages) AND it changes a concrete
implementation choice. Delete component inventories and prose that only restates the
frontmatter.
-->

## Do's and Don'ts

- Do <APPLICATION_RULE>
- No <EXPLICIT_PROHIBITION>

<!--
Rule: include a Don't only when a governing source states an explicit prohibition. Never
promote a visual preference or an accidental implementation pattern into a prohibition.
-->

<!--
CHECKLIST — run before saving, then delete this block.

Delete from the document:
- any YAML token not already named by a governing source
- any page-local behavior presented as a product-wide rule
- any implementation pattern that conflicts with explicit guidance
- any prohibition not explicitly stated
- any exact value that a frontmatter category can represent — color, typography, rounded,
  spacing, component token — when it sits in the Markdown body instead
- any component configuration, token inventory, source syntax, or documentation methodology
  in the Markdown body
- any citation, audit note, rejected candidate, conflict, or unresolved question
- any sentence that does not change the resulting DESIGN.md
- every HTML comment inherited from this template
- every unresolved <PLACEHOLDER>
- every category or section left commented out

Verify:
- no `typography` child is a scalar, and every field is canonical
- `rounded` contains no key absent from the governing source
- every token name matches ^[a-zA-Z0-9][a-zA-Z0-9-]*$
- sections appear in canonical order, none duplicated
- accepted decisions from a previous DESIGN.md are preserved unless replaced by the user or
  by current governing evidence
-->
