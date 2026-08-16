/**
 * FlowPOS Website - Main JavaScript
 * Handles OS detection, downloads, and dynamic content
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Usar configuración centralizada desde config.js
const CONFIG = window.FLOWPOS_CONFIG;

// ============================================================================
// OS DETECTION
// ============================================================================

/**
 * Detects the user's operating system
 * @returns {string} 'windows', 'mac', or 'linux'
 */
function detectOS() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform.toLowerCase()

  // Los celulares van PRIMERO. Android se identifica como "Linux" en su navegador y
  // el iPhone como "Mac", así que si se pregunta por escritorio antes, a un Android
  // se le termina ofreciendo el instalador de Linux (que además no existe).
  if (userAgent.indexOf('android') !== -1) {
    return 'android'
  }
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios'
  }
  // iPad moderno: se hace pasar por Mac de escritorio y sólo lo delata que la
  // pantalla es táctil (una Mac no tiene puntos de contacto).
  if (platform.indexOf('mac') !== -1 && navigator.maxTouchPoints > 1) {
    return 'ios'
  }

  if (platform.indexOf('win') !== -1 || userAgent.indexOf('windows') !== -1) {
    return 'windows'
  }

  if (platform.indexOf('mac') !== -1 || userAgent.indexOf('mac') !== -1) {
    return 'mac'
  }

  if (platform.indexOf('linux') !== -1 || userAgent.indexOf('linux') !== -1) {
    return 'linux'
  }

  // Default to Windows if unable to detect
  return 'windows'
}

/** ¿Es un teléfono o tablet? Ahí no se puede instalar FlowPOS. */
function isMobileOS(os) {
  return os === 'android' || os === 'ios'
}

/**
 * Gets OS-specific display information
 * @param {string} os - Operating system name
 * @returns {object} Display information
 */
function getOSInfo(os) {
  const osInfo = {
    windows: {
      name: 'Windows',
      fullName: 'Windows 10/11',
      icon: 'laptop',
      color: 'blue'
    },
    mac: {
      name: 'macOS',
      fullName: 'macOS 10.15+',
      icon: 'apple',
      color: 'gray'
    },
    linux: {
      name: 'Linux',
      fullName: 'Ubuntu/Debian',
      icon: 'box',
      color: 'orange'
    },
    android: {
      name: 'Android',
      fullName: 'Android',
      icon: 'smartphone',
      color: 'gray'
    },
    ios: {
      name: 'iPhone / iPad',
      fullName: 'iPhone / iPad',
      icon: 'smartphone',
      color: 'gray'
    }
  }

  return osInfo[os] || osInfo.windows
}

// ============================================================================
// RELEASES & DOWNLOADS
// ============================================================================

/**
 * Obtiene datos de release desde la configuración centralizada
 * @returns {Promise<object>} Release data
 */
async function fetchReleaseData() {
  // Usar configuración centralizada - sin hardcoded URLs
  return {
    version: CONFIG.version,
    date: CONFIG.releaseDate,
    downloads: CONFIG.getAllDownloadUrls()
  }
}

/**
 * Initializes download page functionality
 */
async function initializeDownloadPage() {
  const detectedOS = detectOS()
  const osInfo = getOSInfo(detectedOS)
  const releaseData = await fetchReleaseData()

  // Update current version display
  const versionElement = document.getElementById('current-version')
  if (versionElement) {
    versionElement.textContent = `v${releaseData.version}`
  }

  // Sin instalador para este sistema (celular, Mac, Linux) → NO ofrecer una descarga
  // que no existe. Antes se armaba igual la URL y el visitante llegaba a un enlace roto.
  if (!CONFIG.isAvailable(detectedOS)) {
    showNoInstallerForOS(detectedOS, osInfo)
    setupAlternativeDownloads(releaseData)
    return
  }

  // Update detected OS display
  const detectedOSElement = document.getElementById('detected-os')
  if (detectedOSElement) {
    detectedOSElement.textContent = osInfo.fullName
  }

  // Update OS icon
  const osIconElement = document.getElementById('os-icon')
  if (osIconElement) {
    osIconElement.setAttribute('data-lucide', osInfo.icon)
    lucide.createIcons() // Re-render icons
  }

  // Update download button
  const mainDownloadBtn = document.getElementById('main-download-btn')
  const downloadBtnText = document.getElementById('download-btn-text')

  if (mainDownloadBtn && downloadBtnText) {
    downloadBtnText.textContent = `Descargar para ${osInfo.name}`
    mainDownloadBtn.disabled = false
    mainDownloadBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed')

    // Guarda contra doble cableado: "Descargar de nuevo" vuelve a llamar a esta
    // función, y sin esto cada clic dispararía la descarga dos veces.
    if (!mainDownloadBtn.dataset.bound) {
      mainDownloadBtn.dataset.bound = '1'
      mainDownloadBtn.addEventListener('click', () => {
        handleDownload(detectedOS, releaseData)
      })
    }
  }

  // Update download size
  const downloadSizeElement = document.getElementById('download-size')
  if (downloadSizeElement) {
    downloadSizeElement.textContent = CONFIG.installers[detectedOS].size
  }

  // Setup alternative download buttons
  setupAlternativeDownloads(releaseData)
}

