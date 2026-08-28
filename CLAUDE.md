# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowPOS Website is a static HTML marketing and download site for FlowPOS - a professional offline-first Point of Sale system. The published version and the release notes are written by the release pipeline that lives in the app repo (`flowpos/scripts/release.mjs`), not by hand.

**Tech Stack**: Pure HTML/CSS/JavaScript (no build tools), Tailwind CSS CDN. Served by nginx from a container on **Coolify** (own VPS) at **https://flowpos.com.py**. Netlify is still connected to the same repo, but only as a **backup**.

**Key Repository**: Downloads are served from `avaldezdev/flowpos-releases` (separate repo)

## Development Commands

### Local Development

```bash
# Option 1: Open directly in browser
start index.html  # Windows
open index.html   # macOS

# Option 2: Python HTTP server
python -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Node.js http-server (if installed globally)
http-server -p 8000
```

**Note**: This is a static site with no build process. No npm install, no compilation required.

### Testing & Deployment

- **Official site**: https://flowpos.com.py — nginx in a container built from the repo `Dockerfile`, hosted on Coolify. See `DEPLOY-COOLIFY.md`.
- **Deploy**: push to `main` → Coolify redeploys automatically (auto-deploy webhook is enabled).
- **Netlify**: the same push also rebuilds Netlify, which ignores the `Dockerfile` and uses `netlify.toml`. It is the **backup**, not the site.
- **Preview**: PRs get preview deployments on Netlify (backup host only).

## Architecture & Key Concepts

### Centralized Version Configuration System

**Critical**: Version updates are centralized in `js/config.js` to prevent hardcoded URLs scattered throughout the codebase.

**To update the published version**: you don't. `flowpos/scripts/release.mjs` writes it on every release —
`js/config.js` (`version`, `releaseDate`) and the release cards in `descargas.html` (between the
`FLOWPOS:RELEASE:*` markers) — then commits and pushes. Editing those by hand only risks fighting it.
`ACTUALIZAR_VERSION.md` documents the manual fallback for when the pipeline is not available.

**Config object structure** (`window.FLOWPOS_CONFIG`):
- `version` - Current FlowPOS version
- `releaseDate` - Release date
- `repository` - GitHub repo info (owner: avaldezdev, repo: flowpos-releases)
- `installers` - Filename patterns for each OS (Windows, Mac, Linux)
- Helper methods: `getDownloadUrl(os)`, `getFileName(os)`, `getAllDownloadUrls()`

**Why this matters**: Previously, version numbers were hardcoded in multiple files. Now everything derives from config.js.

### Version Sync

There is **no automation in this repo**. `flowpos/scripts/release.mjs` writes `js/config.js` and
the release cards of `descargas.html`, commits and pushes; the push triggers the Coolify deploy.

A `.github/workflows/update-releases.yml` used to do a version sync of its own. It was **removed**:
it read `assets/downloads/releases.json`, a file that does not exist in this repo, so it failed on
every scheduled run — and it never touched `js/config.js`, despite what this document used to claim.

### Server Configuration (nginx + netlify.toml)

Redirects, security headers and cache policy are declared **twice**, and both copies must be kept in sync:

- `nginx.conf` — used by Coolify. **This is the one serving flowpos.com.py.**
- `netlify.toml` — used by the Netlify backup only.

**Key features** (in both):
- Static root, no build command
- Security headers (CSP, X-Frame-Options, etc.)
- Cache headers for static assets (CSS/JS/images)
- URL redirects:
  - `/download` → `/descargas.html`
  - `/activate` → `/activacion.html`
  - `/activation` → `/activacion.html`

⚠️ A redirect or header added only to `netlify.toml` **does not exist on the official site**.

**Direct download redirects**: previously `/download/windows` pointed straight at GitHub releases.
Removed in favor of client-side download handling via `config.js`.

### JavaScript Architecture

**Files**:
- `js/config.js` - Centralized configuration (loaded first)
- `js/main.js` - Main application logic (depends on config.js)

