/** Configuracion de Tailwind para el sitio de FlowPOS.
 *
 *  Hasta octubre de 2026 el sitio cargaba `https://cdn.tailwindcss.com`, que son
 *  ~126 KB de JavaScript que arman el CSS EN EL CELULAR del visitante. Ahora el CSS
 *  se compila aca y se commitea ya hecho, asi el Dockerfile de nginx sigue sirviendo
 *  estaticos sin ningun paso de build.
 *
 *  ⚠️ NO agregar un `theme.extend`. El sitio se escribio contra el tema POR DEFECTO
 *  de Tailwind (el CDN no tenia ninguna config), asi que cualquier cosa que se toque
 *  aca cambia como se ve una pagina que hoy esta bien.
 *
 *  @type {import('tailwindcss').Config} */
module.exports = {
  // Donde buscar las clases. Lo que no aparezca en estos archivos NO entra al CSS
  // compilado: la clase existe en el HTML pero no pinta nada.
  content: [
    './index.html',
    './planes.html',
    './descargas.html',
    './activacion.html',
    './privacidad.html',
    './404.html',
    // `js/main.js` arma HTML con clases adentro (el modal que aparece despues de la
    // descarga, los toast, el panel del menu en celular). Sin esta linea esas tres
    // cosas se ven rotas, y SOLO en esos momentos: la pagina quieta se ve perfecta,
    // asi que no te vas a enterar mirando.
    './js/*.js',
  ],

  // Clases que no estan en ningun archivo de arriba y hay que generar igual.
  //
  // Las tarjetas de novedades de `descargas.html` NO se escriben a mano: las escribe
  // `flowpos/scripts/release.mjs` (otro repo) en cada release, entre los marcadores
  // FLOWPOS:RELEASE:*, y commitea directo. Ese script NO corre `npm run build:css`.
  // Entonces: si un release trae, por ejemplo, solo correcciones y ninguna novedad,
  // las clases verdes desaparecen del HTML, el siguiente build las purga, y el
  // release de despues que SI traiga novedades las escribe contra un CSS que ya no
  // las tiene. Anotarlas aca corta esa cadena.
  //
  // Esta lista sale de los `class="..."` de release.mjs. Si alguna vez se toca esa
  // plantilla, hay que volver a sacarla de ahi.
  safelist: [
    'bg-blue-100', 'bg-white', 'border-blue-600', 'border-gray-300', 'border-l-4',
    'flex', 'font-semibold', 'items-center', 'items-start', 'justify-between',
    'mb-2', 'mb-4', 'ml-6', 'mt-1', 'p-8', 'pl-4', 'px-3', 'py-1',
    'rounded-full', 'rounded-xl', 'shadow-md', 'space-x-2', 'space-y-1',
    'space-y-4', 'text-2xl', 'text-blue-600', 'text-blue-700', 'text-blue-800',
    'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-green-600',
    'text-green-700', 'text-lg', 'text-orange-600', 'text-orange-700', 'text-sm',
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}
