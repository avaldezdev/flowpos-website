# Plan de medición de flowpos.com.py

Cómo saber **cuánta gente llega al sitio, de dónde viene y qué hace** — para el
tráfico que llega solo (Google) y para el que se paga (Google Ads, Meta Ads).

> ## Estado al 2026-10-21
>
> | | |
> |---|---|
> | **Google Analytics 4** | ✅ **Andando.** Propiedad `flowpos.com.py`, ID de medición `G-TB865NGFSX`, puesto en `js/tracking.js`. Verificado contra el sitio en vivo: el navegador pide `google-analytics.com/g/collect` con ese `tid` y `en=page_view`, y los eventos se ven en Tiempo real. |
> | **Search Console ↔ Analytics** | ✅ **Vinculados.** Propiedad de dominio `flowpos.com.py` + flujo "Sitio público". ⚠️ Falta **publicar la colección** en la Biblioteca o los informes no aparecen (ver §3, paso 3). |
> | **Eventos clave (conversiones)** | ✅ **Marcados el 2026-10-25**: `descarga_iniciada` y `contacto_whatsapp`. Tardaron 4 días en poder marcarse porque la lista de Administrar → Eventos → "Eventos recientes" se arma con datos **procesados**. ⚠️ **No es retroactivo**: lo anterior al 25 de octubre no cuenta como conversión. (`purchase` figura ahí como evento clave: lo crea GA4 solo, no tiene datos y es inofensivo.) |
> | **Filtro de tráfico interno** | ✅ **Activo desde el 2026-10-25.** Regla "Oficina FlowPOS" en el flujo de datos (IP de la oficina en notación CIDR `/32`) + el filtro `Internal Traffic` pasado de **Prueba** a **Activo** — en Prueba no excluye nada, sólo etiqueta. Verificado en vivo: la página manda `tt=internal` desde esa conexión. ⚠️ **Si el proveedor te cambia la IP, el filtro deja de funcionar sin avisar.** Ver §4.1. |
> | **Google Ads** | ⬜ Vacío a propósito. Se enciende pegando su ID cuando haya campaña. |
> | **Meta Pixel** | ⬜ Vacío a propósito. Ídem. |
>
> ⚠️ Hay **2 eventos falsos** en los datos del 2026-10-21 (una `descarga_iniciada`
> y un `contacto_whatsapp`) disparados a propósito contra el sitio real para
> comprobar el cableado de punta a punta. Son de ese día nomás.

---

## 1. La idea en una frase

Hoy el sitio es como un local sin cámara ni caja registradora: entra gente, a
veces compran, pero **no hay manera de saber cuántos entraron, por qué puerta ni
qué miraron**. Las herramientas de abajo son esa cámara.

Y hay una urgencia concreta: **Google Analytics no tiene memoria hacia atrás**.
El día que lo creás empieza a contar desde cero. Cada semana que pasa sin
crearlo es una semana de historia que no se recupera nunca. Por eso es lo
primero de la lista, aunque todavía no gastes un guaraní en publicidad.

---

## 2. Lo que ya está construido (no hay que tocarlo)

| Pieza | Dónde | Qué hace |
|---|---|---|
| `js/tracking.js` | las 6 páginas | Carga Google y Meta, y manda los eventos. **Inerte hasta que pegues los IDs.** |
| Permisos del navegador (CSP) | `nginx.conf` **y** `netlify.toml` | Los dominios de Google y Meta ya están habilitados. Sin esto, los píxeles se bloquean **en silencio**: la página se ve bien y no mide nada. |
| `privacidad.html` | el sitio | Google y Meta **exigen** una política de privacidad para aprobar los anuncios. Ya está escrita, y aclara qué se mide y cómo desactivarlo. |
| Eventos de conversión | `js/tracking.js` | Ya están enganchados a los botones reales. No hay que marcar botón por botón. |

### Los tres eventos que ya se miden

| Qué pasó | Se llama (Google) | Se llama (Meta) |
|---|---|---|
| Alguien descargó el instalador | `descarga_iniciada` | `Lead` |
| Alguien hizo clic en un botón de WhatsApp | `contacto_whatsapp` | `Contact` |
| Alguien fue al portal del cliente | `click_portal` | — |

El evento de WhatsApp **además dice de qué botón vino**: si salió de la tarjeta
del Plan Profesional, llega con `origen: plan_profesional`. Eso después permite
contestar "¿qué plan es el que más consultan?".

---

## 3. Qué hacer, en orden

### Paso 1 — Google Analytics 4 · ~10 minutos · ✅ HECHO (2026-10-21)

Es el único de la lista que **no recupera nada hacia atrás**.

