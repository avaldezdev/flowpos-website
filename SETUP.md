# Guía Rápida de Setup - FlowPOS Website

Esta guía te ayudará a poner el sitio web en línea en menos de 10 minutos.

## ⚡ Setup Rápido (3 pasos)

### 1️⃣ Inicializar Git y Subir a GitHub

```bash
# Navegar a la carpeta del proyecto
cd flowpos-website

# Inicializar repositorio git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: initial commit - FlowPOS website v1.0"

# Crear repositorio en GitHub
# Ve a: https://github.com/new
# Nombre: flowpos-website
# Descripción: Sitio web oficial de FlowPOS - Sistema de Punto de Venta
# Público o Privado: TÚ DECIDES

# Conectar con el repositorio remoto (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/flowpos-website.git

# Subir cambios
git branch -M main
git push -u origin main
```

### 2️⃣ Desplegar en Netlify

#### Opción A: Desde GitHub (Recomendado - Auto-deploy en cada commit)

1. Ve a https://app.netlify.com
2. Crea una cuenta o inicia sesión (puedes usar GitHub)
3. Click **"Add new site"** → **"Import an existing project"**
4. Selecciona **"GitHub"**
5. Busca y selecciona tu repositorio **flowpos-website**
6. Configuración:
   - **Branch to deploy**: `main`
   - **Build command**: (dejar vacío)
   - **Publish directory**: `.` (punto)
7. Click **"Deploy site"**
8. ¡Listo! Espera 1-2 minutos y tu sitio estará en línea

#### Opción B: Drag & Drop (Más rápido, sin auto-deploy)

1. Ve a https://app.netlify.com
2. Arrastra toda la carpeta `flowpos-website` al área de drop
3. ¡Listo! Netlify te dará una URL tipo `https://random-name-123.netlify.app`

### 3️⃣ Personalizar (IMPORTANTE - Hacer antes de lanzar)

#### A. Actualizar número de WhatsApp

**Buscar y reemplazar en todos los archivos HTML:**

```
595XXXXXXXXX  →  595981123456  (tu número real con código de país)
```

**Archivos a modificar:**
- `index.html`
- `descargas.html`
- `activacion.html`

**Comando rápido (Linux/Mac):**
```bash
find . -name "*.html" -type f -exec sed -i 's/595XXXXXXXXX/595981123456/g' {} +
```

**Windows PowerShell:**
```powershell
Get-ChildItem -Filter *.html -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace '595XXXXXXXXX', '595981123456' | Set-Content $_.FullName
}
```

#### B. Actualizar email de soporte

```
soporte@flowpos.com  →  tu-email@tudominio.com
```

#### C. Agregar logo y screenshots

1. Coloca tu logo en: `assets/images/logo.png`
2. Screenshots en: `assets/images/screenshots/`
3. Actualiza las referencias en los HTML (buscar placeholders de iconos)

#### D. Verificar URLs de GitHub

En `js/main.js` línea 13:
```javascript
const CONFIG = {
  github: {
    owner: 'flowpos',      // ← Cambiar por tu org/usuario
    repo: 'flowpos',       // ← Cambiar por tu repo del software
    ...
  }
}
```

## 🔄 Flujo de Trabajo Diario

### Hacer cambios y actualizar el sitio

```bash
# 1. Hacer cambios en los archivos HTML/CSS/JS
# 2. Guardar cambios

# 3. Commit
git add .
git commit -m "fix: corregir typo en landing page"

# 4. Push
git push

# 5. Netlify detecta el cambio y redespliega automáticamente (1-2 min)
```

## 🎨 Personalización Común

### Cambiar colores del tema

En `css/styles.css` y en las clases de Tailwind:
- **Azul primario**: `#2563eb` → buscar y reemplazar
- **Verde**: `#10b981`
- **Rojo**: `#ef4444`

### Agregar nueva sección en landing page

```html
<!-- En index.html, antes del footer -->
<section class="py-20 bg-gray-100">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold text-center mb-12">Nueva Sección</h2>
    <!-- Tu contenido aquí -->
  </div>
</section>
```