**main.js responsibilities**:
- OS detection (`detectOS()` - returns 'windows', 'mac', or 'linux')
- Download page initialization (`initializeDownloadPage()`)
- Download handling (`handleDownload()` - uses config URLs)
- UI utilities (toast notifications, post-download modal, smooth scroll)
- Mobile menu toggle
- Scroll progress indicator

**Global API** (`window.FlowPOS`):
- `copyToClipboard(text)`
- `showToast(type, message)`
- `detectOS()`
- `handleDownload(os, releaseData)`

### Page Structure

**Three main pages**:
1. `index.html` - Landing page (hero, features, pricing, CTA)
2. `descargas.html` - Downloads page (OS detection, download buttons)
3. `activacion.html` - Activation guide (7-step illustrated process)

**Common elements**:
- Navigation bar (sticky, responsive)
- WhatsApp floating button (hardcoded number: 595986708565)
- Footer with contact info
- Lucide icons (loaded via CDN)
- AOS (Animate On Scroll) animations

## Critical Patterns & Conventions

### When Updating Versions

**DO**:
- Let the release pipeline write `js/config.js` (version + releaseDate)
- Verify filename patterns match actual GitHub release assets
- Test download links after deployment

**DON'T**:
- Hardcode download URLs in HTML
- Skip updating config.js
- Add a redirect or header to only one of `nginx.conf` / `netlify.toml` (the official site reads `nginx.conf`)

### Cache Busting for Local Assets (IMPORTANT)

`nginx.conf` serves `.css`/`.js` with `expires 1y`. Without a version query, returning
visitors keep the **old** `main.js` / `styles.css` after a deploy — new behavior silently
fails to reach them.

All four pages therefore reference local assets with a version query:

```html
<link rel="stylesheet" href="css/styles.css?v=20260815">
<script src="js/main.js?v=20260815"></script>
```

**Whenever you edit `js/main.js`, `js/config.js` or `css/styles.css`, bump `?v=` to the
current date (`YYYYMMDD`) in ALL pages that reference it** — otherwise the change won't
reach existing visitors.

### SEO: qué hay que mantener a mano

El sitio no tiene build, así que estas cuatro cosas no se actualizan solas:

1. **`sitemap.xml`** — al agregar o quitar una página `.html` de la raíz, agregarla/sacarla
   de la lista. `<lastmod>` se toca solo cuando el contenido cambia de verdad.
2. **`<link rel="canonical">`** — cada página lleva el suyo apuntando a
   `https://flowpos.com.py/<archivo>.html`. Es lo que evita que Google cuente como
   duplicadas las dos formas de llegar a la misma página que habilita el
   `try_files $uri $uri.html` de `nginx.conf`: `/descargas` y `/descargas.html`.
   También cubre cualquier otro host que llegue a servir el sitio (staging, previews).
   **Una página nueva sin canonical es una página duplicada.**
3. **Precios en el JSON-LD de `index.html`** — el bloque `SoftwareApplication` repite los
   4 precios de la sección `#pricing`. Si cambia un plan, hay que cambiarlo en los dos lados.
4. **FAQ de `activacion.html`** — el bloque `FAQPage` copia palabra por palabra las 8
   preguntas y respuestas visibles. Si no coinciden exactamente, Google descarta el bloque
   entero. Al editar una respuesta, copiarla también al JSON-LD.

La imagen de compartir (WhatsApp/Facebook) es `assets/images/og-image.png`, 1200×630.
Se regenera desde la raíz del repo con `python tools/generar-og-image.py` (necesita Pillow).
Si cambia la marca o el eslogan, editar ese script y volver a correrlo.

### Links to the Client Portal

The public site is the front door to the portal (`app.flowpos.com.py`). Two entry points
exist on every page and must stay in sync:

- Nav: an **"Ingresar"** button (icon + label; label hidden below `sm`).
- Footer, "Producto" column: **"Portal del cliente"**.

Short redirects (`/portal`, `/ingresar`, `/login`, `/cuenta`, `/registro`) point to the
portal and are defined in **both** `nginx.conf` (Coolify) and `netlify.toml` (backup).
Add new shortcuts to both files or they only work on one host.