1. Entrá a [analytics.google.com](https://analytics.google.com) **con la misma
   cuenta de Google que usaste para Search Console**. Que sea la misma importa:
   es lo que después permite unirlas (paso 2).
2. Crear cuenta → nombre: `FlowPOS`.
3. Crear propiedad → nombre: `flowpos.com.py`, zona horaria **Paraguay**,
   moneda **Guaraní**.
4. Plataforma: **Web** → URL `https://flowpos.com.py` → nombre `Sitio público`.
5. Google te va a mostrar un **ID de medición** con forma `G-XXXXXXXXXX`.
   Copialo.
6. Abrí `js/tracking.js` y pegalo en la primera línea:

   ```js
   ga4: 'G-XXXXXXXXXX',
   ```

7. `git push` → se publica solo.

**Cómo saber que anda:** entrá a Analytics → *Informes* → *Tiempo real*, y abrí
flowpos.com.py en el celular. Te tenés que ver a vos mismo en menos de un minuto.

### Paso 2 — Unir Analytics con Search Console · ~3 minutos · ✅ HECHO

Search Console ya está verificado y sabe **qué escribe la gente en Google** para
encontrarte. Analytics sabe **qué hacen una vez que entran**. Por separado cada
uno cuenta media historia.

En Analytics → *Administrar* → columna izquierda, abajo de todo →
*Vinculaciones con otros productos* → *Enlaces de Search Console* → vincular la
propiedad de dominio `flowpos.com.py` con el flujo *Sitio público*.

### Paso 3 — Publicar la colección de Search Console · ~1 minuto

⚠️ **Vincular no alcanza, y esto no lo avisa nadie.** Con la vinculación hecha,
los informes de Search Console **siguen sin aparecer** en el menú de Informes:
vienen como una colección *sin publicar* en la Biblioteca.

*Informes* → bajar hasta **Biblioteca** (al fondo del menú izquierdo) → buscar la
tarjeta **"Search Console"** → menú ⋮ → **Publicar**.

Recién ahí aparece *Informes → Search Console*, con las dos pantallas que
importan: **Consultas** (qué escribe la gente para llegar) y **Páginas de
destino de Google Orgánico** (a qué página caen).

### Paso 4 — Marcar los eventos clave (conversiones) · ~2 minutos · ✅ HECHO (2026-10-25)

> ⚠️ **La estrella NO hace falta para saber cuántas descargas hubo.** Ese número
> ya está en *Informes → Ver la interacción y la retención → Eventos*, fila
> `descarga_iniciada`, y se cuenta desde el día 1. Lo que la estrella agrega es
> el **contexto**: la tasa de conversión, qué canal trae las descargas, y la
> posibilidad de optimizar una campaña de Google Ads. Vale la pena aclararlo
> porque es la confusión natural: "marcar" suena a "empezar a contar".

Un evento es cualquier cosa que pasa. Un **evento clave** es el que te importa.

*Administrar* → *Visualización de datos* → *Eventos* → pestaña **"Eventos
recientes"** → clic en la **⭐** de:

- `descarga_iniciada`
- `contacto_whatsapp`

`click_portal` **no** se marca: es un cliente que ya tenés, no uno nuevo.

⚠️ **Tres trampas de esta pantalla:**

1. **Los eventos tardan hasta 24 h en aparecer en esa lista**, aunque ya se vean
   en Tiempo real. Se arma con datos procesados. No hay forma de apurarlo.
2. ❌ **El botón "+ Crear evento" NO es esto.** Crea un evento *derivado de otro*
   — viene con `page_view` precargado como disparador, así que si lo confirmás te
   deja una "conversión" que se cuenta en cada vista de página. Números inflados,
   y nada avisa.
3. **Marcar la estrella no es retroactivo.** Lo anterior a la marca no se cuenta.

### Paso 4.1 — Filtrar tu propia conexión · ✅ HECHO (2026-10-25)

Con 15 visitas al mes, **las tuyas propias son una parte enorme del total**. Cada
vez que entrás a mirar el sitio te contabas como visita.

Son **dos pasos**, y hacer sólo el primero no sirve de nada:

1. *Administrar → Flujos de datos → Sitio público → Configurar ajustes de
   etiquetas → Mostrar más → **Definir tráfico interno*** → Crear una regla con
   la IP. (Se puede poner la IP sola en notación CIDR: `1.2.3.4/32` es "esta
   sola dirección".) Esto **sólo etiqueta** el tráfico con `traffic_type=internal`.
2. *Administrar → **Filtros de datos*** → el filtro `Internal Traffic` viene en
   estado **Prueba**, que **no excluye nada**. Hay que pasarlo a **Activo** desde
   el menú ⋮.

⚠️ **Tres cosas que conviene saber:**

- **No es retroactivo y la activación no se deshace**: los datos excluidos
  mientras el filtro está activo no vuelven. Sí se puede volver a poner en Prueba
  de ahí en adelante.
- **La IP de una conexión común CAMBIA.** El día que el proveedor te dé otra, el
  filtro deja de excluirte **en silencio**. Si ves que las visitas suben sin
  motivo, revisá la IP en `api.ipify.org` y actualizá la regla.
- **Sólo cubre esa conexión.** Desde el celular con datos móviles, o desde otra
  oficina, tus visitas se siguen contando.

**Cómo comprobar que funciona** (Google pide hacerlo y es un minuto): abrí el
sitio desde esa conexión y mirá en la consola del navegador que el pedido a
`google-analytics.com/g/collect` lleve `tt=internal`. Si no lo lleva, la regla no
está matcheando la IP.

### Paso 5 — Google Ads · solo cuando vayas a pagar publicidad

1. Creá la cuenta en [ads.google.com](https://ads.google.com) con la misma
   cuenta de Google.
2. *Herramientas* → *Conversiones* → **Importar desde Analytics** las dos que
   marcaste en el paso 3. Es el camino corto y evita contar dos veces.
3. Copiá el **ID de conversión** (`AW-123456789`) y pegalo en `js/tracking.js`:

   ```js
   googleAds: 'AW-123456789',
   ```

4. Si en vez de importarlas creás las conversiones a mano, Google te da por cada
   una una etiqueta larga con barra. Van completas, **con la barra incluida**:

   ```js
   conversiones: {
     descarga: 'AW-123456789/AbC-D_efGh',
     whatsapp: 'AW-123456789/XyZ-1_234K'
   }
   ```

### Paso 6 — Meta (Facebook / Instagram) · solo si vas a anunciar ahí

1. [business.facebook.com](https://business.facebook.com) → *Administrador de
   eventos* → **Crear píxel**.
2. Copiá el número (~15 dígitos) y pegalo:

   ```js
   metaPixel: '123456789012345',
   ```

3. **Verificá el dominio.** Meta te va a dar una línea como
   `<meta name="facebook-domain-verification" content="abc123...">`.
   Va **solo en `index.html`**, en el lugar que ya está marcado con un
   comentario en el `<head>`. Sin esta verificación Meta limita lo que podés
   hacer con los anuncios.

---

## 4. Después de publicar: bumpear la caché

`js/tracking.js` se sirve con caché de un año. Al editarlo hay que subirle el
número de versión en **las 6 páginas**, o el visitante que ya estuvo antes sigue
con el archivo viejo y **no se lo mide**:

```bash
grep -rl "tracking.js?v=" *.html | xargs sed -i "s/tracking.js?v=[0-9]*/tracking.js?v=$(date +%Y%m%d)/"
```

---

## 5. Qué mirar una vez que esté andando

No mires todo. Estos cuatro números contestan casi cualquier pregunta:

| Pregunta | Dónde se contesta |
|---|---|
| ¿Cuánta gente entra y está creciendo? | Analytics → *Adquisición* → *Resumen* |
| ¿De dónde vienen? (Google, redes, directo, anuncios) | Analytics → *Adquisición* → *Canales* |
| ¿Qué buscan en Google para encontrarme? | Search Console → *Rendimiento* → *Consultas* |
| ¿Cuántos descargan o escriben de cada 100 que entran? | Analytics → *Interacción* → *Conversiones* |

**El que de verdad importa es el último.** Mil visitas sin descargas es un
problema del sitio; cien visitas con veinte descargas es un problema de
cantidad, que se arregla con tráfico. Son dos problemas distintos y sin este
número no se distinguen.

---

## 6. Lo que la medición NO va a arreglar

Conviene decirlo para no esperar lo que no va a pasar: **medir no trae gente**.
Search Console ya reportó *"Página de referencia: no se ha detectado ninguna"* —
cero sitios enlazan a flowpos.com.py. Para Google sos un negocio del que nadie
habla.

Lo que mueve esa aguja no es código, y es gratis:

1. **Google Business Profile** — para búsquedas locales en Paraguay pesa más que
   todo lo técnico junto.
2. **El enlace en la bio** de Instagram y Facebook del negocio.
3. **Pedirles el enlace a tres clientes contentos**, o a los directorios y
   cámaras donde FlowPOS ya figure.

---

## 7. Pendiente técnico que sí afecta el posicionamiento

**Compilar Tailwind.** Hoy cada visitante se baja ~300 KB de JavaScript que arman
los estilos **en su celular**. Google usa esa lentitud para rankear y el tráfico
local es mayormente móvil. Es un trabajo de una sesión, toca las 6 páginas y
necesita prueba visual — ver la fila "Velocidad en celular (Core Web Vitals)" en
`flowpos-cloud-docs/docs/24-roadmap-ecosistema.md` §3.4.
