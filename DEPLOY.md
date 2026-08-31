# DEPLOY.md — Notas de Despliegue

> Documento vivo de despliegue del **Cali Mobility / App Ciudadana Backend**.
> Este archivo se actualiza de forma incremental, separado por capítulos temáticos.
> Mantener este archivo sincronizado con la realidad del código, NO solo con intenciones.

---

## Capítulo 1 — Stack y Arquitectura de Despliegue

### 1.1 Stack

| Componente | Tecnología | Notas |
|---|---|---|
| Runtime | Node.js 20 (nodejs20) | Definido en `firebase.json` y `functions.js` |
| Host | Firebase Cloud Functions (v2, HTTP trigger `onRequest`) | Función `appCiudadanaApi` |
| Región | `us-west1` | Definida en `functions.js:8` |
| Recursos | 1 GiB memoria, 300s timeout, 80 de concurrencia | `functions.js:9-11` |
| Base de datos | Postgres (Supabase) | Conexión vía `DATABASE_URL` o `config/config.json` |
| ORM | Sequelize 6 | `src/models/index.js` |
| Auth | Firebase Admin SDK | `src/middleware/authMiddleware.js` |

### 1.2 Estructura del deploy

```
/ (raíz del repo)
├── firebase.json          → configura el deploy (source: src)
├── .firebaserc            → proyecto por defecto: mov-cali-app-ciudadana
└── src/                   → root de Firebase Functions
    ├── functions.js       → entry point de Cloud Functions (v2)
    ├── app.js             → app Express
    ├── all-server.js      → entry point local (nodemon)
    └── config/            → archivos de configuración
```

### 1.3 Cómo se despliega

```bash
# Desde la raíz del repo o desde src/
cd src
firebase deploy --only functions --project mov-cali-app-ciudadana
```

> `package.json:11` ya define el script `"deploy": "firebase deploy --only functions"`.
> El proyecto por defecto está en `.firebaserc` → `mov-cali-app-ciudadana`.

---

## Capítulo 2 — Config Files vs Variables de Entorno (⚠️ CRÍTICO)

> Este capítulo es la fuente de verdad de por qué y cómo se maneja la configuración.
> Surge del análisis de la confusión entre `src/config/*.json` y `process.env.*`.

### 2.1 La regla de oro

> **Env vars = CÓMO corre el proceso (inyectadas por el host).**
> **Config files = QUÉ usa el código (`require()` de archivos).**

### 2.2 Regla específica para Firebase Cloud Functions

Cuando `firebase deploy` sube el código a Cloud Functions, **excluye** ciertos archivos
(definido en `firebase.json:5-20`):

| Archivo | ¿Se sube? | Motivo |
|---|---|---|
| `.env`, `.env.*` | ❌ NO | `firebase.json:14-15` |
| `**/config.json` | ❌ NO | `firebase.json:16` |
| `**/*_key.json` | ❌ NO | `firebase.json:17` |
| `**/secrets.json` | ❌ NO | `firebase.json:18` |
| `**/example.env` | ❌ NO | `firebase.json:19` |

**CONSECUENCIA DIRECTA**:
> Todo lo que el código haga `require("./config/*.json")` **no existe en Cloud Functions**.
> **El único mecanismo que funciona en producción es `process.env`.**

### 2.3 Tabla de decisión

| Config | Local (dev) | Cloud Functions (prod) |
|---|---|---|
| BD (Postgres) | `.env.development` (vía `DATABASE_URL`) | **Secret Manager** → `DATABASE_URL` |
| Firebase key | `account_service_key.json` O `FIREBASE_SERVICE_ACCOUNT` | `FIREBASE_SERVICE_ACCOUNT` env O app default |
| SendGrid | `email_service_key.json` O `SENDGRID_API_KEY` | **Secret** → `SENDGRID_API_KEY` |
| FCM topic | `FCM_TOPIC_NAME_MOBILE` | env var |
| Uploads dir | `UPLOADS_DIR` | env var |
| Sigma SMS | `secrets.json` O `SIGMA_ACCOUNT_KEY` | **Secret** → `SIGMA_ACCOUNT_KEY` |
| Config estática (timezone, URLs) | `*.json` | `*.json` (si se incluye) o env |

### 2.4 Duplicación histórica detectada (por resolver)

> **Problema**: la conexión a Postgres tiene DOS fuentes:
> 1. `process.env.DATABASE_URL` (string completo) — gana si existe (`models/index.js:22`)
> 2. `src/config/config.json` (params separados + password hardcodeada) — fallback
>
> **Riesgo**: `config.json` NO viaja a Cloud Functions (ignorado), por lo que el fallback
> solo aplica en local. Si `DATABASE_URL` no está en prod, la app NO conecta.
>
> **Decisión recomendada**: eliminar la dependencia de `config/config.json` en prod
> y usar siempre `DATABASE_URL` (ver Capítulo 5).

