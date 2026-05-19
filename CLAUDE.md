# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Eleventy dev server + Tailwind watch (localhost:8080)
npm run build    # Build for production (Tailwind minified + Eleventy). Do not run during dev — use only when explicitly asked.
```

Deploy to dev (default) or prod:
```bash
bash deploy.sh        # → dev-web.stella-commerce.com
bash deploy.sh prod   # → stella-commerce.com (prompts for confirmation)
```

## Tech Stack

- **Eleventy 3.x** — static site generator, Nunjucks templating
- **Tailwind CSS 3** — utility-first CSS, compiled via PostCSS + Autoprefixer
- **Alpine.js** — lightweight reactive UI (loaded via `x-data` on `<body>`)
- **GSAP** (+ ScrollTrigger, SplitText) — scroll/entrance animations wired in `src/assets/js/main.js`
- **Lenis** — smooth scroll
- **Three.js** — used by the world/3D visuals

All vendor JS is bundled locally from `node_modules/` — never CDN-link.

## Conventions (must follow)

- **Stella positioning** — Stella is a **commerce backend with agentic features**. Never frame it as a chatbot, AI assistant, or widget in copy or UI.
- **Content lives in `_data/`** — every component pulls its strings/items from a JSON file in `src/_data/`. Never hardcode copy inside `.njk` components; add or extend a JSON file and loop/reference it from the template.
- **One font: Inter** — no Poppins or alternate display fonts. Wherever a build plan says `font-display`, use `font-sans font-bold` instead.
- **Single page background** — `<body>` has `bg-stella-bg` globally. Do **not** add `bg-*` to section elements. Only cards/surfaces get a white (or other) background.
- **No production builds during dev** — verify changes with `npm run dev`. Only run `npm run build` when explicitly asked.

## Architecture

**Source → Build:**
- Templates in `src/` (`.njk`, `.html`, `.md`) compile to `_site/`
- `src/assets/css/main.css` → Tailwind compiles to `src/assets/css/tailwind.css` → passthrough copied to `_site/`
- Alpine, GSAP (+ ScrollTrigger, SplitText), Lenis, and Three.js are copied from `node_modules/` into `_site/assets/vendor/` at build time (see `.eleventy.js` passthroughs)

**Pages** (each is a top-level `.njk` in `src/`):
- `index.njk` — landing page
- `features.njk`
- `storefront.njk`
- `customer-stories.njk`
- `schedule-demo.njk`

**Template hierarchy:**
- `src/_includes/layouts/base.njk` — HTML shell, loads Tailwind, GSAP, Alpine, Lenis, and `main.js`
- `src/_includes/components/` — reusable Nunjucks partials (e.g. `hero.njk`, `nav.njk`, `footer.njk`)
- `src/_includes/components/<page>/` — page-scoped component folders (e.g. `storefront/`, `customer-stories/`, `schedule-demo/`)
- `src/_data/site.json` — global site metadata (`site.name`, `site.description`, `site.url`)
- `src/_data/*.json` — per-section content (e.g. `pillars.json`, `competitors.json`, `demoChat.json`, `storefront.json`)

**GSAP animation IDs** in `main.js` must match element IDs in templates (e.g. `#hero-headline`, `#hero-sub`, `#hero-cta`).

**`env` global** is set from `ELEVENTY_ENV` env var (defaults to `"production"`). The base layout adds `noindex` in development mode.

## Deployment

The deploy pipeline is: `npm run build` → Docker image (nginx:alpine serving `_site/`) → container via Docker Compose → Traefik reverse proxy handles TLS (Let's Encrypt).

- Dev compose: `docker-compose.dev.yml` — domain `dev-web.stella-commerce.com`, container `stella-web-dev`
- Prod compose: `docker-compose.yml` — domain `stella-commerce.com`, container `stella-web-prod`
- Both attach to an external Docker network named `hosting` (Traefik must be running on it)
- nginx caches HTML with `no-cache` and static assets (JS/CSS/images) with `30d immutable`; gzip is enabled
