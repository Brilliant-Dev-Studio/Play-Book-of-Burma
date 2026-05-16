# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

There are no tests.

## What this is

**Playbook of Burma** — a Myanmar-focused video/podcast learning platform. Content features founders, CEOs, and experts. Membership is manual-approval: users pay via KBZ Pay or Wave Money, submit a screenshot form, and receive credentials by email. No backend or API layer exists yet; all forms use `action="#"`.

## Architecture

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4

**Routing:** App Router. All routes are under `app/`. The root layout ([app/layout.tsx](app/layout.tsx)) wraps every page with `<SiteHeader>` and `<SiteFooter>`.

**Tailwind v4 — CSS-first config.** There is no `tailwind.config.js`. The design system lives entirely in [app/globals.css](app/globals.css) inside an `@theme inline {}` block. Add new tokens there, not in a config file.

**Design palette** (defined in `globals.css`):
- `coral` — #ec7147 (primary accent, CTAs, active nav)
- `mist` — #ccd3d8
- `butter` — #fecf73
- `wine` — #76220b

**Fonts:**
- `font-sans` → Geist Sans (`--font-geist-sans`)
- `font-mono` → Geist Mono (`--font-geist-mono`)
- `font-roman-wood-slide-title` → Cinzel 600/700 (`--font-rwst-stack`) — used for display headings (e.g. auth card `<h1>`)

**Shared styling primitives:**
- [app/components/membership-form-field-styles.ts](app/components/membership-form-field-styles.ts) — exported Tailwind class strings for inputs, labels, textareas, and file inputs. Used by both the membership payment form and auth pages (login/signup). Add new form styles here.
- [app/components/auth-page-shell.tsx](app/components/auth-page-shell.tsx) — exports `AuthPageShell` (centered card layout), `AuthFieldLabel`, `AuthGoogleButton`, `AuthOrDivider`, `authInputClass`, and `authPrimaryButtonClass`. Login and Signup pages compose from these.

**Remote images:** Only `i.pinimg.com` is allow-listed in `next.config.ts`. Add other domains there before using `next/image` with external URLs.

**`SiteHeader`** is a client component with scroll-aware fixed positioning (hides on scroll-down, shows on scroll-up) and a mobile hamburger menu. Nav items are defined as a `const` array at the top of [app/components/site-header.tsx](app/components/site-header.tsx).