### 2.5 Archivos `.env` y su carga

> La carga la centraliza `src/config/dotenv.js`: primero intenta `.env.[NODE_ENV]`
> (ej. `.env.development`) y, si no existe, cae a `.env`. Resuelve el path relativo
> a `src/`, por lo que funciona desde cualquier CWD (incluye microservicios legacy).

| Archivo | Propósito | ¿Cargado automáticamente? |
|---|---|---|
| `src/.env.example` | Plantilla versionable (SIN secretos) | ❌ No (solo referencia) |
| `src/.env` | Default / fallback | ✅ Sí (via `config/dotenv.js`) |
| `src/.env.development` | Dev local (prioridad si `NODE_ENV=development`) | ✅ Sí (via `config/dotenv.js`) |
| `src/.env.production` | Prod local/emulador (prioridad si `NODE_ENV=production`) | ✅ Sí (via `config/dotenv.js`) |

> En **Cloud Functions**, `firebase.json` NO sube `.env.*`: los valores se inyectan
> vía **Secret Manager** (ver Capítulo 3.2).
>
> Los `.env.mov-cali-app-ciudadana` y `.env.mov-app-ciudadana-cali` (huérfanos)
> fueron **eliminados**.

---

## Capítulo 3 — Variables de Entorno (Catálogo Completo)

> Catálogo de TODAS las `process.env.*` usadas en el código del proyecto
> (excluyendo dependencias de node_modules).

### 3.1 Variables de negocio

| Variable | Microservicio / Archivo | Uso | ¿Crítico? |
|---|---|---|---|
| `NODE_ENV` | Global | Ambiente (dev/test/prod) | ✅ |
| `DB_HOST` | `models/index.js` | Host Postgres | ✅ |
| `DB_PORT` | `models/index.js` | Puerto Postgres (default 5432) | ✅ |
| `DB_NAME` | `models/index.js`, `migrations/*-set-time-zone.js` | Nombre de BD | ✅ |
| `DB_USER` | `models/index.js` | Usuario Postgres | ✅ |
| `DB_PASSWORD` | `models/index.js` | Password Postgres | ✅ |
| `FIREBASE_SERVICE_ACCOUNT` | `authMiddleware.js:8` | Key Firebase Admin (JSON string) | ✅ |
| `SENDGRID_API_KEY` | `sendMail.js:11` | API key SendGrid | ✅ |
| `SENDGRID_EMAIL` | `sendMail.js:12` | Email remitente | ✅ |
| `FCM_TOPIC_NAME_MOBILE` | `notifications/webAlert.js`, `mobileAlert.js` | Topic FCM push | ⚠️ |
| `SIGMA_ACCOUNT_KEY` | `notifications/webAlert.js:17` | Token SMS Sigma | ⚠️ |
| `UPLOADS_DIR` | `fileManagement/upload.js`, `download.js` | Directorio de uploads | ⚠️ |
| `PORT` | `all-server.js`, `fileManagement/index.js` | Puerto servidor local | ⚠️ |
| `TWILIO_MESSAGE_SERVICE_SID` | `webAlert.js` (COMENTADO) | No activo | ❌ |

> **La URL de conexión NO es una variable**: se **construye** en `models/index.js`
> con un template literal a partir de `DB_USER`, `DB_PASSWORD` (con `encodeCredential`),
> `DB_HOST`, `DB_PORT`, `DB_NAME`. Así cada pieza es un secret individual y el
> string se arma en código.

### 3.2 Fuente de verdad de secretos en producción

> **RECOMENDADO (estándar serverless)**: Firebase **Secret Manager**.
> Las secret vars se exponen automáticamente como `process.env.X` en runtime.

```bash
# Configurar una secret var (se pide el valor interactivamente)
firebase functions:secrets:set DB_HOST     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_PORT     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_NAME     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_USER     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_PASSWORD --project mov-cali-app-ciudadana
firebase functions:secrets:set SENDGRID_API_KEY  --project mov-cali-app-ciudadana
firebase functions:secrets:set SENDGRID_EMAIL    --project mov-cali-app-ciudadana
firebase functions:secrets:set SIGMA_ACCOUNT_KEY --project mov-cali-app-ciudadana

# Para usar las secrets en la función, especificarlas en el código (v2):
# funciones.js → onRequest({ ..., secrets: ["DB_HOST", "DB_PORT", "DB_NAME",
#   "DB_USER", "DB_PASSWORD", "SENDGRID_API_KEY", ...] }, app)
```

