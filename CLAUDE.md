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
- `js/tracking.js` - GA4 / Google Ads / Meta Pixel. See "Medicion" below.

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

**Six pages** (this list said "three" long after the other three existed):
1. `index.html` - Landing page (hero, 9 feature cards, screenshots, pricing, CTA)
2. `planes.html` - Full plan comparison (~16 categories x 4 plans, one table)
3. `descargas.html` - Downloads page (OS detection, download buttons, release notes)
4. `activacion.html` - Activation guide (7 steps) + the 8-question FAQ
5. `privacidad.html` - Privacy policy (required by Meta and Google for ads)
6. `404.html` - Custom not-found page. **Not in `sitemap.xml` and `noindex`.**
   Its links are root-relative (`/planes.html`) on purpose: nginx serves this
   file for any missing path, including ones with folders, where a relative
   link would resolve to another 404.

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

### Video del hero (portada)

La portada muestra `assets/video/flowpos-demo-v2.mp4` (sin audio, en bucle), con
`assets/video/flowpos-demo-v2-poster.jpg` como póster. ⚠️ El sufijo `-v2` importa:
este documento nombró los archivos sin él durante dos versiones del video. Sale del repo `hyperframes`
(`videos/flowpos-hero/renders/`), no se edita acá.

Tres cosas que no son obvias:

1. **El `<source>` va con `data-src`, no con `src`.** La tarjeta del hero está oculta en
   celular (`hidden md:block`), pero si el `src` estuviera en el HTML el navegador se
   bajaría los 2,6 MB igual — a alguien que nunca lo va a ver, pagando datos.
   `initHeroVideo()` en `js/main.js` conecta la fuente recién cuando la tarjeta ocupa
   lugar en pantalla. **Si lo pasás a `src` fijo, volvés a romper eso.**
2. **`.mp4` está en la caché larga de `nginx.conf` Y de `netlify.toml`.** Es el estático
   más pesado del sitio: sin eso se vuelve a bajar en cada visita.
3. **La CSP no necesita `media-src`**: al no estar declarada cae en `default-src 'self'`,
   y el video se sirve del mismo dominio. Si algún día el video se mueve a un CDN, ahí sí
   hay que agregar `media-src` en los dos archivos.

Para cambiar el video: reemplazar los dos archivos de `assets/video/` y bumpear el `?v=`
(ver arriba) solo si además tocaste `main.js`.

### SEO: qué hay que mantener a mano

El sitio no tiene build, así que estas cuatro cosas no se actualizan solas:

1. **`sitemap.xml`** — al agregar o quitar una página `.html` de la raíz, agregarla/sacarla
   de la lista. `<lastmod>` se toca solo cuando el contenido cambia de verdad.
   Hoy lista **5 URLs**: inicio, planes, descargas, activación y privacidad.
   ⚠️ `404.html` **no va**: es una página de error, lleva `noindex` y no se indexa.
2. **`<link rel="canonical">`** — cada página lleva el suyo apuntando a
   `https://flowpos.com.py/<archivo>.html`. Es lo que evita que Google cuente como
   duplicadas las dos formas de llegar a la misma página que habilita el
   `try_files $uri $uri.html` de `nginx.conf`: `/descargas` y `/descargas.html`.
   También cubre cualquier otro host que llegue a servir el sitio (staging, previews).
   **Una página nueva sin canonical es una página duplicada.**
3. **Precios en el JSON-LD de `index.html`** — el bloque `SoftwareApplication` repite los
   4 precios de la sección `#pricing`. Si cambia un plan, hay que cambiarlo en los dos lados.
   Y hay un **tercer** lugar fuera de este repo: `flowpos-cloud/apps/api/src/lib/plans.ts`,
   que es la fuente única de los precios y la que alimenta al **portal del cliente**.
   La web estática NO la consume. Un precio cambia en los tres o el cliente ve dos
   números distintos según entre por la web o por su portal.
4. **FAQ de `activacion.html`** — el bloque `FAQPage` copia palabra por palabra las 8
   preguntas y respuestas visibles. Si no coinciden exactamente, Google descarta el bloque
   entero. Al editar una respuesta, copiarla también al JSON-LD.
   ⚠️ Y una respuesta envejece **sin que nada falle**: en octubre de 2026 el FAQ todavía
   decía que el Profesional respondía en 24 h (el código da 4), que había que pedir por
   WhatsApp la reasignación de la licencia al cambiar de PC (hoy la licencia sigue a la
   cuenta) y que internet se usaba en dos momentos (son tres desde la copia en la nube).
   **Al tocar una función, revisar si la responde alguna de estas 8 preguntas.**

La imagen de compartir (WhatsApp/Facebook) es `assets/images/og-image.png`, 1200×630.
Se regenera desde la raíz del repo con `python tools/generar-og-image.py` (necesita Pillow).
Si cambia la marca o el eslogan, editar ese script y volver a correrlo.

