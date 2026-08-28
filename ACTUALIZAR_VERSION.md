# 🚀 Cómo se actualiza la versión publicada

**No se actualiza a mano.** Lo hace el pipeline de release que vive en el repo de la app:

```bash
node scripts/release.mjs        # en flowpos/
```

Ese script, en una sola corrida: bumpea la versión, construye el instalador, crea el release
en GitHub y **escribe este repo** — `js/config.js` (`version` + `releaseDate`) y las tarjetas
de novedades de `descargas.html` (entre los marcadores `FLOWPOS:RELEASE:*`) — y commitea y
pushea. El push actualiza **https://flowpos.com.py** (Coolify redeploya solo) y de paso
rebuildea Netlify, que quedó como respaldo.

Para ensayar el pipeline sin publicar nada: `node scripts/release.mjs --dry-run`.

---

## 🛟 Fallback manual (solo si el pipeline no está disponible)

### Paso 1: Subir el release a GitHub

```bash
gh release create v3.4.0 \
  --repo avaldezdev/flowpos-releases \
  --title "FlowPOS v3.4.0" \
  --notes "Descripción de cambios" \
  dist/FlowPOS-Setup-3.4.0.exe dist/latest.yml dist/FlowPOS-Setup-3.4.0.exe.blockmap
```

⚠️ `latest.yml` y el `.blockmap` **no son opcionales**: sin ellos la actualización automática
de las instalaciones ya existentes deja de funcionar.

### Paso 2: Actualizar `js/config.js`

Solo estas 2 líneas (las URLs de descarga se generan solas a partir de la versión):

```javascript
version: '3.4.0',
releaseDate: '2026-08-28',
```

### Paso 3: Actualizar `descargas.html`

La tarjeta "Actual" y el historial son **HTML escrito**, no se generan desde JavaScript.
Van entre marcadores; respetar el formato de las tarjetas que ya están:

- `<!-- FLOWPOS:RELEASE:CURRENT:START -->` … `END` → la tarjeta de la versión nueva
- `<!-- FLOWPOS:RELEASE:HISTORY:START -->` … `END` → la versión saliente baja acá, **con sus
  propios puntos**, arriba de todo

### Paso 4: Commit y push

```bash
git add js/config.js descargas.html
git commit -m "release: FlowPOS v3.4.0"
git push
```

---

## 🔧 Configuración avanzada (opcional)

Si cambia el patrón de nombre de los instaladores o el tamaño que se muestra, se edita en
`js/config.js`:

```javascript
installers: {
  windows: {
    pattern: 'FlowPOS-Setup-{version}.exe',  // ← patrón del archivo
    size: '~150 MB',                          // ← tamaño mostrado
    sizeBytes: 157286400                      // ← tamaño en bytes
  }
}
```

---

## ❌ Qué NO tocar

- ❌ `js/main.js` — lee todo de `config.js`
- ❌ Las URLs de descarga en el HTML — se arman solas desde `config.js`
- ❌ `netlify.toml` para versiones — ya no tiene redirects por versión (y solo afecta al respaldo)
- ❌ No hace falta ningún workflow: había uno (`update-releases.yml`) que se eliminó porque fallaba
  todos los días buscando `assets/downloads/releases.json`, un archivo que no existe en este repo.
  La sincronización real la hace `release.mjs`.

---

## 🐛 Problemas frecuentes

### La versión no cambia en el sitio

1. Verificá que el deploy terminó en **Coolify** (app → Deployments). Netlify es el respaldo.
2. Limpiá la caché del navegador (Ctrl+Shift+R) o probá en incógnito.
3. Ojo con la caché de assets: `nginx.conf` sirve `.css`/`.js` con `expires 1y`, así que los
   archivos locales se referencian con `?v=` — si cambió `main.js` y no el `?v=`, el visitante
   sigue con el viejo.

### La URL de descarga da 404

1. Verificá que el release existe: https://github.com/avaldezdev/flowpos-releases/releases
2. Verificá que el nombre del archivo coincide con el patrón de `config.js`
3. Verificá que el release está publicado (no quedó en draft)

---

**¿Dudas?** soporte@flowpos.com