> **Nota**: el método antiguo `firebase functions:config:set` genera `functions.config()`
> y está **deprecado** en v2. Usar Secret Manager en su lugar.

---

## Capítulo 4 — Service Accounts y Keys de Firebase

### 4.1 Service account key (`account_service_key.json`)

> ⚠️ **Seguridad**: `AUDITORIA.md:32` clasifica la private key expuesta como **C-01 🔴 P0**.
> Este archivo NO debe commitearse (cubierto por `.gitignore:59-60`).

| Proyecto | ID | Service account key actual |
|---|---|---|
| **Desarrollo** | `app-ciudadana-cali` | `src/config/account_service_key.json` |
| **Producción** | `mov-cali-app-ciudadana` | 🔲 PENDIENTE crear |

### 4.2 Donde se usa `account_service_key.json`

| Archivo | Línea | Uso |
|---|---|---|
| `src/middleware/authMiddleware.js` | 10 | Fallback si no hay `FIREBASE_SERVICE_ACCOUNT` |
| `src/create-user-util.js` | 9 | Crear usuarios Firebase |
| `src/seeders/seedAdmin.js` | 12 | Seeder admin |
| 11+ Dockerfiles | — | `COPY workspace/config/account_service_key.json` |

### 4.3 Crear la key de producción

La key de service account **no se genera desde una herramienta MCP**, se crea en
Firebase Console / Google Cloud Console / `gcloud`:

```bash
# Opción: gcloud CLI (requiere auth)
gcloud iam service-accounts keys create src/config/account_service_key_prod.json \
  --iam-account=firebase-adminsdk@mov-cali-app-ciudadana.iam.gserviceaccount.com \
  --project=mov-cali-app-ciudadana
```

> **Recordar**: el `.gitignore:59` (`account_service_key_*`) ya protege el sufijo `_prod`.

---

## Capítulo 5 — Plan de Consolidación de Configuración

> Objetivo: eliminar la duplicación y alinear con el estándar serverless.

### 5.1 Estado deseado

1. **Una sola fuente de verdad para secretos** → env vars / Secret Manager.
2. **Config files SOLO para lo no sensible y estático** (timezone, URLs).
3. **Carga de `.env` explícita y por ambiente**.
4. **Eliminar legendarios** (`.env.mov-*`, password hardcodeada en `config.json`).

### 5.2 Pasos de implementación

- [x] **P1**. Unificar carga de `.env` por ambiente en `app.js` y todos los `index.js`.
      Se creó `src/config/dotenv.js` (módulo central) que resuelve el `.env.[env]`
      relativo a `src/` (funciona desde cualquier CWD, cubre microservicios legacy).
- [x] **P1**. Eliminar password hardcodeada de `src/config/config.json`.
      Ahora `config.json` usa placeholders `DB_*` y el runtime usa `DATABASE_URL`.
- [x] **P1**. Asegurar `DATABASE_URL` como única vía de conexión en prod.
      `models/index.js` usa `DATABASE_URL` (fuente única) con fallback a `DB_*`.
- [x] **P1**. Eliminar `.env.mov-cali-app-ciudadana` y `.env.mov-app-ciudadana-cali`
      (huérfanos, no los carga nada). → **Hecho** (eliminados).
- [x] **P1**. Eliminar `src/config/config.json` y `src/config/config.sample.json`.
      Docker acordado como legacy/no usado → se eliminaron; los Dockerfiles
      microservicios ya no copian `config.json` (la URL se construye en
      `models/index.js` desde `DB_*`). → **Hecho**.
- [x] **P1**. Eliminar la password hardcodeada de `config.json`.
      → **Hecho**: `config.json` eliminado por completo (ya no existe).
- [~] **P2**. Migrar secretos a Firebase Secret Manager.
      → **Parcial**: `functions.js` ya referencia los secrets; falta crearlos con
      `firebase functions:secrets:set` (ver Capítulo 3.2).
- [x] **P2**. Referenciar `secrets` en `functions.js` (v2). → **Hecho**.

### 5.3 Migración a Secret Manager (checklist)