/**
 * No hay instalador para el sistema del visitante.
 *
 * El caso importante es el celular: FlowPOS es un programa para la PC del mostrador,
 * así que desde el teléfono no hay nada que instalar. En vez de un botón que lleva a
 * un enlace roto, se le da lo que sí le sirve: la dirección para abrir en su
 * computadora, y una forma de mandársela sin tener que copiarla a mano.
 *
 * @param {string} os - Sistema detectado
 * @param {object} osInfo - Datos de presentación del sistema
 */
function showNoInstallerForOS(os, osInfo) {
  const card = document.getElementById('download-card')
  if (!card) return

  const enCelular = isMobileOS(os)
  const urlDescargas = 'https://flowpos.com.py/descargas'

  const titulo = enCelular
    ? 'FlowPOS se instala en una computadora'
    : `Todavía no hay versión para ${osInfo.name}`

  const explicacion = enCelular
    ? `Es el sistema de la caja de tu negocio y funciona en una PC con Windows 10 u 11. Desde ${osInfo.name} no se puede instalar.`
    : 'Por ahora el instalador está disponible sólo para Windows 10 y 11. Escribinos y te avisamos cuando salga.'

  // En celular, mandarse el enlace por WhatsApp es lo que REALMENTE resuelve el
  // problema (copiarlo no sirve de nada si no se puede pegar en la PC), así que va
  // primero y en verde, el color con el que WhatsApp se reconoce en todo el sitio.
  const accionPrincipal = enCelular
    ? `
      <a href="https://wa.me/?text=${encodeURIComponent('Instalar FlowPOS en la computadora: ' + urlDescargas)}"
         target="_blank" rel="noopener"
         class="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-4 rounded-xl font-semibold transition">
        <i data-lucide="message-circle" width="20" height="20"></i>
        Enviar por WhatsApp
      </a>
      <p class="text-xs text-blue-100 mt-2 mb-5">
        Se abre WhatsApp para que elijas a quién mandárselo: a vos mismo, o a quien maneja la computadora.
      </p>

      <div class="bg-white/10 rounded-xl p-5 text-left">
        <p class="text-sm text-blue-100 mb-1">O anotá esta dirección y abrila en tu computadora:</p>
        <p class="text-lg font-bold break-all mb-4">flowpos.com.py/descargas</p>
        <button type="button" id="copiar-enlace"
                class="w-full border border-white/40 text-white px-5 py-3 rounded-lg font-medium hover:bg-white/10 transition flex items-center justify-center gap-2">
          <i data-lucide="copy" width="18" height="18"></i>
          <span>Copiar enlace</span>
        </button>
      </div>`
    : `
      <a href="https://wa.me/595986708565?text=${encodeURIComponent('Hola, me interesa FlowPOS para ' + osInfo.name)}"
         target="_blank" rel="noopener"
         class="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
        <i data-lucide="message-circle" width="18" height="18"></i>
        Avisarme cuando esté
      </a>`

  card.innerHTML = `
    <div class="text-center">
      <i data-lucide="${enCelular ? 'smartphone' : osInfo.icon}" class="mx-auto mb-4 text-white" width="56" height="56"></i>
      <h2 class="text-2xl font-bold mb-2">${titulo}</h2>
      <p class="text-blue-100 mb-6">${explicacion}</p>
      ${accionPrincipal}
      <a href="activacion.html" class="inline-block mt-5 text-sm text-blue-100 underline hover:text-white">
        Mientras tanto, mirá cómo empezar
      </a>
    </div>
  `

  if (typeof lucide !== 'undefined') lucide.createIcons()

  const copiar = document.getElementById('copiar-enlace')
  if (copiar) {
    copiar.addEventListener('click', () => {
      copyToClipboard(urlDescargas)
    })
  }
}

/**
 * Sets up alternative download buttons for all platforms
 * @param {object} releaseData - Release data
 */
