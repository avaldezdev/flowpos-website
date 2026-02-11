/**
 * FlowPOS Website - Main JavaScript
 * Handles OS detection, downloads, and dynamic content
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  github: {
    owner: 'avaldezdev',
    repo: 'flowpos',
    releasesUrl: 'https://api.github.com/repos/avaldezdev/flowpos/releases/latest'
  },
  downloads: {
    windows: {
      filename: 'FlowPOS-Setup-{version}.exe',
      size: '~150 MB',
      icon: 'laptop'
    },
    mac: {
      filename: 'FlowPOS-{version}.dmg',
      size: '~160 MB',
      icon: 'apple'
    },
    linux: {
      filename: 'FlowPOS-{version}.AppImage',
      size: '~155 MB',
      icon: 'box'
    }
  }
}

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
 * Fetches release data from local JSON or GitHub API
 * @returns {Promise<object>} Release data
 */
async function fetchReleaseData() {
  try {
    // First, try to load from local releases.json
    const response = await fetch('assets/downloads/releases.json')
    if (response.ok) {
      const data = await response.json()
      return data.latest
    }
  } catch (error) {
    console.warn('Could not load local releases.json, falling back to defaults')
  }

  // Fallback to default data
  return {
    version: '2.0.0',
    date: '2026-02-11',
    downloads: {
      windows: `https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo}/releases/download/v2.0.0/FlowPOS-Setup-2.0.0.exe`,
      mac: `https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo}/releases/download/v2.0.0/FlowPOS-2.0.0.dmg`,
      linux: `https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo}/releases/download/v2.0.0/FlowPOS-2.0.0.AppImage`
    }
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

    mainDownloadBtn.addEventListener('click', () => {
      handleDownload(detectedOS, releaseData)
    })
  }

  // Update download size
  const downloadSizeElement = document.getElementById('download-size')
  if (downloadSizeElement) {
    downloadSizeElement.textContent = CONFIG.downloads[detectedOS].size
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
  if (windowsBtn) {
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

  // Trigger download immediately
  window.location.href = downloadUrl

  // Show post-download message after a short delay
  // This appears AFTER the browser's save dialog
  setTimeout(() => {
    showPostDownloadMessage()
  }, 1000)
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
 * Shows post-download instructions
 */
function showPostDownloadMessage() {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fade-in'
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
      <div class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="check-circle" class="text-green-600" width="32" height="32"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Descarga en Proceso</h3>
        <p class="text-gray-600 mb-6">El archivo se está descargando. Revisa tu carpeta de Descargas o la ubicación que elegiste.</p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h4 class="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
            <i data-lucide="info" class="text-blue-600" width="18" height="18"></i>
            <span>Próximos pasos:</span>
          </h4>
          <ol class="text-sm text-blue-800 space-y-2">
            <li class="flex items-start space-x-2">
              <span class="font-semibold">1.</span>
              <span>Espera a que complete la descarga (~150 MB)</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="font-semibold">2.</span>
              <span>Ejecuta el archivo <code class="bg-blue-100 px-1 rounded">FlowPOS-Setup-2.0.0.exe</code></span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="font-semibold">3.</span>
              <span>Sigue la guía de activación para obtener tu licencia</span>
            </li>
          </ol>
        </div>

        <div class="flex space-x-3">
          <button onclick="this.closest('.fixed').remove()"
                  class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium">
            Entendido
          </button>
          <a href="activacion.html"
             class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-medium flex items-center justify-center space-x-2">
            <i data-lucide="book-open" width="18" height="18"></i>
            <span>Ver Guía</span>
          </a>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  lucide.createIcons()

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })

  // Auto-close after 15 seconds (optional)
  setTimeout(() => {
    if (modal.parentNode) {
      modal.style.opacity = '0'
      modal.style.transition = 'opacity 0.3s ease'
      setTimeout(() => modal.remove(), 300)
    }
  }, 15000)
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
  menuBtn.className = 'md:hidden text-gray-600 hover:text-blue-600'
  menuBtn.innerHTML = '<i data-lucide="menu" width="24" height="24"></i>'

  // Insert before the last nav child (usually the CTA button)
  const lastNavChild = nav.querySelector('.flex.justify-between').lastElementChild
  lastNavChild.before(menuBtn)

  lucide.createIcons()

  // Toggle menu
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('hidden')
    navLinks.classList.toggle('flex')
    navLinks.classList.toggle('flex-col')
    navLinks.classList.toggle('absolute')
    navLinks.classList.toggle('top-full')
    navLinks.classList.toggle('left-0')
    navLinks.classList.toggle('right-0')
    navLinks.classList.toggle('bg-white')
    navLinks.classList.toggle('shadow-lg')
    navLinks.classList.toggle('p-4')
    navLinks.classList.toggle('space-y-4')
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
