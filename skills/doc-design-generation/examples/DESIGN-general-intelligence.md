---
version: alpha
name: General Intelligence Company
description: "Editorial, almost literary product surface — a warm off-white canvas interrupted by hand-painted atmospheric illustrations, with a custom display serif carrying the brand voice and a quiet custom sans handling everything utilitarian. Color is nearly absent: one blue, used as a border."

colors:
  parchment: "#fefffc"
  paper: "#ffffff"
  linen: "#f9faf7"
  ink-black: "#171717"
  graphite: "#2c2c2c"
  charcoal: "#444141"
  ash: "#646464"
  fog: "#b4b8b4"
  mist: "#dee2de"
  twilight: "#282834"
  dusk: "#1f1f29"
  signal-blue: "#41a1cf"
  cerulean: "#0081c0"

typography:
  caption:
    fontFamily: af, Inter, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 13px
    lineHeight: 1.3
    letterSpacing: -0.13px
    fontWeight: 500
  body-sm:
    fontFamily: af, Inter, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 15px
    lineHeight: 1
    letterSpacing: -0.15px
    fontWeight: 500
  body:
    fontFamily: af, Inter, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 16px
    lineHeight: 1.5
    letterSpacing: -0.16px
    fontWeight: 400
  subheading:
    fontFamily: af, Inter, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 18px
    lineHeight: 1.3
    letterSpacing: -0.18px
    fontWeight: 500
  heading-sm:
    fontFamily: ppmondwest, Fraunces, Recoleta, GT Sectra, serif
    fontSize: 27px
    lineHeight: 1.5
    letterSpacing: -1.08px
    fontWeight: 400
    fontFeature: '"liga" 0'
  heading:
    fontFamily: ppmondwest, Fraunces, Recoleta, GT Sectra, serif
    fontSize: 40px
    lineHeight: 1.1
    letterSpacing: -0.8px
    fontWeight: 400
    fontFeature: '"liga" 0'
  heading-lg:
    fontFamily: ppmondwest, Fraunces, Recoleta, GT Sectra, serif
    fontSize: 48px
    lineHeight: 1.1
    letterSpacing: -0.96px
    fontWeight: 400
    fontFeature: '"liga" 0'
  display:
    fontFamily: ppmondwest, Fraunces, Recoleta, GT Sectra, serif
    fontSize: 54px
    lineHeight: 1.1
    letterSpacing: -1.08px
    fontWeight: 400
    fontFeature: '"liga" 0'

rounded:
  flat: 0px
  button: 8px
  card: 12px
  card-lg: 16px
  surface: 24px
  pill: 50px

spacing:
  "4": 4px
  "8": 8px
  "12": 12px
  "16": 16px
  "20": 20px
  "24": 24px
  "32": 32px
  "40": 40px
  "48": 48px
  "64": 64px
  "80": 80px

components:
  nav:
    textColor: "{colors.twilight}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "{spacing.8} {spacing.16}"
  button-primary:
    textColor: "{colors.signal-blue}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.button}"
    padding: "5px {spacing.12}"
  button-secondary:
    textColor: "{colors.twilight}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.button}"
    padding: "5px {spacing.12}"
  button-filled:
    backgroundColor: "{colors.dusk}"
    textColor: "{colors.paper}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.button}"
    padding: "{spacing.8} {spacing.16}"
  link-ghost:
    textColor: "{colors.charcoal}"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.charcoal}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "{spacing.16}"
  card-hero:
    textColor: "{colors.paper}"
    typography: "{typography.heading-lg}"
    rounded: "{rounded.surface}"
    padding: "{spacing.80}"
  card-diagram:
    rounded: "{rounded.card-lg}"
    padding: "{spacing.12}"
  card-atmospheric:
    backgroundColor: "{colors.cerulean}"
    textColor: "{colors.paper}"
    rounded: "{rounded.surface}"
    padding: "{spacing.80}"
  input:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.charcoal}"
    typography: "{typography.body}"
    rounded: "{rounded.flat}"
---

## Overview

General Intelligence Company reads as a literary journal beside a bonfire. Hand-painted atmospheric illustrations carry the emotional register, while the working interface lives on clean white between those scenes. Typography, not color, is the brand: the display serif speaks in a low, measured voice and the sans stays out of the way. Restraint is the governing decision — one accent, hairline borders, and no decorative depth.

## Colors

- **parchment:** the page canvas. It is warmer than pure white and gives the site its book-page register; never substitute `#ffffff` for it at page level.
- **paper:** elevated surfaces only — cards, footer, and the white content sections that sit between illustrations.
- **linen:** input fills and barely-perceptible surface separation. It carries no border of its own.
- **ink-black, graphite, charcoal, ash:** the text ramp, darkest to lightest. `graphite` takes headlines, `charcoal` is the workhorse for body and UI labels, `ash` marks helper and descriptive copy.
- **fog, mist:** the border ramp. `mist` is the signature hairline on cards, buttons, and dividers; its green tint is what harmonizes the UI with the illustrations. `fog` is reserved for disabled states.
- **twilight, dusk:** the near-blacks with cool undertone. `twilight` draws nav borders, icon strokes, and outlined actions; `dusk` fills the single filled button variant.
- **signal-blue:** the accent, and a border color only — outlined actions and linked labels. It is never a fill.
- **cerulean:** the lone saturated surface, used as atmospheric punctuation on a full-bleed card. Never text, never a border.