function setupAlternativeDownloads(releaseData) {
  // Only setup Windows download (Mac and Linux are in development)
  const windowsBtn = document.getElementById('download-windows')
  if (windowsBtn && !windowsBtn.dataset.bound) {
    windowsBtn.dataset.bound = '1'
    windowsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      handleDownload('windows', releaseData)
    })
  }
}

/**
 * Handles download initiation
 * @param {string} os - Operating system
 * @param {object} releaseData - Release data
 */
function handleDownload(os, releaseData) {
  const downloadUrl = releaseData.downloads[os]

  if (!downloadUrl) {
    showToast('error', 'URL de descarga no disponible')
    return
  }

  // Track download (optional: add analytics here)
  console.log(`Download initiated for ${os}: ${downloadUrl}`)

  // Disparar la descarga con un <a> temporal en vez de `window.location.href`:
  // el navegador la trata como una descarga normal y la página no se mueve.
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = ''
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Estado "descarga iniciada" EN LA MISMA TARJETA (sin modal encima):
  // si el navegador abre su propio diálogo de guardado, no se superponen dos cosas.
  showDownloadStarted(os)
}

/**
 * Reemplaza el contenido de la tarjeta de descarga por el estado "ya empezó",
 * que orienta al usuario hacia el ícono de descargas del navegador.
 * @param {string} os - Operating system
 */
function showDownloadStarted(os) {
  const card = document.getElementById('download-card')
  if (!card) return

  const fileName = CONFIG.getFileName(os) || `FlowPOS-Setup-${CONFIG.version}.exe`

  // Guardar el estado inicial una sola vez, para poder volver con "Descargar de nuevo".
  if (!card.dataset.initialHtml) {
    card.dataset.initialHtml = card.innerHTML
  }

  card.innerHTML = `
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2">Tu descarga ya empezó</h2>
      <p class="text-blue-100 mb-6">
        Buscá la flecha de descargas <strong class="text-white">arriba a la derecha</strong> de tu navegador.
      </p>

      <!-- Dibujo de la barra del navegador con el ícono de descargas resaltado -->
      <svg viewBox="0 0 320 62" class="w-full max-w-sm mx-auto mb-6"
           role="img" aria-label="El ícono de descargas está arriba a la derecha de la barra del navegador">
        <rect x="0" y="10" width="320" height="44" rx="10" fill="#ffffff"></rect>
        <circle cx="24" cy="32" r="4" fill="#cbd5e1"></circle>
        <circle cx="42" cy="32" r="4" fill="#cbd5e1"></circle>
        <circle cx="60" cy="32" r="4" fill="#cbd5e1"></circle>
        <rect x="80" y="22" width="160" height="20" rx="10" fill="#f1f5f9"></rect>
        <circle cx="286" cy="32" r="14" fill="#dbeafe">
          <animate attributeName="r" values="12;17;12" dur="1.6s" repeatCount="indefinite"></animate>
          <animate attributeName="opacity" values="1;0.45;1" dur="1.6s" repeatCount="indefinite"></animate>
        </circle>
        <path d="M286 25 v10 M281 31 l5 5 5-5 M279 41 h14"
              stroke="#2563eb" stroke-width="2.2" fill="none"
              stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>

      <div class="bg-white/10 rounded-xl p-5 text-left mb-6">
        <ol class="space-y-3 text-sm text-blue-50">
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">1</span>
            <span>Esperá a que la barra termine de cargar (son unos ${CONFIG.installers[os] ? CONFIG.installers[os].size : '~150 MB'}).</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">2</span>
            <span>Hacé clic en <code class="bg-white/20 px-1.5 py-0.5 rounded text-white">${fileName}</code> para instalarlo.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">3</span>
            <span>Abrí FlowPOS y empezá a vender: tenés 7 días con todo incluido.</span>
          </li>
        </ol>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="activacion.html" class="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
          <i data-lucide="book-open" width="18" height="18"></i>
          Ver cómo empezar
        </a>
        <button type="button" id="download-again" class="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition">
          <i data-lucide="rotate-ccw" width="18" height="18"></i>
          Descargar de nuevo
        </button>
      </div>
    </div>
  `

  lucide.createIcons()

  // "Descargar de nuevo" restaura la tarjeta original y vuelve a cablear los botones.
  const againBtn = document.getElementById('download-again')
  if (againBtn) {
    againBtn.addEventListener('click', () => {
      card.innerHTML = card.dataset.initialHtml
      // El HTML guardado trae la marca `data-bound`, pero estos nodos son nuevos
      // y no tienen listener: hay que limpiarla para que se vuelvan a cablear.
      card.querySelectorAll('[data-bound]').forEach((el) => delete el.dataset.bound)
      lucide.createIcons()
      initializeDownloadPage()
    })
  }

  // Subir la tarjeta a la vista: el mensaje dice "mirá arriba", así que tiene que
  // verse cerca de la barra del navegador (importa al bajar a "Otras Plataformas").
  card.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ============================================================================
// UI UTILITIES
// ============================================================================

/**
 * Shows a toast notification
 * @param {string} type - 'success', 'error', 'info'
 * @param {string} message - Message to display
 */
function showToast(type, message) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast')
  existingToasts.forEach(toast => toast.remove())

  // Create toast element
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <div class="flex items-center space-x-3">
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"
         class="flex-shrink-0"
         width="20"
         height="20"></i>
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(toast)
  lucide.createIcons()

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 5000)
}