The internal back-office (`admin.flowpos.com.py`) is deliberately **not** linked anywhere.

### File Naming Conventions

FlowPOS releases follow this pattern:
- Windows: `FlowPOS-Setup-{version}.exe`
- macOS: `FlowPOS-{version}.dmg` (in development)
- Linux: `FlowPOS-{version}.AppImage` (in development)

**Note**: Currently only Windows builds are actively released.

### Contact Information

Update in multiple locations:
- **WhatsApp**: Search/replace `595986708565` across all HTML files
- **Email**: `soporte@flowpos.com` (footer, meta tags)

## Common Maintenance Tasks

### Adding a New Page

```bash
# Create new HTML file (copy structure from existing pages)
# Add navigation links in all HTML files:
<a href="nueva-pagina.html">Nueva Página</a>

# Commit and push
git add nueva-pagina.html
git commit -m "feat: add nueva-pagina page"
git push
```

### Updating Pricing Plans

Edit `index.html` → Search for `id="pricing"` section
- Plans: Trial, Standard, Premium, Enterprise
- Prices in Guaraníes (Gs)
- WhatsApp links pre-populated with plan name

### Checking Release Sync Status

```bash
# Check current version in config
grep "version:" js/config.js

# Check latest release in flowpos-releases repo
gh release view --repo avaldezdev/flowpos-releases

```

### Troubleshooting Failed Deployments

1. **Check Coolify**: app → Deployments → the failing deploy's log (this is the official site).
2. **Common issues**:
   - CSP blocking external resources (update the headers in `nginx.conf`, and mirror them in `netlify.toml`)
   - Missing config.js (check load order in HTML `<script>` tags)
   - Invalid version format in config.js
3. **Force rebuild**: Coolify → Deploy. (For the backup: Netlify UI → Deploys → Trigger deploy.)

### Assets & Images

**Directory**: `assets/images/`
- Currently mostly empty (placeholders using Lucide icons)
- To add logo: Place at `assets/images/logo.png` and update HTML `<img>` tags
- Screenshots: `assets/images/screenshots/`

**No releases.json file**: Previously tracked in README, but doesn't exist in actual codebase. Version info is in `js/config.js` instead.

## Repository Conventions

### Branch Strategy

- **Main branch**: `main`
- **Deploy branch**: `main` — Coolify redeploys on push, and Netlify rebuilds the backup from the same push.

### Commit Message Format

Follow conventional commits style (as seen in recent commits):
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks (version updates, config changes)
- `refactor:` - Code restructuring

### Recent Architectural Changes

From commit history:
- **62f4df7**: own deploy on Coolify (`Dockerfile` + `nginx.conf`), keeping Netlify as a backup
- **e61a2fc / ee75fb2**: SEO base across the 4 pages, and removal of the redirect to the netlify.app domain
- **bdc1d2f**: centralized version config system (`js/config.js`)
- The release cards in `descargas.html` and the version in `config.js` are written by `flowpos/scripts/release.mjs`

## External Dependencies

**CDN-loaded**:
- Tailwind CSS: `https://cdn.tailwindcss.com`
- Lucide Icons: `https://unpkg.com/lucide@latest`
- AOS: `https://unpkg.com/aos@2.3.1/dist/aos.css` + JS

**CSP Whitelist** (in `nginx.conf`, mirrored in `netlify.toml`):
- script-src: cdn.tailwindcss.com, unpkg.com
- style-src: unpkg.com
- connect-src: api.github.com

## Important Notes

- **No package.json**: This is intentional - pure static site
- **No tests**: Simple enough to test manually
- **No CI**: Coolify deploys the site (Netlify mirrors it as backup) and `flowpos/scripts/release.mjs` handles version sync. This repo has no workflows.
- **Offline-first philosophy**: Reflects FlowPOS product philosophy (the software runs offline)
- **Paraguay market**: Spanish language, Guaraníes currency, local phone numbers
