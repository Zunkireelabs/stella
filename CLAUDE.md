# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Eleventy dev server + Tailwind watch (localhost:8080)
npm run build    # Build for production (Tailwind minified + Eleventy)
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
- **GSAP** — scroll/entrance animations wired in `src/assets/js/main.js`

## Architecture

**Source → Build:**
- Templates in `src/` (`.njk`, `.html`, `.md`) compile to `_site/`
- `src/assets/css/main.css` → Tailwind compiles to `src/assets/css/tailwind.css` → passthrough copied to `_site/`
- Alpine.js and GSAP are copied from `node_modules/` into `_site/assets/vendor/` at build time (see `.eleventy.js` passthroughs — do not CDN-link them)

**Template hierarchy:**
- `src/_includes/layouts/base.njk` — HTML shell, loads Tailwind, GSAP, Alpine, and `main.js`
- `src/_includes/components/` — reusable Nunjucks partials (e.g. `hero.njk`)
- `src/_data/site.json` — global site metadata (`site.name`, `site.description`, `site.url`)
- `src/index.njk` — page entry point, sets frontmatter title/description, includes components

**GSAP animation IDs** in `main.js` must match element IDs in templates (`#hero-headline`, `#hero-sub`, `#hero-cta`).

**`env` global** is set from `ELEVENTY_ENV` env var (defaults to `"production"`). The base layout adds `noindex` in development mode.

## Deployment

The deploy pipeline is: `npm run build` → Docker image (nginx:alpine serving `_site/`) → container via Docker Compose → Traefik reverse proxy handles TLS (Let's Encrypt).

- Dev compose: `docker-compose.dev.yml` — domain `dev-web.stella-commerce.com`, container `stella-web-dev`
- Prod compose: `docker-compose.yml` — domain `stella-commerce.com`, container `stella-web-prod`
- Both attach to an external Docker network named `hosting` (Traefik must be running on it)
- nginx caches HTML with `no-cache` and static assets (JS/CSS/images) with `30d immutable`; gzip is enabled