/**
 * Initializes smooth scroll for anchor links
 */
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href')

      // Ignore # and #! links
      if (href === '#' || href === '#!') {
        e.preventDefault()
        return
      }

      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })
}

/**
 * Adds scroll progress indicator
 */
function initializeScrollProgress() {
  const progressBar = document.createElement('div')
  progressBar.className = 'progress-bar'
  progressBar.style.width = '0%'
  document.body.appendChild(progressBar)

  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight - windowHeight
    const scrolled = window.scrollY
    const progress = (scrolled / documentHeight) * 100

    progressBar.style.width = `${Math.min(progress, 100)}%`
  })
}

/**
 * Initializes mobile menu toggle
 */
function initializeMobileMenu() {
  // Add mobile menu button if not exists
  const nav = document.querySelector('nav')
  if (!nav) return

  const navLinks = nav.querySelector('.md\\:flex')
  if (!navLinks) return

  // El panel desplegable usa `absolute top-full`, que se ubica respecto del ancestro
  // POSICIONADO más cercano. En las páginas con la barra fija (inicio, planes) ese
  // ancestro es la barra y todo funciona; donde la barra es estática (descargas,
  // cómo empezar) el navegador tomaba la ventana y abría el menú en top: 812px, o sea
  // fuera de la pantalla: se tocaba la hamburguesa y no pasaba nada.
  if (getComputedStyle(nav).position === 'static') {
    nav.style.position = 'relative'
    // Sin esto el panel puede quedar por debajo de la sección siguiente.
    nav.style.zIndex = '50'
  }

  // Create mobile menu button
  const menuBtn = document.createElement('button')
  // 44×44 es el mínimo recomendado para tocar con el dedo; el ícono sigue siendo de 24
  // y el `-mr-2` compensa el relleno extra para que no se corra la barra.
  menuBtn.className =
    'md:hidden h-11 w-11 -mr-2 flex items-center justify-center text-gray-600 hover:text-blue-600'
  menuBtn.innerHTML = '<i data-lucide="menu" width="24" height="24"></i>'

  // Insert before the last nav child (usually the CTA button)
  const lastNavChild = nav.querySelector('.flex.justify-between').lastElementChild
  lastNavChild.before(menuBtn)

  lucide.createIcons()

  // Clases que se agregan al abrir el panel desplegable en móvil.
  const OPEN_CLASSES = [
    'flex', 'flex-col', 'items-start', 'absolute', 'top-full',
    'left-0', 'right-0', 'bg-white', 'shadow-lg', 'p-4', 'space-y-4'
  ]
  // Clases del layout horizontal que estorban en el panel vertical
  // (space-x-* desplaza los ítems a la derecha; items-center los centra).
  const DESKTOP_ONLY_CLASSES = ['space-x-6', 'items-center']

  let isOpen = false
  const removed = []

  const setMenu = (open) => {
    isOpen = open
    menuBtn.setAttribute('aria-expanded', String(open))
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
    // El ícono pasa a una X: abierto, el mismo botón tiene que ofrecer cerrarlo.
    menuBtn.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}" width="24" height="24"></i>`
    if (typeof lucide !== 'undefined') lucide.createIcons()

    if (open) {
      navLinks.classList.remove('hidden')
      navLinks.classList.add(...OPEN_CLASSES)
      // Guardar y quitar solo las clases de escritorio que la página realmente tenía,
      // para poder restaurarlas tal cual al cerrar.
      DESKTOP_ONLY_CLASSES.forEach((cls) => {
        if (navLinks.classList.contains(cls)) {
          navLinks.classList.remove(cls)
          removed.push(cls)
        }
      })
    } else {
      navLinks.classList.remove(...OPEN_CLASSES)
      navLinks.classList.add('hidden')
      while (removed.length) navLinks.classList.add(removed.pop())
    }
  }

  menuBtn.setAttribute('aria-label', 'Abrir menú')
  menuBtn.setAttribute('aria-expanded', 'false')
  menuBtn.addEventListener('click', (e) => {
    // Cortar la propagación es IMPRESCINDIBLE, no un adorno: al alternar se reemplaza
    // el ícono del botón, así que el elemento tocado queda fuera del documento. El
    // clic seguía subiendo hasta el manejador de "cerrar al tocar afuera", que ya no
    // lo encontraba dentro de la barra y cerraba el menú en el mismo toque. Resultado:
    // tocar el ícono no hacía nada y sólo respondía el relleno de alrededor.
    e.stopPropagation()
    setMenu(!isOpen)
  })

  // Al tocar un enlace, cerrar el menú (si no, queda abierto sobre la página nueva).
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false)
  })

  // Tocar fuera cierra. Es lo que espera cualquiera que use un celular: si no, el
  // menú queda tapando la página y hay que volver a apuntarle al botón para salir.
  // `nav.contains` excluye al propio botón y al panel, que tienen su propio manejo.
  document.addEventListener('click', (e) => {
    if (isOpen && !nav.contains(e.target)) setMenu(false)
  })

  // Escape cierra (teclado, y algunos teclados de celular lo tienen).
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === 'Escape') setMenu(false)
  })

  // Al volver a tamaño escritorio, dejar la barra en su estado normal.
  window.addEventListener('resize', () => {
    if (isOpen && window.innerWidth >= 768) setMenu(false)
  })
}

