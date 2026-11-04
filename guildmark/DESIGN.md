---
name: GuildMark customer registration subset
description: Observed incumbent tokens and registration primitives; not a global redesign.
colors:
  primary: "#245dd8"
  background: "#ffffff"
  foreground: "#17212b"
  muted: "#f4f6f8"
  muted-foreground: "#65727f"
  primary-foreground: "#ffffff"
  border: "#e1e7ec"
typography:
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  default: "0.375rem"
spacing:
  field-gap: "0.5rem"
  pair-gap: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.default}"
    padding: "0.75rem 1rem"
    height: "3rem"
---

# Design System: GuildMark customer registration subset

## Overview

This records the existing registration implementation, not a new identity or a complete application design system. Evidence: `src/styles/theme.css`, `src/styles/public-site.css` shared light overrides, `src/app/components/Layout.tsx`, `src/app/components/signup/registration.css`, SignupForm, PlatformStory, VerificationPrompt, BusinessBadge, and the two customer pages. GuildMark retains its blue, cool neutrals, proportional typography, and restrained form language. No new creative metaphor is asserted.

## Colors

Primary blue carries account actions, current-stage markers, links, and the badge. Cool background and muted surfaces distinguish the story and email sections. Foreground and muted foreground separate headings from supporting copy. Registration references incumbent custom properties. The frontmatter records the active light registration values from `public-site.css` (`:root:not(.dark)`), which override the base theme; dark mode retains existing theme overrides. These light values were confirmed by the parent’s rendered computed-style inspection.

## Typography

Registration inherits DM Sans from the inline font family on Layout. The base theme’s Inter stack is a fallback context, not the active registration font. The parent’s rendered computed styles confirmed `"DM Sans", sans-serif`. Form headings use a responsive 1.75–2.125rem range, weight 500, and line-height 1.2; story headings use 1.9–2.75rem, weight 500, and line-height 1.12. Supporting body copy uses .9375rem; inputs 1rem; labels .8125rem; hints .75rem. Headings use -.035em tracking. These are surface observations, not an application-wide replacement type ramp.

## Layout

The registration shell is capped at 70rem with .9fr/1.1fr columns, a responsive 2–5rem gap, and top alignment. Paired fields use equal columns. At 800px the shell becomes one column capped at 36rem and the story becomes a compact stage summary. At 420px paired fields stack. Application and status states reuse the shell. Keep route-specific strategy in the surface brief.

## Elevation & Depth

The inspected registration components have no box shadows. Muted fills, hairline borders and whitespace establish grouping. This observation does not prohibit shadows elsewhere in GuildMark. Primary action hover uses brightness(.92) over .15s; reduced-motion mode disables transitions and animations within registration.

## Shapes

Fields, actions, and story/email surfaces reuse the active shared-light corner token; the base theme’s smaller radius is overridden here. Fields have a 1px token border and a minimum 3rem height. Step markers alone use circles to express sequence.

## Components

Primary actions span their form, use the primary tokens, and have a minimum 3rem height. Inputs inherit proportional typography and theme text/background. Keyboard focus uses a 2px ring-token outline offset by 3px. Errors use the existing destructive token. Busy controls disable interaction and reduce opacity. The business badge is an inline blue icon/text signal; it is not a listing-quality claim. The dashboard prompt uses border-separated content and reflows its link at 700px.

## Do's and Don'ts

- **Do** reuse incumbent theme variables and proportional type for additions to these surfaces.
- **Do** retain visible focus, labels, error/status semantics, and reduced-motion behavior.
- **Don't** promote this page's two-column composition into a rule for every GuildMark page.
- **Don't** interpret a badge as certification of transactions, condition, valuation, or compliance.

Not canonized: the theme contains distinct primary and brand-blue families; this scoped extension follows the active shared-light primary without consolidating that pre-existing difference. No unrelated drift was repaired. Source inspection alone is not a finish-review verdict.
