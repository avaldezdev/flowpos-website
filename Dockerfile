# FlowPOS Website — imagen estática con nginx (para Coolify / cualquier Docker).
# Netlify NO usa este archivo (sigue con netlify.toml), así queda como respaldo.
FROM nginx:alpine

# Configuración propia (cabeceras, caché, redirecciones).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos del sitio (lo que no sirve se excluye en .dockerignore).
COPY . /usr/share/nginx/html

EXPOSE 80