/**
 * Botón del portal: "Ingresar" vs "Mi cuenta".
 *
 * Este sitio es estático y la cookie de sesión es HttpOnly, así que no puede leerla
 * por su cuenta: le pregunta a la API si el visitante ya tiene sesión abierta. La
 * cookie se comparte entre subdominios (Domain=.flowpos.com.py), por eso viaja sola
 * con `credentials: 'include'`.
 *
 * Reglas de diseño:
 * - NUNCA bloquea la página. Arranca diciendo "Ingresar" y, si hay sesión, cambia.
 * - Ante CUALQUIER problema (API caída, CORS, sin conexión, visitante anónimo) se
 *   queda en "Ingresar", que es el estado correcto para quien no es cliente.
 * - No lee ni muestra datos personales: sólo si hay sesión o no.
 */
function initializePortalLink() {
  const link = document.querySelector('[data-portal-link]')
  if (!link) return

  // Origen de la API. Si algún día cambia el dominio, es lo único que se toca
  // (y hay que sumarlo al connect-src de nginx.conf/netlify.toml).
  const API_ORIGIN = 'https://api.flowpos.com.py'

  fetch(`${API_ORIGIN}/api/auth/get-session`, { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data?.user) return // visitante anónimo → queda "Ingresar"

      const label = link.querySelector('[data-portal-label]')
      if (label) label.textContent = 'Mi cuenta'
      link.setAttribute('title', 'Ir a mi portal de cliente')

      // El ícono pasa de "entrar" a "persona": ya está adentro, no tiene que entrar.
      const icon = link.querySelector('[data-portal-icon]')
      if (icon && typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', 'circle-user')
        lucide.createIcons()
      }
    })
    .catch(() => {
      // Silencio a propósito: que el sitio público no muestre errores de la API.
    })
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('success', 'Copiado al portapapeles'))
      .catch(() => showToast('error', 'Error al copiar'))
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      showToast('success', 'Copiado al portapapeles')
    } catch (err) {
      showToast('error', 'Error al copiar')
    }

    document.body.removeChild(textarea)
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main initialization function
 */
function init() {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons()
  }

  // Initialize smooth scroll
  initializeSmoothScroll()

  // Initialize scroll progress
  initializeScrollProgress()

  // Initialize mobile menu
  initializeMobileMenu()

  // Reconocer al cliente que ya inició sesión
  initializePortalLink()

  // Initialize download page if we're on it
  if (document.getElementById('main-download-btn')) {
    initializeDownloadPage()
  }

  // Add fade-in animation to sections
  const sections = document.querySelectorAll('section')
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in')
      }
    })
  }, observerOptions)

  sections.forEach(section => {
    observer.observe(section)
  })
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Expose utilities to global scope for inline event handlers
window.FlowPOS = {
  copyToClipboard,
  showToast,
  detectOS,
  handleDownload
}
