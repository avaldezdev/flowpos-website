# Deploy en Coolify (hosting propio) — FlowPOS Website

El sitio es **estático**. Para servirlo desde tu servidor (Coolify), se agregó un
`Dockerfile` con **nginx** que reproduce las cabeceras, la caché y las
redirecciones que teníamos en Netlify. **Netlify sigue funcionando igual** como
respaldo (ignora el Dockerfile y usa `netlify.toml`).

## 1. (Opcional) Probar local con Docker

Si querés verlo antes de subir (con Docker Desktop abierto):

```bash
docker build -t flowpos-web .
docker run --rm -p 8080:80 flowpos-web
# abrí http://localhost:8080
```

Para confirmar cabeceras y redirecciones:

```bash
curl -I http://localhost:8080/            # debe traer X-Frame-Options, CSP, etc.
curl -I http://localhost:8080/download    # debe responder 301 → /descargas.html
```

## 2. Crear la app en Coolify

1. En Coolify: **New Resource → Public/Private Git Repository**.
2. Repo: `https://github.com/avaldezdev/flowpos-website` · rama `main`.
3. **Build Pack: Dockerfile** (Coolify detecta el `Dockerfile` de la raíz).
4. **Port: 80** (lo que expone nginx).
5. Guardar y **Deploy**.

> Cada vez que hagas `git push` a `main`, Coolify puede redeployar solo (activá
> el webhook/auto-deploy). El mismo push actualiza también Netlify (respaldo).

## 3. Dominio y SSL

1. En Coolify, en la app → **Domains**: poné `https://flowpos.com.py` (y `www` si querés).
2. En **Cloudflare** → DNS: registro **A** de `flowpos.com.py` (y `www`) → **IP del VPS**.
3. ⚠️ Durante la emisión del certificado, dejá esos registros en **"DNS only"
   (nube gris)**. Cuando Coolify emitió el SSL y el sitio abre con `https://`,
   podés activar el proxy (**nube naranja**) para tener la **caché/CDN de
   Cloudflare** adelante (esto compensa que el VPS esté en un solo lugar).

## 4. Verificar

- [ ] `https://flowpos.com.py` abre y se ve bien.
- [ ] `/download` redirige a Descargas; `/activate` y `/activation` a Activación.
- [ ] En Descargas, el botón baja la última versión (viene de GitHub).
- [ ] Candado SSL OK.

## 5. Netlify como respaldo

- No hace falta desconectar Netlify: queda publicando el mismo repo en su URL
  (`sistemaflowpos.netlify.app`) como plan B.
- Si algún día querés que Netlify sea solo respaldo "en frío", desactivá el
  auto-publish en su panel; el sitio queda igual disponible.

---

**Nota:** el sitio usa Tailwind y otros recursos por CDN; la CSP del `nginx.conf`
ya los permite (igual que en Netlify). Si agregás un recurso externo nuevo,
acordate de sumarlo a la CSP.
