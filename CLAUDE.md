# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowPOS Website is a static HTML marketing and download site for FlowPOS - a professional offline-first Point of Sale system. The site automatically updates when new FlowPOS releases are published via GitHub Actions.

**Tech Stack**: Pure HTML/CSS/JavaScript (no build tools), Tailwind CSS CDN, deployed on Netlify

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

- **Deploy**: Automatic on push to `main` branch via Netlify
- **Manual Deploy**: Push changes to trigger Netlify rebuild
- **Preview**: PRs automatically get preview deployments

## Architecture & Key Concepts

### Centralized Version Configuration System

**Critical**: Version updates are centralized in `js/config.js` to prevent hardcoded URLs scattered throughout the codebase.

**To update FlowPOS version**:
1. Edit `js/config.js` - change only 2 lines:
   - `version: 'X.X.X'`
   - `releaseDate: 'YYYY-MM-DD'`
2. Download URLs auto-generate based on filename patterns
3. GitHub Actions workflow can also auto-update (see below)

**Config object structure** (`window.FLOWPOS_CONFIG`):
- `version` - Current FlowPOS version
- `releaseDate` - Release date
- `repository` - GitHub repo info (owner: avaldezdev, repo: flowpos-releases)
- `installers` - Filename patterns for each OS (Windows, Mac, Linux)
- Helper methods: `getDownloadUrl(os)`, `getFileName(os)`, `getAllDownloadUrls()`

**Why this matters**: Previously, version numbers were hardcoded in multiple files. Now everything derives from config.js.

### GitHub Actions Automation

**Workflow**: `.github/workflows/update-releases.yml`

**Triggers**:
- Daily at 00:00 UTC (scheduled check)
- Manual dispatch (GitHub Actions UI)
- Webhook from flowpos-releases repo (repository_dispatch event)

**What it does**:
1. Fetches latest release from `avaldezdev/flowpos-releases` via GitHub API
2. Compares version in API response vs. current version
3. If new version detected:
   - Updates `js/config.js` (version, releaseDate)
   - Updates `netlify.toml` redirects (filename patterns)
   - Commits changes
   - Netlify auto-deploys on commit

**Manual trigger**:
```bash
# Via GitHub UI: Actions → Update Release Metadata → Run workflow
# Or via gh CLI:
gh workflow run update-releases.yml
```

### Netlify Configuration

**File**: `netlify.toml`

**Key features**:
- Publish directory: `.` (root, since it's static HTML)
- No build command
- Security headers (CSP, X-Frame-Options, etc.)
- Cache headers for static assets (CSS/JS/images)
- URL redirects:
  - `/download` → `/descargas.html`
  - `/activate` → `/activacion.html`
  - `/activation` → `/activacion.html`

**Direct download redirects** (commented out in netlify.toml):
- Previously had `/download/windows` redirects directly to GitHub releases
- Now removed in favor of client-side download handling via config.js

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
- Update `js/config.js` (version + releaseDate)
- Verify filename patterns match actual GitHub release assets
- Test download links after deployment

**DON'T**:
- Hardcode download URLs in HTML
- Skip updating config.js
- Manually edit netlify.toml redirects (Actions does this)

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

# Manually trigger update workflow if needed
gh workflow run update-releases.yml
```

### Troubleshooting Failed Deployments

1. **Check Netlify logs**: Dashboard → Deploys → [failed deploy] → Deploy log
2. **Common issues**:
   - CSP blocking external resources (update `netlify.toml` headers)
   - Missing config.js (check load order in HTML `<script>` tags)
   - Invalid version format in config.js
3. **Force rebuild**: Netlify UI → Deploys → Trigger deploy → Deploy site

### Assets & Images

**Directory**: `assets/images/`
- Currently mostly empty (placeholders using Lucide icons)
- To add logo: Place at `assets/images/logo.png` and update HTML `<img>` tags
- Screenshots: `assets/images/screenshots/`

**No releases.json file**: Previously tracked in README, but doesn't exist in actual codebase. Version info is in `js/config.js` instead.

## Repository Conventions

### Branch Strategy

- **Main branch**: `master` (use for PRs, though current branch is `main`)
- Current working branch: `main`
- Deploy branch: `main` (Netlify watches this)

**Note**: There's a discrepancy - git status shows main, but README mentions master as main branch.

### Commit Message Format

Follow conventional commits style (as seen in recent commits):
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks (version updates, config changes)
- `refactor:` - Code restructuring

### Recent Architectural Changes

From commit history:
- **f16f9aa**: Updated to FlowPOS v2.0.2
- **bdc1d2f**: Implemented centralized version config system
- **7051496**: Fixed releases.json and .gitignore
- **817c79c**: Updated references from flowpos to flowpos-releases
- **d1d85f3**: Removed unnecessary download redirects

## External Dependencies

**CDN-loaded**:
- Tailwind CSS: `https://cdn.tailwindcss.com`
- Lucide Icons: `https://unpkg.com/lucide@latest`
- AOS: `https://unpkg.com/aos@2.3.1/dist/aos.css` + JS

**CSP Whitelist** (in netlify.toml):
- script-src: cdn.tailwindcss.com, unpkg.com
- style-src: unpkg.com
- connect-src: api.github.com

## Important Notes

- **No package.json**: This is intentional - pure static site
- **No tests**: Simple enough to test manually
- **No CI beyond Actions**: Netlify handles deployment, GitHub Actions handles version sync
- **Offline-first philosophy**: Reflects FlowPOS product philosophy (the software runs offline)
- **Paraguay market**: Spanish language, Guaraníes currency, local phone numbers