## Typography

- **display, heading-lg, heading, heading-sm:** the serif register. Every heading at 27px and above uses it, always at weight 400 — the face does the work, and heavier weights break the literary voice. Ligatures stay disabled.
- **subheading, body, body-sm, caption:** the sans register, covering all UI, navigation, buttons, and running copy. Weight 500 is the default for interactive and label text; weight 400 for body.
- Never set display text in the sans, and never set UI labels in the serif.
- The line-height contrast is deliberate: display registers stay at 1.1, body at 1.5.

## Layout

- Full-bleed illustrated sections alternate with clean white content sections in a vertical rhythm; one idea per screen.
- Content sections are centered at `max-width: 1200px`, with 64–96px of vertical breathing room between them and 32–64px between subordinate blocks.
- The hero is a 100vh painted illustration with the navigation pill floating at top-center and a glass overlay card at bottom-left carrying the headline and CTA.
- Diagram sections use a 6+6 split: explanatory text and caption left, line-art diagram in a bordered card right.
- Navigation is a single floating pill. There is no sidebar and no mega-menu.

## Elevation & Depth

Depth comes from hairline borders and backdrop-blur, not from stacked shadows. The frontmatter has no shadow category, so the four surface levels are recorded here:

- **Navigation pill:** `rgba(0, 0, 0, 0.15) 0px 2px 6px 0px`, over `backdrop-blur(9–20px)`.
- **Content card:** `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px`.
- **Diagram card:** `rgba(0, 0, 0, 0.05) 0px 1px 8px 0px`.
- **Atmospheric card:** `rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 5px`.

Buttons carry no shadow at any state; they are defined by their border.

## Shapes

The radius scale is assigned by element, not by size step. Buttons take `button`, content cards `card` or `card-lg`, full-bleed and hero surfaces `surface`, and the navigation `pill`. Inputs are the one flat-edged element in the system — they are defined by their fill and a single bottom rule. Do not mix the smallest and largest steps on the same surface.

## Components

- **nav:** floating pill at top center, translucent fill over `backdrop-blur`, 1px border in `twilight` or white. The blur is what lets the illustrated hero read through it.
- **button-primary:** transparent, with the `signal-blue` border and label. The chromatic border *is* the button — no fill, no shadow. An arrow sits in a circle at the right edge.
- **button-secondary:** the neutral cousin, identical geometry with a `twilight` border and label. Used when a second action appears beside the primary.
- **button-filled:** the only filled button in the system, reserved for the footer and high-emphasis contexts.
- **link-ghost:** no background, no border, frequently trailing an arrow. The default for inline and tertiary navigation.
- **card:** `paper` fill with the `mist` hairline and a soft shadow. The green-tinted edge is the signature treatment; padding drops to zero for media cards.
- **card-hero:** overlays the illustrated hero with a translucent fill and `backdrop-blur`. Text color follows the illustration beneath it.
- **card-atmospheric:** full-bleed illustrated or `cerulean` section — the only place color is allowed to exist at surface scale.
- **card-diagram:** translucent white frame around line-art explanations. Diagrams always sit inside it.
- **input:** flat edges, `linen` fill, and a bottom rule only — no top or side borders, for a paper-form feel.

## Do's and Don'ts

- Do use the serif for any heading at 27px and above, always at weight 400.
- Do use the 1px `mist` hairline for all card and section borders.
- Do keep `signal-blue` as a border-only accent; the system has no filled chromatic buttons.
- Do let the canvas stay `parchment`, not pure white.
- Do pair display registers with line-height 1.1 and body with 1.5.
- Do not use `#000000` for text — the ramp starts at `ink-black`.
- Do not apply a box-shadow to buttons; borders and blur express state instead.
- Do not introduce new accent colors; the palette is deliberately near-neutral with one blue.
- Do not set the serif above weight 500 — its personality is in the thin strokes.
- Do not use transparency on body text; text colors are solid.
- Do not exceed the `surface` radius except on the navigation pill.
- Do not fill any element with `signal-blue` or `cerulean` where a border or surface role is intended.

## Imagery

Illustrations are hand-painted and painterly, not flat vector: visible brush texture, atmospheric depth, cinematic grading — cool blues for night scenes, warm greens for fields. They sit full-bleed or at the `surface` radius against the canvas, and they carry the emotional narrative that the UI deliberately does not. No photography, no product screenshots, no abstract 3D. Icons stay minimal: a sun-over-landscape glyph in the navigation, simple line arrows in buttons.