### Medicion (GA4, Google Ads, Meta Pixel)

`js/tracking.js` is loaded on **all six pages** and is **inert until you paste the
IDs** at the top of the file (`ga4`, `googleAds`, `conversiones`, `metaPixel`).
With them empty it loads nothing and sends nothing, so the site is safe to publish
as is.

Conversion events are already wired by delegation — no per-button markup:

| Event (GA4) | Meta | Fires on |
|---|---|---|
| `descarga_iniciada` | `Lead` | `flowpos:descarga` from `main.js`, and direct GitHub release links |
| `contacto_whatsapp` | `Contact` | any `wa.me/` link; the preset message identifies the plan |
| `click_portal` | — | any link to `app.flowpos.com.py` |

- The download's temporary link carries `data-notrack` so the click is not
  double-counted alongside the `flowpos:descarga` event.
- Events use `transport_type: 'beacon'` so they survive the navigation that a
  WhatsApp link triggers.
- `privacidad.html` exists because Meta and Google require it. **If you add
  another tool, add its domains to the CSP in BOTH `nginx.conf` and
  `netlify.toml`** or the browser blocks it silently.
- The full measurement plan (what to create, in what order, and what to watch)
  is in `docs/plan-de-medicion.md`.

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
- **Email**: `soporte@flowpos.com.py` (footer, JSON-LD `Organization`, privacidad).
  ⚠️ Es `.com.py`. Este documento decía `soporte@flowpos.com`, que no es el del sitio.

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

Los planes se llaman, de cara al cliente: **Gratuito, Inicio, Profesional y Total**
(internamente `free`, `standard`, `premium`, `enterprise`; `trial` es la prueba de 7
días, no se vende). Un cambio de precio o de contenido toca **cuatro** lugares:

1. `index.html` → sección `id="pricing"` (las 4 tarjetas, con el link de WhatsApp
   que ya trae el nombre del plan en el mensaje).
2. `index.html` → el JSON-LD `SoftwareApplication` (repite los 4 precios).
3. `planes.html` → la tabla comparativa y la fila "Precio anual" del final.
4. **Otro repo**: `flowpos-cloud/apps/api/src/lib/plans.ts` — fuente única de los
   precios, la consume el portal por `GET /api/plans`. Cambiarla exige **redeploy
   manual de la API** (está a propósito fuera del auto-deploy, ver
   `flowpos-cloud/DEPLOY.md`).

⚠️ Y lo que un plan **incluye** tiene una quinta fuente, que manda sobre todas:
`flowpos/src/shared/types/license.ts` (`LICENSE_FEATURES`) es lo que el programa de
verdad habilita. Antes de escribir una fila nueva en `planes.html`, mirar ahí qué
tier tiene el flag. Dos reglas que ya se violaron y costaron caro:
**Profesional = Total para UNA computadora** (lo único que los separa son las cajas
en red), y **ningún plan incluye presencia física** — la web anunció "capacitación
presencial" y "visita" en planes que nunca la tuvieron.

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
- `og-image.png` (1200x630) - share image, regenerated with `tools/generar-og-image.py`
- `capturas/` - **real product screenshots**, WebP in three widths (683/1024/1366),
  light and dark, for: ventas, ventas-grilla, caja, inventario, informes,
  facturacion, clientes. The originals live in `capturas/originales/`.
  They are used by `index.html` (hero fallback + the "Asi se ve por dentro"
  gallery + the offline section) and declared in `sitemap.xml` as image entries.
- The brand mark is `isotipo.svg` at the repo root (favicon + JSON-LD logo).
- ⚠️ This section used to say the folder was "mostly empty" with Lucide
  placeholders. It has not been true since the screenshots landed.

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
- script-src: cdn.tailwindcss.com, unpkg.com, **googletagmanager.com,
  google-analytics.com, connect.facebook.net**
- style-src: unpkg.com
- connect-src: api.github.com, **api.flowpos.com.py** (session check for the
  "Mi cuenta" button), googletagmanager.com, google-analytics.com,
  analytics.google.com, stats.g.doubleclick.net, google.com,
  td.doubleclick.net, connect.facebook.net, facebook.com
- frame-src: td.doubleclick.net, googletagmanager.com, facebook.com

⚠️ The ad and analytics domains are already whitelisted **in both files**. Without
them the pixels fail silently — the page looks fine and nothing is ever measured,
which is the worst possible failure for a paid campaign.

## Important Notes

- **No package.json**: This is intentional - pure static site
- **No tests**: Simple enough to test manually
- **No CI**: Coolify deploys the site (Netlify mirrors it as backup) and `flowpos/scripts/release.mjs` handles version sync. This repo has no workflows.
- **Offline-first philosophy**: Reflects FlowPOS product philosophy (the software runs offline)
- **Paraguay market**: Spanish language, Guaraníes currency, local phone numbers
