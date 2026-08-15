# FlowPOS Website — imagen estática con nginx (para Coolify / cualquier Docker).
# Netlify NO usa este archivo (sigue con netlify.toml), así queda como respaldo.
FROM nginx:alpine

# Configuración propia (cabeceras, caché, redirecciones).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos del sitio.
COPY . /usr/share/nginx/html

# Quitar del sitio publicado los archivos que no son parte de la web.
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/nginx.conf

EXPOSE 80
