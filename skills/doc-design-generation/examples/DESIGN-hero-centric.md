---
version: alpha
name: Hero-Centric Design
description: Landing-page design language built around a single full-viewport hero — one headline, one action — with a near-monochrome palette and a single high-contrast accent.
colors:
  primary: "#1A1A1A"
  secondary: "#4A4A4A"
  tertiary: "#0066FF"
  neutral: "#FFFFFF"
typography:
  hero:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
    fontSize: 4rem
    lineHeight: 1.1
    fontWeight: 700
  h1:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
    fontSize: 2.25rem
    lineHeight: 1.2
    fontWeight: 700
  h2:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
    fontSize: 1.5rem
    lineHeight: 1.3
    fontWeight: 700
  body-md:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
    fontSize: 1rem
    lineHeight: 1.6
    fontWeight: 400
  body-sm:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
    fontSize: 0.875rem
    lineHeight: 1.5
    fontWeight: 500
  label-caps:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
    fontSize: 0.75rem
    lineHeight: 1.4
    fontWeight: 500
  mono:
    fontFamily: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 0.875rem
    lineHeight: 1.5
    fontWeight: 400
rounded:
  base: 0.5rem
spacing:
  base: 0.5rem
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.base}"
  button-ghost:
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.base}"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.base}"
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.base}"
---

## Overview

A landing-page design language that compresses the entire pitch into one viewport: a single headline, a single action, and enough type contrast to carry both. Confidence replaces density — one statement instead of five value propositions competing above the fold. The governing tension is weight: a heavy hero asset undermines the format it decorates, so sharp type on a solid background is the default and imagery has to earn its bytes.

## Colors

- **primary:** headlines and body text. It is an off-black, and pure `#000000` is not part of the palette.
- **secondary:** supporting copy, muted labels, and the border on outlined controls.
- **tertiary:** the single accent, and the only fill permitted on a call to action. One accent per screen.
- **neutral:** the page and card surface behind everything else.

## Typography

- **hero:** the headline, and one per page. It scales fluidly between the `h1` size and its `4rem` maximum via `clamp(2.5rem, 5vw, 4rem)`; the frontmatter records the ceiling.
- **h1, h2:** section entry points below the hero.
- **body-md:** running copy, capped at 72 characters per line.
- **body-sm, label-caps:** interactive labels and captions, where the heavier weight and slight tracking keep small text legible.
- **mono:** code, metadata, and technical values only.

## Layout

- CSS Grid is the primary layout system, with content contained at `max-width: 1280px` centered and 1.5rem of side padding.
- Vertical rhythm is built on the 0.5rem base unit; section gaps use `clamp(4rem, 8vw, 8rem)`.
- The hero is split-screen: text left, visual right.
- Feature sections alternate text and image in a zig-zag. Three equal columns are not used.
- Every multi-column layout collapses below 768px, and the page never scrolls horizontally.
- The z-index contract is fixed: base 0, sticky nav 100, overlay 200, modal 300, toast 500.

## Elevation & Depth

Depth is expressed through motion and a light shadow lift rather than stacked surfaces. The frontmatter has no shadow or motion category, so the contract is recorded here:

- **Card resting shadow:** `0 2px 12px rgba(0,0,0,0.06)`, over a 1px border.
- **Hover:** `scale(1.03)` plus a shadow lift over 200ms.
- **Entry:** fade with a 16px translate-Y over 540ms ease-out; lists cascade at 120ms per item.
- **Page transitions:** fade and slide over 300ms.
- **Physics:** spring, stiffness 120, damping 20.

Only `transform` and `opacity` are animated — never a layout-triggering property.

## Shapes

Every surface uses the single `rounded` token: buttons, cards, and inputs share it, so the system has one corner language rather than a radius scale.

## Components

- **button-primary:** accent fill, no outer glow. Hover darkens 8% and lifts; active translates -1px for a tactile press.
- **button-ghost:** outline variant with a 1.5px `secondary` border, filling subtly on hover.
- **card:** neutral surface with a 1px border and the resting shadow above.
- **input:** label above the field, 1px border, and a 2px accent focus ring offset by 2px. Error text sits below the field. Floating labels are not used.
- **navigation:** neutral surface; the active item is marked by an accent indicator and a heavier weight.
- **skeletons:** shimmer matching the final component's dimensions. Circular spinners are not used.
- **empty states:** icon, descriptive text, and an action — never bare text.

## Do's and Don'ts

- Do give the hero the full viewport, with the headline and its action visible above the fold.
- Do keep the call to action high-contrast against the surface behind it.
- Do serve hero imagery in a modern compressed format, and keep text legible over it.
- Do use `min-h-[100dvh]` for full-height sections, never `h-screen`.
- Do not use emoji in the interface; use an icon system.
- Do not use pure `#000000`.
- Do not exceed 80% saturation on an accent.
- Do not build three-column equal-width feature rows; alternate or use an asymmetric grid.
- Do not ship placeholder copy or broken image links in a demo.
