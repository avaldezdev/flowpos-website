# FlowPOS Website

Sitio web oficial para descarga y activación de FlowPOS - Sistema de Punto de Venta Profesional.

## 🌐 Sitio en Vivo

- **Producción**: https://flowpos.netlify.app (o custom domain)
- **Preview**: Generado automáticamente en cada PR

## 📋 Tabla de Contenidos

- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo Local](#desarrollo-local)
- [Deploy en Netlify](#deploy-en-netlify)
- [Automatización](#automatización)
- [Configuración](#configuración)
- [Mantenimiento](#mantenimiento)

## ✨ Características

### Funcionalidades Principales
- ✅ **Detección automática de SO** - Identifica Windows, Mac o Linux
- ✅ **Descargas directas** - Links a GitHub Releases
- ✅ **Guía de activación paso a paso** - 7 pasos ilustrados
- ✅ **Responsive design** - Mobile-first, compatible con todos los dispositivos
- ✅ **Deploy automático** - Netlify se actualiza en cada commit
- ✅ **Actualización de versiones** - GitHub Actions detecta nuevos releases
- ✅ **SEO optimizado** - Meta tags, Open Graph, sitemap
- ✅ **Botón WhatsApp flotante** - Contacto directo con soporte

### Páginas
1. **index.html** - Landing page con hero, características, precios
2. **descargas.html** - Página de descargas con detección de SO
3. **activacion.html** - Guía completa de activación

## 📁 Estructura del Proyecto

```
flowpos-website/
├── index.html              # Landing page principal
├── descargas.html          # Página de descargas
├── activacion.html         # Guía de activación
├── netlify.toml           # Configuración de Netlify
├── README.md              # Este archivo
│
├── css/
│   └── styles.css         # Estilos personalizados
│
├── js/
│   └── main.js            # Lógica principal (detección OS, descargas)
│
├── assets/
│   ├── images/            # Logo, screenshots, iconos
│   │   └── (vacío - agregar imágenes aquí)
│   └── downloads/
│       └── releases.json  # Metadata de versiones
│
└── .github/
    └── workflows/
        └── update-releases.yml  # GitHub Actions workflow
```

## 🚀 Desarrollo Local

### Requisitos
- Ninguno! Es un sitio estático HTML puro
- (Opcional) Live Server para desarrollo con hot-reload

### Método 1: Abrir directamente en navegador
```bash
# Simplemente abre index.html en tu navegador
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Método 2: Con Live Server (VSCode)
1. Instala la extensión "Live Server" en VSCode
2. Click derecho en `index.html` → "Open with Live Server"
3. Se abrirá en http://localhost:5500

### Método 3: Con Python
```bash
# Python 3
python -m http.server 8000

# Abre http://localhost:8000 en tu navegador
```

### Método 4: Con Node.js
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8000

# Abre http://localhost:8000
```

## 🌐 Deploy en Netlify

### Opción 1: Deploy desde GitHub (Recomendado)

#### Paso 1: Subir a GitHub
```bash
# Inicializar repositorio (si no existe)
git init
git add .
git commit -m "feat: initial commit - FlowPOS website"

# Crear repositorio en GitHub
# https://github.com/new

# Conectar y push
git remote add origin https://github.com/TU_USUARIO/flowpos-website.git
git branch -M main
git push -u origin main
```

#### Paso 2: Conectar con Netlify
1. Ve a https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `flowpos-website`
5. Configuración de build:
   - **Build command**: (dejar vacío)
   - **Publish directory**: `.` (punto)
   - **Branch**: `main`
6. Click "Deploy site"

#### Paso 3: Configurar dominio personalizado (opcional)
1. En el dashboard de Netlify → "Domain settings"
2. Click "Add custom domain"
3. Ingresa tu dominio (ej: `flowpos.com.py`)
4. Sigue las instrucciones para configurar DNS

### Opción 2: Deploy manual (Drag & Drop)
1. Ve a https://app.netlify.com
2. Arrastra la carpeta completa del proyecto
3. Netlify lo desplegará automáticamente

### Opción 3: Deploy con Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## ⚙️ Automatización

### GitHub Actions Workflow

El workflow `update-releases.yml` se ejecuta:
- ✅ **Diariamente** a las 00:00 UTC (verifica nuevas versiones)
- ✅ **Manualmente** desde GitHub Actions
- ✅ **On webhook** desde el repo principal de FlowPOS (requiere configuración)

#### Qué hace el workflow:
1. Consulta la última versión de FlowPOS en GitHub
2. Compara con la versión actual en `releases.json`
3. Si hay una nueva versión:
   - Actualiza `releases.json`
   - Actualiza redirects en `netlify.toml`
   - Hace commit y push
4. Netlify detecta el cambio y redespliega automáticamente

#### Ejecución manual:
1. Ve a https://github.com/TU_USUARIO/flowpos-website/actions
2. Selecciona "Update Release Metadata"
3. Click "Run workflow"

### Webhook desde FlowPOS repo (opcional)

Para que el sitio web se actualice automáticamente cuando se publica un release en FlowPOS:

1. En el repo de FlowPOS, ve a Settings → Webhooks
2. Add webhook:
   - **Payload URL**: `https://api.github.com/repos/TU_USUARIO/flowpos-website/dispatches`
   - **Content type**: `application/json`
   - **Secret**: (generar uno)
   - **Events**: Solo "Releases"
3. En el repo del website, agrega el secret en Settings → Secrets

## 🔧 Configuración

### Actualizar información de contacto

#### WhatsApp
Buscar y reemplazar en todos los archivos HTML:
```
595XXXXXXXXX  →  595981123456  (tu número real)
```

#### Email
En `index.html`, `descargas.html`, `activacion.html`:
```html
soporte@flowpos.com  →  tu-email@dominio.com
```

### Actualizar URLs de descarga

Si cambias de organización en GitHub, actualiza en:

**`js/main.js`**:
```javascript
const CONFIG = {
  github: {
    owner: 'flowpos',        // ← Cambiar aquí
    repo: 'flowpos',         // ← Y aquí
    ...
  }
}
```

**`netlify.toml`**:
```toml
from = "/download/windows"
to = "https://github.com/TU_ORG/TU_REPO/releases/latest/download/FlowPOS-Setup-2.0.0.exe"
```

### Agregar logo e imágenes

1. Coloca tu logo en `assets/images/logo.png`
2. Screenshots en `assets/images/screenshots/`
3. Actualiza las referencias en HTML:

```html
<!-- Reemplazar placeholders de iconos con imágenes reales -->
<img src="assets/images/logo.png" alt="FlowPOS Logo">
<img src="assets/images/screenshots/dashboard.png" alt="Dashboard">
```

## 🛠️ Mantenimiento

### Actualizar versión manualmente

Si necesitas actualizar la versión sin esperar al workflow:

**1. Editar `assets/downloads/releases.json`**:
```json
{
  "latest": {
    "version": "2.1.0",  // ← Actualizar
    "date": "2026-03-01",
    "downloads": {
      "windows": "https://github.com/flowpos/flowpos/releases/download/v2.1.0/FlowPOS-Setup-2.1.0.exe",
      "mac": "...",
      "linux": "..."
    }
  }
}
```

**2. Actualizar `netlify.toml`** (redirects):
```toml
to = "https://github.com/flowpos/flowpos/releases/latest/download/FlowPOS-Setup-2.1.0.exe"
```

**3. Commit y push**:
```bash
git add .
git commit -m "chore: update to FlowPOS v2.1.0"
git push
```

### Agregar nueva página

```bash
# Crear nueva página
touch nueva-pagina.html

# Agregar links en navegación (en todos los HTML)
<a href="nueva-pagina.html">Nueva Página</a>

# Commit
git add nueva-pagina.html
git commit -m "feat: add nueva-pagina.html"
git push
```

### Monitoreo y Analytics (opcional)

#### Agregar Google Analytics
En `<head>` de todos los HTML:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### Netlify Analytics
1. Ve a Netlify Dashboard
2. Site settings → Analytics
3. Enable Netlify Analytics ($9/mes)

## 📊 SEO y Performance

### Checklist de optimización
- ✅ Meta tags correctos
- ✅ Open Graph para redes sociales
- ✅ Sitemap.xml (generarlo con plugin de Netlify)
- ✅ Robots.txt
- ✅ Lazy loading de imágenes
- ✅ Minificación de CSS/JS (opcional)
- ✅ Compresión de imágenes (WebP)

### Generar sitemap.xml (opcional)
Agregar plugin en `netlify.toml`:
```toml
[[plugins]]
  package = "@netlify/plugin-sitemap"
```

## 🐛 Troubleshooting

### Los links de descarga no funcionan
1. Verifica que el release esté publicado en GitHub
2. Revisa que los nombres de archivo coincidan
3. Comprueba las URLs en `releases.json`

### El sitio no se actualiza en Netlify
1. Ve a Netlify Dashboard → Deploys
2. Revisa los logs de error
3. Trigger manual deploy: "Trigger deploy" → "Deploy site"

### GitHub Actions workflow falla
1. Ve a Actions tab en GitHub
2. Click en el workflow fallido
3. Revisa los logs de cada step
4. Común: problemas de permisos (verifica GITHUB_TOKEN)

## 📝 TODO / Mejoras Futuras

- [ ] Agregar más screenshots en landing page
- [ ] Crear página de documentación
- [ ] Agregar blog/changelog
- [ ] Implementar formulario de contacto
- [ ] Agregar testimonios de clientes
- [ ] Video demo del sistema
- [ ] Dark mode toggle
- [ ] Traducciones (Guaraní, Inglés)
- [ ] Comparador de planes interactivo
- [ ] Chat en vivo (opcional)

## 📄 Licencia

Este proyecto (sitio web) es MIT License.
FlowPOS (el software) tiene su propia licencia en el repositorio principal.

## 👥 Contribuir

Para contribuir al sitio web:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m "feat: agregar nueva feature"`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

## 📞 Soporte

- **WhatsApp**: +595 XXX XXXXXX
- **Email**: soporte@flowpos.com
- **Issues**: https://github.com/flowpos/flowpos-website/issues

---

**FlowPOS Website** - Desarrollado con HTML, CSS y JavaScript vanilla.
Desplegado en Netlify con actualización automática.