### Cambiar precios de los planes

En `index.html`, buscar la sección de pricing y actualizar:
```html
<span class="text-4xl font-bold text-gray-800">Gs 200K</span>
```

## 🌐 Custom Domain (Dominio Personalizado)

### Opción 1: Dominio en Netlify (flowpos.netlify.app)

Es gratis, pero tiene el sufijo `.netlify.app`. Para cambiarlo:

1. En Netlify Dashboard → **Site settings**
2. **Domain management** → **Custom domains**
3. Click **"Options"** → **"Edit site name"**
4. Cambia a algo como: `flowpos-py.netlify.app`

### Opción 2: Tu propio dominio (ej: flowpos.com.py)

1. Compra un dominio en:
   - Namecheap: https://www.namecheap.com
   - Google Domains: https://domains.google
   - Local en Paraguay: consulta con tu proveedor de hosting

2. En Netlify Dashboard:
   - **Domain settings** → **Add custom domain**
   - Ingresa tu dominio: `flowpos.com.py`

3. Configura DNS en tu proveedor de dominio:
   - **Tipo**: A Record
   - **Host**: @
   - **Value**: `75.2.60.5` (Netlify Load Balancer)

   O usa Netlify DNS (más fácil):
   - Netlify te dará nameservers
   - Cámbialos en tu proveedor de dominio

4. Espera 24-48h para propagación DNS

5. Netlify habilitará HTTPS automáticamente (Let's Encrypt)

## 🔧 Troubleshooting

### El sitio no se ve bien en móvil
- Asegúrate de tener la etiqueta viewport en todas las páginas:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Los links de descarga no funcionan
1. Verifica que el release esté publicado en GitHub
2. Revisa que los nombres de archivo sean correctos en `releases.json`
3. Prueba los links directamente en el navegador

### GitHub Actions no se ejecuta
1. Ve a Settings → Actions → General
2. Verifica que "Workflow permissions" esté en "Read and write"
3. Guarda los cambios

### Netlify no actualiza automáticamente
1. Ve a Site settings → Build & deploy
2. Verifica que "Build hooks" esté configurado
3. Revisa los logs en Deploys tab

## 📊 Analytics y Monitoreo (Opcional)

### Google Analytics (Gratis)

1. Crea cuenta en https://analytics.google.com
2. Obtén tu ID (ej: `G-XXXXXXXXXX`)
3. Agrega en el `<head>` de todos los HTML:

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

### Netlify Analytics ($9/mes)

- Más simple, integrado
- No requiere cookies ni JavaScript
- Site settings → Analytics → Enable

## ✅ Checklist Pre-Launch

Antes de compartir la URL con clientes:

- [ ] Número de WhatsApp actualizado
- [ ] Email de contacto correcto
- [ ] URLs de GitHub correctas
- [ ] Logo agregado (o al menos un placeholder decente)
- [ ] Precios de los planes verificados
- [ ] Links de descarga funcionando
- [ ] Probar en móvil (Chrome DevTools)
- [ ] Probar en diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Verificar todos los links internos
- [ ] SSL/HTTPS habilitado (Netlify lo hace automático)
- [ ] Dominio personalizado configurado (si aplica)

## 🚀 Próximos Pasos

1. **Screenshots**: Toma capturas de FlowPOS y agrégalas en `assets/images/screenshots/`
2. **Video demo**: Graba un video corto y súbelo a YouTube, luego embébelo
3. **Testimonios**: Agrega testimonios de clientes (si tienes)
4. **Blog**: Considera agregar un blog para SEO
5. **Formulario de contacto**: Integra Netlify Forms (gratis)

## 📞 ¿Necesitas Ayuda?

Si tienes problemas con el setup:

1. Revisa la documentación: `README.md`
2. Busca el error en Google
3. Netlify Docs: https://docs.netlify.com
4. GitHub Discussions o Issues en el repo

---

**¡Éxito con el lanzamiento! 🎉**

Una vez que esté en línea, comparte el link y comienza a recibir descargas.
