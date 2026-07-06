# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Production website for **clc-ufa.ru** — a laser-cutting / UV-printing / engraving / CNC-milling business in Ufa, Russia. All UI copy is Russian. Next.js 14 App Router, TypeScript (strict), Tailwind. Live in production; `git push` to `main` auto-deploys (see Deploy).

## Commands

```bash
npm run dev          # dev server on :3000 (runs gen-portfolio first via predev)
npm run build        # production build, output: 'standalone' (runs gen-portfolio via prebuild)
npm run start        # serve the production build
npm run lint         # next lint (ESLint)
npm test             # node:test suites under tests/*.test.ts (via tsx)
npx tsc --noEmit     # type check
npm run gen:portfolio    # regenerate data/portfolio.generated.ts from disk
```

Run a single test: `node --import tsx --test tests/wb-cdn.test.ts`

CI (`.github/workflows/deploy.yml`) runs `npm ci → tsc --noEmit → next lint → npm test → next build` on every push, gating deploy. **Before committing, run the same four locally.** Always set `PUPPETEER_SKIP_DOWNLOAD=true` in CI-like contexts — puppeteer is a devDep and must not fetch Chrome on the server.

**Local `next build` may hang forever on this machine.** The `/fonts` page (`lib/fonts-preview.ts`) pulls dozens of Google Fonts via `next/font/google`, which downloads them at build time; `fonts.gstatic.com` is unreachable from here (endless `socket hang up` retries), so the build never finishes locally. Don't wait it out — rely on tsc/lint/test locally and let CI do the build (deploy only happens on green). A real fix would be self-hosting the preview fonts via `next/font/local`.

### Screenshots (design verification)

Local-only tooling for visual QA — see the design rules below. `node serve.mjs` serves the root; `node screenshot.mjs <url> [label]` saves auto-incremented PNGs to `./temporary screenshots/`. These are dev tools, not deployed.

## Architecture

**Content is data-driven.** Pages are thin; the substance lives in `data/*.ts` (`services`, `products`, `shop`, `blog`, `cases`, `faq`, `reviews`, `seo-pages`, `contacts`). Dynamic routes map a slug/id to a record — e.g. `app/services/[slug]`, `app/products/[id]`, `app/blog/[slug]`, `app/portfolio/[category]`, and the root catch-all `app/[slug]` (driven by `data/seo-pages.ts`). To add/change content, edit the data file, not just the page.

**Root `app/[slug]` is a catch-all and shadows root-level routes.** A new file like `app/foo.xml/route.ts` will 404 because the catch-all wins. Put route handlers under a non-catch-all parent (that's why the image sitemap lives at `app/sitemaps/images.xml/route.ts`, not the root).

**Portfolio is filesystem-driven.** `scripts/gen-portfolio.mjs` scans `public/images/portfolio/` for `<prefix>-NNN.ext` files, groups by prefix, and writes `data/portfolio.generated.ts` (committed). It runs automatically on `predev`/`prebuild`. `data/portfolio.ts` derives all items/categories from that manifest — the **only** hand-maintained part is `CATEGORY_META` (category order + Russian labels). Dropping a photo file into the folder or deleting one is enough; do not hardcode counts or filenames. Regenerate with `npm run gen:portfolio` after touching the folder outside a dev/build run.

**SEO / structured data is centralized in `lib/seo.ts`.** Shared JSON-LD builders (`localBusinessRef`, `aggregateRating`/`reviewLd` from `data/reviews.ts`, `offerCatalog` from `data/services.ts`, `breadcrumbLd()`, `SITE` constant) feed `<JsonLd>` (`components/JsonLd.tsx`) across pages. `app/layout.tsx` emits the root LocalBusiness + WebSite schema. The site is tuned for GEO/AI crawlers: `app/robots.ts` allowlists AI bots, `public/llms.txt` is a machine index, sitemaps are split (`app/sitemap.ts` + `app/sitemaps/images.xml`). When adding a page type, wire its schema through `lib/seo.ts` rather than inlining ad-hoc JSON-LD.

**Analytics load unconditionally; the cookie banner is informational.** Yandex Metrika (counter `53776969`) is loaded on first mount by `components/CookieConsent.tsx` regardless of the banner (external script, no inline — CSP-friendly); the banner only links to `/privacy` and dismisses. `components/MetrikaRouteTracker.tsx` sends `ym('hit')` on App Router SPA navigations. Track conversions with `trackGoal(goal)` from `lib/analytics.ts`; goal identifiers are documented in `docs/metrika-goals.md` and must already exist in the Metrika dashboard. Never re-add an inline Metrika `<Script>` to the layout.

**Order form is dual-purpose: usable by AI agents, hardened against spam.** `components/OrderForm.tsx` → `app/api/send-email/route.ts`. The route enforces IP rate limiting (`lib/rate-limit.ts`), file size/count/extension limits, a required `contact` field, and a **honeypot** (`company` field — if non-empty, silently returns ok without sending). `public/llms.txt` documents the real fields for agents but deliberately does not reveal the honeypot. **`.env.local` has working SMTP, so the dev server sends real email** — when testing the API, fill the honeypot so the request is dropped.

**External image proxy is SSRF-guarded.** `app/api/wb-img/route.ts` proxies Wildberries CDN images; `lib/wb-cdn.ts` (`parseWbImageUrl`) validates protocol + hostname against `basket-N.wbbasket.ru` and returns null otherwise. Covered by `tests/wb-cdn.test.ts`.

**Fonts are self-hosted via `next/font`** in `lib/fonts.ts` (Bebas Neue display — Latin only, Cyrillic falls back to Manrope; Manrope body; JetBrains Mono). CSS vars `--f-display/--f-body/--f-mono` are applied on `<html>` and consumed in `app/globals.css`. No Google Fonts `@import`.

**Security headers + legacy redirects live in `next.config.js`.** CSP is **production-only** (`isProd`) because dev HMR needs `eval`. There are ~60 permanent redirects from old WordPress URLs — preserve them when changing routes.

## Deploy

Push to `main` → GitHub Actions `check` job → SSH deploy (`appleboy/ssh-action`) to `/var/www/clc-ufa`, pm2 process `clc-ufa`, nginx reverse proxy. The deploy script is hardened (`set -euo pipefail`, `git reset --hard origin/main`, clean `npm ci`, `rm -rf .next`, rebuild, copy `public`/`.next/static` into `.next/standalone` without nesting, pm2 restart, curl health check). A green Actions run is not proof of a live update — if prod looks stale, check the deploy job log, not just that it's green.

---

# Frontend Website Rules

The sections below are the standing design/build rules for this repo. `AGENTS.md` mirrors them for other agents — keep the two in sync.

## Always Do First
- **Invoke the `frontend-design` skill and the `ui-ux-pro-max` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Always use Puppeteer to make screenshots.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
