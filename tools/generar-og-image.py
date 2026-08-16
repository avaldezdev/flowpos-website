# Genera la imagen de compartir (og:image) de FlowPOS: 1200x630 PNG.
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BLUE_TOP = (37, 99, 235)      # #2563eb
BLUE_BOT = (23, 58, 155)      # un poco mas oscuro que #1d4ed8 para dar profundidad
WHITE = (255, 255, 255)
LIGHT = (191, 219, 254)       # #bfdbfe

FONT_B = "C:/Windows/Fonts/segoeuib.ttf"
FONT_R = "C:/Windows/Fonts/segoeui.ttf"
FONT_SB = "C:/Windows/Fonts/seguisb.ttf"

# --- fondo: degradado diagonal suave -------------------------------------
base = Image.new("RGB", (W, H), BLUE_TOP)
d = ImageDraw.Draw(base)
for y in range(H):
    t = y / (H - 1)
    c = tuple(int(BLUE_TOP[i] + (BLUE_BOT[i] - BLUE_TOP[i]) * t) for i in range(3))
    d.line([(0, y), (W, y)], fill=c)

# brillo diagonal muy sutil arriba a la izquierda
glow = Image.new("L", (W, H), 0)
gd = ImageDraw.Draw(glow)
gd.ellipse([-380, -460, 900, 420], fill=42)
base = Image.composite(Image.new("RGB", (W, H), (59, 130, 246)), base, glow)

# --- isotipo: baldosa blanca con la bolsa en azul ------------------------
S = 4                     # supersampling solo para el icono
TILE = 108
icon = Image.new("RGBA", (TILE * S, TILE * S), (0, 0, 0, 0))
idr = ImageDraw.Draw(icon)
idr.rounded_rectangle([0, 0, TILE * S - 1, TILE * S - 1], radius=26 * S, fill=WHITE)

# bolsa de compras (lucide shopping-bag), viewBox 24x24 centrado en la baldosa
k = TILE * S / 24 * 0.60                      # escala del icono dentro de la baldosa
ox = (TILE * S - 24 * k) / 2
oy = (TILE * S - 24 * k) / 2
def p(x, y):
    return (ox + x * k, oy + y * k)

lw = max(1, int(2 * k))
idr.line([p(6, 2), p(3, 6), p(3, 20)], fill=BLUE_TOP, width=lw, joint="curve")
idr.line([p(3, 20), p(3, 22), p(21, 22), p(21, 6)], fill=BLUE_TOP, width=lw, joint="curve")
idr.line([p(21, 6), p(18, 2), p(6, 2)], fill=BLUE_TOP, width=lw, joint="curve")
idr.line([p(3, 6), p(21, 6)], fill=BLUE_TOP, width=lw)
# asa: media circunferencia inferior, centro (12,10) radio 4
idr.arc([*p(8, 6), *p(16, 14)], start=0, end=180, fill=BLUE_TOP, width=lw)

icon = icon.resize((TILE, TILE), Image.LANCZOS)
LOGO_X, LOGO_Y = 88, 74
base.paste(icon, (LOGO_X, LOGO_Y), icon)

# --- textos ---------------------------------------------------------------
d = ImageDraw.Draw(base)
f_brand = ImageFont.truetype(FONT_B, 66)
f_head = ImageFont.truetype(FONT_B, 60)
f_sub = ImageFont.truetype(FONT_R, 30)
f_url = ImageFont.truetype(FONT_SB, 30)

# marca, centrada verticalmente contra la baldosa
bx = LOGO_X + TILE + 26
bbox = d.textbbox((0, 0), "FlowPOS", font=f_brand)
d.text((bx, LOGO_Y + (TILE - (bbox[3] - bbox[1])) / 2 - bbox[1]), "FlowPOS", font=f_brand, fill=WHITE)

# titular
y = 264
for line in ["Sistema de Punto de Venta", "y Facturación para Paraguay"]:
    d.text((88, y), line, font=f_head, fill=WHITE)
    y += 76

# subtitulo
d.text((88, y + 26), "Funciona sin internet  ·  7 días completos  ·  Después seguís gratis",
       font=f_sub, fill=LIGHT)

# dominio abajo, con una linea de acento
d.rounded_rectangle([88, 536, 92, 572], radius=2, fill=LIGHT)
d.text((110, 538), "flowpos.com.py", font=f_url, fill=WHITE)

base.save("assets/images/og-image.png",
          format="PNG", optimize=True)
print("ok", base.size)
