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
  menuBtn.addEventListener('click', () => setMenu(!isOpen))

  // Al tocar un enlace, cerrar el menú (si no, queda abierto sobre la página nueva).
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false)
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
