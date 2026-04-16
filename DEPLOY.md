# Despliegue en GitHub + Vercel

## Qué necesitas (todo gratis)

- Cuenta en [github.com](https://github.com)
- Cuenta en [vercel.com](https://vercel.com) (login con GitHub)
- Base de datos externa: [neon.tech](https://neon.tech) (PostgreSQL gratuito)

---

## Paso 1 — Base de datos Neon (gratis, 5 min)

1. Entra a [neon.tech](https://neon.tech) → crea cuenta → nuevo proyecto
2. Copia la **Connection String** (empieza con `postgresql://...`)
3. Guárdala, la necesitas en el Paso 3

---

## Paso 2 — Subir a GitHub

En Replit, en el panel izquierdo busca el ícono de **Git** (rama) → **Connect to GitHub** → sigue el flujo para autorizar y crear un repositorio nuevo.

---

## Paso 3 — Configurar Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repositorio de GitHub que acabas de crear
3. Vercel detectará el `vercel.json` automáticamente — no cambies nada de build
4. Antes de dar **Deploy**, ve a **Environment Variables** y agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La connection string de Neon |
| `SESSION_SECRET` | Una cadena aleatoria larga (ej: `upax2024supersecreto!xyz`) |
| `ADMIN_PIN` | `upaxadmin2024` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Tu cuenta de servicio de Google Sheets |
| `GOOGLE_PRIVATE_KEY` | Tu llave privada de Google |
| `GOOGLE_SHEET_ID` | ID de tu hoja de empleados |
| `VITE_API_URL` | Déjalo vacío (la API está en el mismo dominio) |

5. Haz clic en **Deploy** — en ~2 minutos estará vivo

---

## Sin cold starts ni dormirse

Vercel no duerme (a diferencia de Render o Railway free tier):
- El **frontend** es un CDN global — responde en milisegundos desde cualquier parte del mundo
- El **backend** corre como funciones serverless — se despiertan en <200ms
- No necesitas ningún servicio de keep-alive

---

## Actualizaciones automáticas

Cada vez que hagas cambios en Replit y los sincronices a GitHub (Git → Push), Vercel redespliega automáticamente en ~1 minuto. Nunca tienes que entrar a Vercel manualmente.

---

## Tu URL de producción

Vercel te da algo como: `https://upax-hr-chatbot.vercel.app`
Puedes conectar un dominio propio gratis en Settings → Domains.
