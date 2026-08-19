/**
 * FlowPOS Website - Medición para Google Ads, Meta Ads y Analytics
 *
 * ⚡ PARA ACTIVAR LA MEDICIÓN: pegá los IDs acá abajo. No hay que tocar nada más.
 *
 * Mientras los IDs estén vacíos este archivo NO carga nada y NO envía ningún dato
 * a Google ni a Meta. El sitio funciona igual. Podés publicarlo así sin problema.
 *
 * ⚠️ Los dominios de Google y Meta ya están habilitados en la cabecera CSP de
 *    `netlify.toml` y `nginx.conf`. Si algún día agregás OTRA herramienta externa
 *    y no la sumás a esas dos cabeceras, el navegador la bloquea en silencio.
 */

window.FLOWPOS_TRACKING = {
  // Google Analytics 4 — formato G-XXXXXXXXXX
  ga4: '',

  // Google Ads — formato AW-123456789
  googleAds: '',

  // Etiquetas de conversión de Google Ads.
  // Pegá el valor COMPLETO que te da Google, con la barra: 'AW-123456789/AbC-D_efGh'
  conversiones: {
    descarga: '',
    whatsapp: ''
  },

  // Meta (Facebook) Pixel — solo números, ~15 dígitos
  metaPixel: ''
}

// ============================================================================
// A partir de acá no hace falta tocar nada.
// ============================================================================

;(function () {
  'use strict'

  var T = window.FLOWPOS_TRACKING
  var hayGoogle = Boolean(T.ga4 || T.googleAds)
  var hayMeta = Boolean(T.metaPixel)

  // Sin IDs configurados no se carga ni un byte de Google ni de Meta.
  if (!hayGoogle && !hayMeta) return

  // --- Google (GA4 + Google Ads comparten el mismo tag) ---------------------
  if (hayGoogle) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    if (T.ga4) window.gtag('config', T.ga4)
    if (T.googleAds) window.gtag('config', T.googleAds)

    var g = document.createElement('script')
    g.async = true
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(T.ga4 || T.googleAds)
    document.head.appendChild(g)
  }

  // --- Meta Pixel -----------------------------------------------------------
  if (hayMeta) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []
      t = b.createElement(e); t.async = !0; t.src = v
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', T.metaPixel)
    window.fbq('track', 'PageView')
  }

  /**
   * Envía un evento a todas las plataformas configuradas.
   * @param {string} nombre - Nombre del evento en GA4 (en español, snake_case)
   * @param {string} eventoMeta - Evento estándar de Meta ('Lead', 'Contact', ...) o '' para omitir
   * @param {string} conversionAds - Etiqueta completa de Google Ads o '' para omitir
   * @param {Object} [datos] - Datos extra del evento
   */
  function enviar(nombre, eventoMeta, conversionAds, datos) {
    datos = datos || {}

    if (hayGoogle) {
      // transport_type 'beacon' evita que el evento se pierda cuando el clic
      // navega a otra página (típico en los enlaces de WhatsApp).
      var params = {}
      for (var k in datos) params[k] = datos[k]
      params.transport_type = 'beacon'
      window.gtag('event', nombre, params)

      if (conversionAds) {
        window.gtag('event', 'conversion', { send_to: conversionAds })
      }
    }

    if (hayMeta && eventoMeta) {
      window.fbq('track', eventoMeta, datos)
    }
  }

  // --- Eventos de conversión ------------------------------------------------

  // 1. Descarga del instalador. `main.js` dispara este evento desde handleDownload().
  document.addEventListener('flowpos:descarga', function (e) {
    var os = (e.detail && e.detail.os) || 'desconocido'
    enviar('descarga_iniciada', 'Lead', T.conversiones.descarga, {
      content_name: 'Instalador FlowPOS',
      sistema_operativo: os
    })
  })

  // 2, 3 y 4. Clics en enlaces. Se usa delegación: un solo listener para todo el
  //    sitio, así no hay que tocar ni marcar cada botón uno por uno.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]')
    if (!a) return

    // El enlace temporal que crea handleDownload() para disparar la descarga
    // también genera un clic. Se ignora acá porque esa descarga ya se cuenta
    // con el evento 'flowpos:descarga'; si no, se contaría dos veces.
    if (a.hasAttribute('data-notrack')) return

    var href = a.getAttribute('href') || ''

    // 2. Contacto por WhatsApp (botón flotante, soporte, footer, planes).
    if (href.indexOf('wa.me/') !== -1) {
      // El texto pre-cargado del mensaje nos dice de qué botón vino.
      var plan = href.match(/Plan%20(Inicio|Profesional|Total)/i)
      enviar('contacto_whatsapp', 'Contact', T.conversiones.whatsapp, {
        origen: plan ? 'plan_' + plan[1].toLowerCase() : 'soporte',
        pagina: location.pathname
      })
      return
    }

    // 3. Ida al portal del cliente (registro / ingreso).
    if (href.indexOf('app.flowpos.com.py') !== -1) {
      enviar('click_portal', '', '', { pagina: location.pathname })
      return
    }

    // 4. Descarga directa desde GitHub (enlaces alternativos por sistema operativo).
    if (href.indexOf('github.com') !== -1 && href.indexOf('/releases/download/') !== -1) {
      enviar('descarga_iniciada', 'Lead', T.conversiones.descarga, {
        content_name: 'Instalador FlowPOS',
        sistema_operativo: 'enlace_directo'
      })
    }
  }, true)
})()
