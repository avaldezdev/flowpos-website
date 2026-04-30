/**
 * FlowPOS Website - Configuración Centralizada
 *
 * ⚡ ACTUALIZACIÓN RÁPIDA DE VERSIÓN:
 * Para actualizar a una nueva versión, solo cambia estas 2 líneas:
 * - version: 'X.X.X'
 * - releaseDate: 'YYYY-MM-DD'
 *
 * Las URLs de descarga se generan automáticamente.
 */

window.FLOWPOS_CONFIG = {
  // ============================================================================
  // CONFIGURACIÓN PRINCIPAL - Solo cambiar aquí para nuevas versiones
  // ============================================================================

  version: '3.2.7',
  releaseDate: '2026-04-30',

  // ============================================================================
  // REPOSITORIO
  // ============================================================================

  repository: {
    owner: 'avaldezdev',
    repo: 'flowpos-releases',
    // URL base para releases
    get baseUrl() {
      return `https://github.com/${this.owner}/${this.repo}`;
    },
    // URL base para descargas
    get downloadsUrl() {
      return `${this.baseUrl}/releases/download`;
    },
    // URL para API de GitHub
    get apiUrl() {
      return `https://api.github.com/repos/${this.owner}/${this.repo}`;
    }
  },

  // ============================================================================
  // ARCHIVOS DE INSTALACIÓN (patrones de nombres)
  // ============================================================================

  installers: {
    windows: {
      pattern: 'FlowPOS-Setup-{version}.exe',
      size: '~150 MB',
      sizeBytes: 157286400,
      icon: 'laptop'
    },
    mac: {
      pattern: 'FlowPOS-{version}.dmg',
      size: '~160 MB',
      sizeBytes: 167772160,
      icon: 'apple'
    },
    linux: {
      pattern: 'FlowPOS-{version}.AppImage',
      size: '~155 MB',
      sizeBytes: 162529280,
      icon: 'box'
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Genera la URL de descarga para un sistema operativo específico
   * @param {string} os - 'windows', 'mac', o 'linux'
   * @param {string} version - Versión (opcional, usa la actual por defecto)
   * @returns {string} URL completa de descarga
   */
  getDownloadUrl(os, version = this.version) {
    const installer = this.installers[os];
    if (!installer) {
      console.error(`OS no válido: ${os}`);
      return null;
    }

    const filename = installer.pattern.replace('{version}', version);
    return `${this.repository.downloadsUrl}/v${version}/${filename}`;
  },

  /**
   * Obtiene el nombre del archivo instalador
   * @param {string} os - 'windows', 'mac', o 'linux'
   * @param {string} version - Versión (opcional, usa la actual por defecto)
   * @returns {string} Nombre del archivo
   */
  getFileName(os, version = this.version) {
    const installer = this.installers[os];
    if (!installer) return null;
    return installer.pattern.replace('{version}', version);
  },

  /**
   * Obtiene toda la información de descarga para un OS
   * @param {string} os - 'windows', 'mac', o 'linux'
   * @returns {object} Objeto con url, filename, size, etc.
   */
  getDownloadInfo(os) {
    const installer = this.installers[os];
    if (!installer) return null;

    return {
      os: os,
      url: this.getDownloadUrl(os),
      filename: this.getFileName(os),
      size: installer.size,
      sizeBytes: installer.sizeBytes,
      icon: installer.icon,
      version: this.version,
      releaseDate: this.releaseDate
    };
  },

  /**
   * Obtiene URLs de descarga para todos los sistemas operativos
   * @returns {object} Objeto con windows, mac, linux
   */
  getAllDownloadUrls() {
    return {
      windows: this.getDownloadUrl('windows'),
      mac: this.getDownloadUrl('mac'),
      linux: this.getDownloadUrl('linux')
    };
  },

  /**
   * Obtiene la URL de la página de releases
   * @returns {string} URL de la página de releases
   */
  getReleasesPage() {
    return `${this.repository.baseUrl}/releases`;
  },

  /**
   * Obtiene la URL de un release específico
   * @param {string} version - Versión
   * @returns {string} URL del release
   */
  getReleaseUrl(version = this.version) {
    return `${this.repository.baseUrl}/releases/tag/v${version}`;
  }
};

// Congelar el objeto para prevenir modificaciones accidentales
Object.freeze(window.FLOWPOS_CONFIG);

console.log('✅ FlowPOS Config cargado:', window.FLOWPOS_CONFIG.version);
