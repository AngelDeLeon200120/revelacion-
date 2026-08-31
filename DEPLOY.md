# Despliegue: frontend en Vercel + backend en Hostinger

Arquitectura:

| Parte | Dónde vive | URL |
|---|---|---|
| Frontend (React/Vite) | **Vercel** (desde el repo) | `https://tudominio.com` (o `https://<proyecto>.vercel.app`) |
| Backend (Node.js + Express) | App de Node.js de **Hostinger** | `https://api.tudominio.com` |
| Base de datos | MySQL de Hostinger | (interno) |

> Reemplazá `tudominio.com` por tu dominio real en todo el documento.
> El dominio puede quedar apuntado a Vercel (frontend) y usar un subdominio `api.` hacia Hostinger.

---

## 1. Base de datos MySQL (Hostinger)

1. hPanel → **Bases de datos → MySQL**.
2. Creá una base y un usuario (Hostinger les pone prefijo, p. ej. `u123456789_revelacion`).
   Anotá: **nombre de base**, **usuario**, **contraseña**.
3. Marcá el usuario con **todos los privilegios** sobre esa base.
4. Abrí **phpMyAdmin** → pestaña **SQL** → pegá el contenido de
   [`backend/sql/schema.sql`](backend/sql/schema.sql) → Ejecutar. Crea la tabla `invitados`.
   - [`backend/sql/2026-08-30_drop_placaVehiculo.sql`](backend/sql/2026-08-30_drop_placaVehiculo.sql)
     **no hace falta** en una base nueva (era para la base local vieja).

---

## 2. Subdominio para el API (Hostinger)

1. hPanel → **Dominios → Subdominios** → creá `api` → queda `api.tudominio.com`.
2. Esperá a que Hostinger le emita el **SSL** (Seguridad → SSL).

> Si el dominio principal lo vas a usar en Vercel, en Hostinger igual podés tener el
> subdominio `api.` mientras los nameservers/DNS del dominio permitan crear ese registro.
> Alternativa simple: dejar el dominio completo en Hostinger y usar el `.vercel.app` para el
> frontend, o al revés. Lo importante es que `api.tudominio.com` resuelva al hosting.

---

## 3. Subir el código del backend (Hostinger)

Subí la carpeta `backend/` **sin** `node_modules` a una carpeta del hosting, p. ej.
`~/revelacion-api` (Administrador de archivos, SFTP, o Git).

Sí van: `index.js`, `package.json`, `package-lock.json`, `config/`, `controllers/`,
`routes/`, `assets/`, `sql/`.
**No** subas: `node_modules/`, `.env`.

---

## 4. Crear la App de Node.js (Hostinger)

1. hPanel → **Sitios web → tudominio.com → Avanzado → Node.js**.
2. **Crear aplicación**:
   - **Versión de Node**: 20 (o la más nueva).
   - **Application root**: la carpeta del backend (`revelacion-api`).
   - **Application URL**: `api.tudominio.com`.
   - **Application startup file**: `index.js`.
3. **Variables de entorno** (basate en [`backend/.env.example`](backend/.env.example)):

   ```
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=u123456789_revelacion
   DB_PASSWORD=la_contraseña_de_la_base
   DB_NAME=u123456789_revelacion
   ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
   API_PUBLIC_URL=https://api.tudominio.com
   GMAIL_USER=tucorreo@gmail.com
   GMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

   - En `ALLOWED_ORIGINS` poné el dominio final del frontend. Los deploys `*.vercel.app`
     (producción y previews) **ya están permitidos por defecto** en el código, no hace falta listarlos.
   - `GMAIL_PASS` = **contraseña de aplicación** de Google (Cuenta de Google → Seguridad →
     Verificación en 2 pasos → Contraseñas de aplicaciones), no la contraseña normal.
   - **No** pongas `PORT`: Hostinger lo asigna solo.
4. **Run NPM Install** → **Start / Restart**.
5. Probá:
   - `https://api.tudominio.com/` → JSON con `"API de Revelación de Género"`.
   - `https://api.tudominio.com/health` → `status: "OK"`, `database: "Conectado"`.

---

## 5. Desplegar el frontend en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New → Project** → importá el repo de GitHub.
2. En la configuración del proyecto:
   - **Root Directory**: `frontend`  ← importante, el repo tiene `frontend/` y `backend/`.
   - Framework Preset: **Vite** (lo detecta solo). Build y output ya vienen en
     [`frontend/vercel.json`](frontend/vercel.json).
3. **Environment Variables** → agregá:
   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://api.tudominio.com` |

   Esto pisa el valor de [`frontend/.env.production`](frontend/.env.production).
   Ponelo para los 3 entornos (Production, Preview, Development).
4. **Deploy**. Queda en `https://<proyecto>.vercel.app`.
5. (Opcional) **Settings → Domains** → agregá `tudominio.com` y seguí las instrucciones de DNS
   de Vercel. Cuando el dominio quede en Vercel, actualizá `ALLOWED_ORIGINS` en Hostinger.

El archivo `vercel.json` ya incluye el *rewrite* para que `/confirmar`, `/admin` y `/respuesta`
(React Router) funcionen al recargar. El `.htaccess` de `frontend/public/` **no se usa en Vercel**
(solo sirve si algún día subís el `dist/` a un Apache/Hostinger).

---

## 6. Pruebas finales

1. Abrí la URL del frontend → carga la invitación.
2. `/confirmar` → llená y enviá:
   - Redirige a `/respuesta`.
   - Llega el correo (revisá spam).
   - En phpMyAdmin aparece la fila en `invitados`.
3. `/admin` → se ve la tabla.
4. F5 estando en `/admin` → no debe dar 404.

---

## Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| Form da "Network Error" / CORS | `VITE_API_URL` mal puesto en Vercel, o `ALLOWED_ORIGINS` en Hostinger no coincide **exacto** con el dominio (con `https://`, sin barra final). Reiniciá la app de Node tras cambiar variables. |
| `/health` dice base "Desconectado" | Revisá `DB_USER/DB_PASSWORD/DB_NAME` (con prefijo `u........_`) y que el usuario tenga privilegios. |
| 404 al recargar en `/admin` (Vercel) | Falta el `rewrite` — verificá que `frontend/vercel.json` se subió y que el Root Directory del proyecto es `frontend`. |
| Assets 404 / pantalla en blanco | Build con `base` distinto de `/`. Verificá `frontend/vite.config.js` (`base: '/'`). |
| No llegan correos | `GMAIL_PASS` debe ser contraseña de aplicación. Si Hostinger bloquea SMTP saliente, usá una casilla del propio Hostinger y cambiá `host`/`service` en `nodemailer` dentro de `backend/controllers/invitadoController.js`. |
| La app de Node no arranca | Logs en el panel de Node.js. Casi siempre es una variable faltante (`DB_HOST/DB_USER/DB_PASSWORD/DB_NAME` son obligatorias; la app se cierra si falta alguna). |

---

## Actualizaciones futuras

- **Frontend**: `git push` a la rama de producción → Vercel redeploya solo.
- **Backend**: subir los archivos cambiados a la carpeta de la app en Hostinger → **Restart**
  en el panel de Node.js (y **Run NPM Install** si cambió `package.json`).