- [ ] Crear secret `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- [ ] Crear secret `SENDGRID_API_KEY` (+ opcional `SENDGRID_EMAIL`)
- [ ] Crear secret `SIGMA_ACCOUNT_KEY`
- [x] Referenciar secrets en `onRequest({ secrets: [...] })` → **Hecho** en `functions.js`.
- [x] Actualizar `.env.production` como referencia (sin valores reales) → **Hecho**.

> La URL de conexión se construye en `models/index.js`, por lo que los secrets
> son las piezas individuales `DB_*` (NO un string `DATABASE_URL`).
>
> Crear los secrets (CLI interactiva, en `mov-cali-app-ciudadana`):
> ```bash
> firebase functions:secrets:set DB_HOST       --project mov-cali-app-ciudadana
> firebase functions:secrets:set DB_PORT       --project mov-cali-app-ciudadana
> firebase functions:secrets:set DB_NAME       --project mov-cali-app-ciudadana
> firebase functions:secrets:set DB_USER       --project mov-cali-app-ciudadana
> firebase functions:secrets:set DB_PASSWORD   --project mov-cali-app-ciudadana
> firebase functions:secrets:set SENDGRID_API_KEY   --project mov-cali-app-ciudadana
> firebase functions:secrets:set SENDGRID_EMAIL     --project mov-cali-app-ciudadana
> firebase functions:secrets:set SIGMA_ACCOUNT_KEY  --project mov-cali-app-ciudadana
> ```
> Luego desplegar: `firebase deploy --only functions --project mov-cali-app-ciudadana`.

---

## Capítulo 6 — Dockerfiles (Microservicios Legacy)

> ⚠️ **Estado: LEGACY — confirmado que NO se usa.** El deploy real es Firebase
> **Cloud Functions**. Los Dockerfiles se mantienen solo por referencia histórica.

| Microservicio | Dockerfiles |
|---|---|
| traffic | `Dockerfile`, `node18.Dockerfile`, `gcp.Dockerfile` |
| fileManagement | `Dockerfile`, `gcp_node18.Dockerfile`, `gcp.Dockerfile` |
| notifications | `Dockerfile`, `gcp.Dockerfile`, `gcp_node18.Dockerfile` |
| admin | `Dockerfile`, `node16.Dockerfile`, `gcp.Dockerfile` |
| users | `Dockerfile`, `gcp.Dockerfile`, `gcp_node18.Dockerfile` |
| thirdParties | `Dockerfile`, `node16.Dockerfile`, `gcp.Dockerfile` |

> Copian `workspace/config/account_service_key.json` al contenedor. La línea
> `COPY workspace/config/config.json` fue **eliminada** (config.json ya no existe;
> el runtime de los microservicios usa `DATABASE_URL` via `models/index.js`).
> Ver `DEPLOYMENT_GUIDE.md` para el workflow con Secret Manager + workspace.

---

## Changelog

- **2026-08-28** — La URL de conexión a BD ahora se **construye en código**:
  - `models/index.js`: se elimina la dependencia de `DATABASE_URL`; la URL se arma
    con un template literal a partir de `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT`/
    `DB_NAME`, usando `encodeCredential` (encodeURIComponent no escapa `! ' ( ) *`).
  - `functions.js`: secrets pasan a ser `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
    `DB_PASSWORD` (+ sendgrid/sigma).
  - `migrations/*-set-time-zone.js`: obtiene el nombre de BD solo de `DB_NAME`.
  - `.env.production`/`.env.development`/`.env.example`: esquema `DB_*` (password crudo).
- **2026-08-28** — Migración a Secret Manager + limpieza de config files:
  - `functions.js`: nuevo `onRequest({ ..., secrets: [...] })` referenciando
    `DATABASE_URL`, `SENDGRID_API_KEY`, `SENDGRID_EMAIL`, `SIGMA_ACCOUNT_KEY`.
  - Eliminados `src/config/config.json` y `src/config/config.sample.json` (Docker
    confirmado como legacy; runtime usa `DATABASE_URL`).
  - Actualizados los 6 Dockerfiles de microservicios: se quitó la línea
    `COPY workspace/config/config.json`.
  - Eliminados los `.env.mov-*` huérfanos. Creada plantilla `src/.env.example`
    versionable (con negación `!src/.env.example` en `.gitignore`).
- **2026-08-28** — Implementación de la consolidación de configuración:
  - Creado `src/config/dotenv.js` (módulo central de carga `.env.[env]` por ambiente,
    relativo a `src/`, usados por `app.js` y los 6 `index.js` de microservicios).
  - `src/models/index.js`: la conexión a BD ahora usa `DATABASE_URL` (fuente única)
    con fallback a `DB_*`. Se eliminó la dependencia de `config/config.json` en runtime.
  - `src/migrations/20230711292758-set-time-zone.js`: obtiene el nombre de BD desde
    `DB_NAME` o `DATABASE_URL` (ya no usa `config/config.json`).
  - Creado `src/.env.development` y `src/.env.production` (con placeholders + comentarios).
- **2026-08-28** — Creación inicial del DEPLOY.md. Documentado: stack, config vs env vars,
  catálogo de env vars, service accounts, plan de consolidación, Dockerfiles legacy.
  Se detectó y documentó la duplicación de conexión a BD y los `.env.*` huérfanos.
