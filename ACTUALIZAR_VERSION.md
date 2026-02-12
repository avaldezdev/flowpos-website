# 🚀 Cómo Actualizar la Versión de FlowPOS

## ⚡ Proceso Rápido (2 minutos)

### Paso 1: Subir nuevo release a GitHub

```bash
# En el repositorio flowpos-releases
gh release create v2.0.2 \
  --title "FlowPOS v2.0.2" \
  --notes "Descripción de cambios" \
  FlowPOS-Setup-2.0.2.exe
```

O subir manualmente en: https://github.com/avaldezdev/flowpos-releases/releases/new

---

### Paso 2: Actualizar configuración del sitio web

**Abrir archivo:** `js/config.js`

**Cambiar SOLO estas 2 líneas:**

```javascript
version: '2.0.2',        // ← Cambiar aquí
releaseDate: '2026-02-15', // ← Y aquí
```

**¡Eso es todo!** Las URLs se generan automáticamente.

---

### Paso 3: Commit y push

```bash
git add js/config.js
git commit -m "chore: actualizar a FlowPOS v2.0.2"
git push
```

---

## ✅ Verificación

1. Espera 1-2 minutos que Netlify despliegue
2. Visita: https://flowpos.com/descargas.html
3. Verifica que muestre la nueva versión
4. Prueba la descarga en modo incógnito

---

## 📋 Ejemplo Completo

**Antes:**
```javascript
version: '2.0.1',
releaseDate: '2026-02-11',
```

**Después:**
```javascript
version: '2.0.2',
releaseDate: '2026-02-15',
```

**Resultado automático:**
- ✅ https://github.com/.../v2.0.2/FlowPOS-Setup-2.0.2.exe
- ✅ https://github.com/.../v2.0.2/FlowPOS-2.0.2.dmg
- ✅ https://github.com/.../v2.0.2/FlowPOS-2.0.2.AppImage

---

## 🔧 Configuración Avanzada (Opcional)

Si necesitas cambiar el patrón de nombres de archivos o tamaños:

**Editar en `js/config.js`:**

```javascript
installers: {
  windows: {
    pattern: 'FlowPOS-Setup-{version}.exe',  // ← Cambiar patrón
    size: '~150 MB',                          // ← Cambiar tamaño mostrado
    sizeBytes: 157286400                      // ← Cambiar tamaño en bytes
  }
}
```

---

## ❌ NO Editar Estos Archivos

Ya **NO** necesitas editar:
- ❌ `assets/downloads/releases.json` (eliminado)
- ❌ `js/main.js` (usa config.js automáticamente)
- ❌ `netlify.toml` (sin redirects de versión)
- ❌ `descargas.html` (muestra versión desde JS)

---

## 🐛 Troubleshooting

### Problema: La versión no se actualiza en el sitio

**Solución:**
1. Verifica que el deploy en Netlify terminó (https://app.netlify.com)
2. Limpia caché del navegador (Ctrl+Shift+R)
3. Verifica en modo incógnito

### Problema: URL de descarga da 404

**Solución:**
1. Verifica que el release existe en GitHub: https://github.com/avaldezdev/flowpos-releases/releases
2. Verifica que el nombre del archivo coincide con el patrón
3. Verifica que el release está publicado (no draft)

---

## 📝 Changelog del Sistema

### v2.0 - Sistema Centralizado (2026-02-12)
- ✅ Configuración en un solo archivo (`js/config.js`)
- ✅ URLs generadas automáticamente
- ✅ Actualización en 2 líneas de código
- ✅ Eliminado `releases.json` (ya no necesario)
- ✅ Sin URLs hardcodeadas
- ✅ Proceso de actualización simplificado

### v1.0 - Sistema Anterior
- ❌ 3+ archivos para actualizar
- ❌ URLs duplicadas en múltiples lugares
- ❌ Propenso a errores
- ❌ Proceso manual complejo

---

**¿Preguntas?** Contacta soporte: soporte@flowpos.com
