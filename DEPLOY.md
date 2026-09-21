# DEPLOY.md — Guía de Despliegue

> Documentación oficial de despliegue del backend de **App Ciudadana — Alcaldía de Cali**.

---

## 1. Descripcion

Backend de la **App Ciudadana** para la **Alcaldía de Cali**, que sirve como API central para la aplicación móvil y el panel web de administración. Proporciona endpoints para gestión de usuarios, notificaciones de seguridad, tráfico y movilidad, terceros (turismo y transporte), gestión de archivos, y administración de roles.

**Proposito:** API REST para la aplicación de movilidad y servicios ciudadanos de Cali
**Cliente/Usuario:** Alcaldía de Santiago de Cali — Secretaría de Movilidad
**Tipo de aplicacion:** Backend monolítico con microservicios internos (Firebase Cloud Functions + Express + PostgreSQL)
**Nota de arquitectura:** Los microservicios anteriormente desplegados en Google Cloud Run (Docker) fueron consolidados en Firebase Cloud Functions como unica plataforma de producción. Los Dockerfiles permanecen solo como referencia historica.

---

## 2. Fuente

| Propiedad | Valor |
|---|---|
| Propietario | `Secretaría de Movilidad de Santiago de Cali` |
| Rama principal | `main` |
| Proyecto Firebase | `mov-cali-app-ciudadana` |

---

## 3. Tecnologias Usadas

### Lenguajes
- **Node.js 20** — Runtime de ejecución (`firebase.json`)

### Frameworks
- **Express 4.18** — Framework HTTP (`src/app.js`)
- **Firebase Functions v2** — Plataforma serverless (`src/functions.js`)
- **Sequelize 6** — ORM para PostgreSQL (`src/models/index.js`)

### SDKs y Librerias Principales
- **firebase-admin 11.11** — Autenticación y servicios de Firebase
- **firebase-functions 5.1** — Definición de Cloud Functions
- **nodemailer 10.x** — Envío de correos electrónicos (proveedor activo)
- **axios 1.6** — Cliente HTTP para servicios externos
- **joi 17.11** — Validación de esquemas
- **@turf/turf 6.5** — Operaciones geoespaciales
- **busboy 1.6** — Carga de archivos (proveedor activo, reemplaza a multer)
- **node-xlsx 0.23** — Lectura/escritura de Excel
- **luxon 3.4** — Manejo de zonas horarias
- **pg 8.11 / pg-hstore 2.3** — Driver PostgreSQL

### Librerias Inactivas o Reemplazadas
- **@sendgrid/mail 7.7** — ~~Envío de correos~~ **Inactivo**. SendGrid fue deshabilitado en favor de **nodemailer 10.x**. La librería permanece en `package.json` pero no se utiliza en producción. La variable `EMAIL_PROVIDER` en `sendMail.js` permite alternar, pero el proveedor activo es nodemailer.
- **multer 1.4** — ~~Carga de archivos~~ **Reemplazado**. Multer fue sustituido por **busboy 1.6** para el manejo de uploads. El middleware `src/middleware/uploadMiddleware.js` utiliza Busboy directamente. Multer permanece en `package.json` por compatibilidad pero no se usa activamente.

### Infraestructura
- **Firebase Cloud Functions** — Hosting serverless (región `us-west1`, 1 GiB RAM, 300s timeout, 80 concurrencia) — **Plataforma activa de despliegue**
- **Google Cloud Secret Manager** — Gestión de secretos en producción
- **PostgreSQL** — Base de datos relacional
- **Firebase Storage** — Almacenamiento de archivos
- **Firebase Cloud Messaging (FCM)** — Notificaciones push

### Infraestructura Deprecated
- **~~Google Cloud Run~~** — ~~Microservicios Docker~~ **DEPRECADO**. Los microservicios (usuarios, notificaciones, terceros, file management, traffic) se desplegaban anteriormente en Google Cloud Run con contenedores Docker. Esta via fue reemplazada por **Firebase Cloud Functions** como unica plataforma de despliegue en producción. Los Dockerfiles permanecen en el repositorio (`src/microservices/*/Dockerfile`) solo como referencia historica.
- **~~Docker (produccion)~~** — ~~Contenedores para despliegue~~ **DEPRECADO para producción**. Docker solo debe usarse para desarrollo local si se desea aislar microservicios. El despliegue real se realiza exclusivamente via Firebase CLI.

### Herramientas de Desarrollo
- **Firebase CLI** — Despliegue y gestión de funciones
- **gcloud CLI** — Gestión de Secret Manager
- **Docker** — Contenedores para desarrollo local (no para despliegue)
- **nodemon 3.0** — Hot reload en desarrollo
- **Jest 29.7** — Testing
- **Prettier 3.0 / ESLint 8.53** — Formato y linting

---

## 4. Guia de Creacion del Entorno de Desarrollo

### 4.1 Prerequisitos

| Herramienta | Version | Proposito | Estado |
|---|---|---|---|
| Node.js | 20.x | Runtime de ejecución | Activo |
| npm | Bundled con Node | Gestión de dependencias | Activo |
| Firebase CLI | Ultima | Despliegue a Cloud Functions | Activo |
| gcloud CLI | Ultima | Gestión de Secret Manager | Activo |
| Docker | Ultima (opcional) | Desarrollo local únicamente | **Solo desarrollo** |
| PostgreSQL | Cualquiera | Base de datos local (desarrollo) | Activo |

**Cuentas y permisos:**
- Cuenta de Google con acceso al proyecto Firebase `mov-cali-app-ciudadana`
- Permisos de Secret Manager en GCP (para despliegue)
- Cuenta de servicio Firebase para desarrollo (`account_service_key.json`)

### 4.2 Variables de Entorno

Variables definidas en `src/.env.example`. En produccion (Firebase Cloud Functions) se inyectan via Secret Manager.

| Variable | Obligatoria | Descripcion | Ejemplo | Modulo |
|---|---|---|---|---|
| `NODE_ENV` | Si | Entorno de ejecucion | `production` | Global |
| `PORT` | No | Puerto del servidor local | `3000` | `all-server.js` |
| `DB_HOST` | Si | Servidor PostgreSQL | `localhost` | `models/index.js` |
| `DB_PORT` | Si | Puerto PostgreSQL | `5432` | `models/index.js` |
| `DB_NAME` | Si | Nombre de la base de datos | `app_ciudadana_dev` | `models/index.js`, `migrations/` |
| `DB_USER` | Si | Usuario de PostgreSQL | `postgres` | `models/index.js` |
| `DB_PASSWORD` | Si | Contraseña de PostgreSQL | `******` | `models/index.js` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No | Ruta al archivo de cuenta de servicio | `./config/account_service_key.json` | `authMiddleware.js` |
| `FIREBASE_SERVICE_ACCOUNT` | No | Contenido JSON de la cuenta de servicio | `{ "type": "service_account", ... }` | `authMiddleware.js` |
| `FIREBASE_STORAGE_BUCKET` | Si | Bucket de Firebase Storage (sin `gs://`) | `mov-cali-app-ciudadana.appspot.com` | `fileManagement/`, `config/` |
| `FCM_TOPIC_NAME_MOBILE` | No | Topic FCM para notificaciones push | `mobile_notifications` | `notifications/` |
| `UPLOADS_DIR` | No | Directorio de cargas locales | `./uploads` | `fileManagement/` |
| `EMAIL_PROVIDER` | No | Proveedor de correo activo | `nodemailer` | `sendMail.js` |
| `GMAIL_USER` | No | Usuario de Gmail para nodemailer | `noreply@cali.gov.co` | `sendMail.js` |
| `GMAIL_APP_PASSWORD` | No | Contraseña de aplicacion Gmail | `******` | `sendMail.js` |
| `SENDGRID_API_KEY` | No | API Key de SendGrid | `SG.xxxxx` | `sendMail.js` |
| `SENDGRID_EMAIL` | No | Correo remitente SendGrid | `noreply@cali.gov.co` | `sendMail.js` |
| `SIGMA_ACCOUNT_KEY` | No | Token SMS (Sigma) | `******` | `notifications/` |

**Notas sobre variables:**
- `DB_USER` y `DB_PASSWORD` se codifican con `encodeURIComponent` al construir la URL de conexion en `src/models/index.js`.
- `FIREBASE_SERVICE_ACCOUNT` y `FIREBASE_SERVICE_ACCOUNT_PATH` son alternativas: se usa el JSON inline o la ruta al archivo, no ambos.
- `SENDGRID_API_KEY` y `SENDGRID_EMAIL` permanecen por compatibilidad pero estan **inactivas** — el proveedor activo es nodemailer (`EMAIL_PROVIDER=nodemailer`).
- `GMAIL_USER` y `GMAIL_APP_PASSWORD` son las credenciales para el transporte de nodemailer con Gmail.

### 4.3 Archivos de Configuracion

| Archivo | Ubicacion | Versionado | Plantilla | Proposito |
|---|---|---|---|---|
| `.firebaserc` | Raiz | Si | No | Proyecto Firebase activo |
| `firebase.json` | Raiz | Si | No | Config de Cloud Functions |
| `deploy.sh` | Raiz | Si | No | Script de despliegue automatizado |
| `storage.rules` | Raiz | Si | No | Reglas de Firebase Storage |
| `src/.env.example` | `src/` | Si | No | Plantilla de variables de entorno |
| `src/.env` | `src/` | No | Si (de `.env.example`) | Variables por defecto |
| `src/.env.development` | `src/` | No | No | Variables de desarrollo |
| `src/.env.production` | `src/` | No | No | Variables de producción |
| `src/config/config.js` | `src/config/` | Si | No | Config de base de datos |
| `src/config/dotenv.js` | `src/config/` | Si | No | Modulo de carga de variables |
| `src/config/utc_zone.json` | `src/config/` | Si | No | Zona horaria |
| `src/config/microservices_urls.json` | `src/config/` | Si | No | URLs de microservicios |
| `src/config/account_service_key.json` | `src/config/` | No | Si (`.example.json`) | Cuenta de servicio Firebase (dev) |
| `src/config/account_service_key-prod.json` | `src/config/` | No | No | Cuenta de servicio Firebase (prod) |
| `src/config/email_service_key.json` | `src/config/` | No | No | Clave de SendGrid |

### 4.4 Configuracion Inicial

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd app_ciudadana_backend

# 2. Instalar dependencias
cd src
npm install

# 3. Crear archivo de variables de entorno desde la plantilla
cp .env.example .env
cp .env.example .env.development

# 4. Editar variables de entorno
#    Configurar DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
nano .env.development

# 5. Configurar cuenta de servicio Firebase (desarrollo)
cp config/account_service_key.example.json config/account_service_key.json
# Editar con las credenciales reales del proyecto

# 6. Ejecutar migraciones de base de datos (si aplica)
npx sequelize-cli db:migrate

# 7. Ejecutar seeders iniciales (si aplica)
npx sequelize-cli db:seed:all
```

---

## 5. Puesta en Marcha

### 5.1 Desarrollo Local

```bash
# Desde la raiz del proyecto, dentro de src/
cd src

# Instalacion de dependencias (si no se ha hecho)
npm install

# Ejecucion en modo desarrollo (con hot reload)
npm run start:dev

# O equivalente:
NODE_ENV=development nodemon ./all-server.js

# Ejecucion en modo produccion local
npm run start:prod
```

El servidor se iniciara en el puerto configurado en `PORT` (por defecto, verificar `all-server.js`).

### 5.2 Docker (solo desarrollo local)

> **DEPRECADO para producción.** Docker solo debe usarse para desarrollo local si se desea aislar microservicios. El despliegue a producción se realiza exclusivamente via **Firebase Cloud Functions**. Los Dockerfiles (`src/microservices/*/Dockerfile`) permanecen como referencia historica.

```bash
# Build de microservicios individuales (solo para pruebas locales)
docker build --platform linux/amd64 -t app_mobility_users_ms -f src/microservices/users/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_notifications_ms -f src/microservices/notifications/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_third_parties_ms -f src/microservices/thirdParties/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_file_management_ms -f src/microservices/fileManagement/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_admin_ms -f src/microservices/admin/Dockerfile .

# Ejecucion de contenedores (solo desarrollo)
docker run -d -p 3000:3000 app_mobility_users_ms
docker run -d -p 3001:3000 app_mobility_notifications_ms
docker run -d -p 3002:3000 app_mobility_third_parties_ms
docker run -d -p 3003:3000 app_mobility_file_management_ms
docker run -d -p 3004:3000 -v $(pwd)/src/uploads:/src/uploads app_mobility_admin_ms
```

### 5.3 Microservicios en desarrollo local

Cada microservicio puede ejecutarse de forma independiente:

```bash
# Users
cd src/microservices/users && node index.js

# Notifications
cd src/microservices/notifications && node index.js

# Third Parties
cd src/microservices/thirdParties && node index.js

# File Management
cd src/microservices/fileManagement && node index.js

# Traffic
cd src/microservices/traffic && node index.js
```

### 5.4 Verificacion

```bash
# Health check
curl http://localhost:3000/health

# Ver logs de la aplicacion
# El servidor debe imprimir los endpoints registrados al iniciar
```

---

## 6. Despliegue

### 6.1 Formas de Desplegar

**Despliegue automatizado (recomendado):**
```bash
npm run deploy
```
Este script lee variables desde `src/.env.production`, crea/actualiza secretos en Secret Manager y despliega a Firebase Cloud Functions.

**Despliegue manual:**
```bash
firebase deploy --only functions --project mov-cali-app-ciudadana
```

> **Cloud Run — DEPRECADO.** Anteriormente los microservicios se desplegaban en Google Cloud Run mediante `gcloud builds submit --config cloudbuild.yaml`. Esta via fue reemplazada por **Firebase Cloud Functions** como unica plataforma de producción. Los comandos de Cloud Run que aparecen en el README.md y los Dockerfiles son referencia historica y **no deben usarse para despliegue**.

### 6.2 Configuracion de Variables en Infraestructura

Los secretos se gestionan mediante **Google Cloud Secret Manager** y se declaran en `functions.js`:

```bash
# Base de datos (obligatorias)
firebase functions:secrets:set DB_HOST     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_PORT     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_NAME     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_USER     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_PASSWORD --project mov-cali-app-ciudadana
firebase functions:secrets:set FIREBASE_STORAGE_BUCKET --project mov-cali-app-ciudadana

# Correo electrónico — **INACTIVAS** — SendGrid fue reemplazado por nodemailer 10.x
# Las siguientes secrets existen pero NO se utilizan en producción
# firebase functions:secrets:set SENDGRID_API_KEY  --project mov-cali-app-ciudadana
# firebase functions:secrets:set SENDGRID_EMAIL    --project mov-cali-app-ciudadana

# SMS (opcional)
firebase functions:secrets:set SIGMA_ACCOUNT_KEY --project mov-cali-app-ciudadana
```

> **Nota:** El metodo `firebase functions:config:set` se encuentra deprecado en Cloud Functions v2.

**Secretos declarados en el codigo (`functions.js`):**
```js
secrets: [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "SENDGRID_API_KEY",     // INACTIVA — SendGrid reemplazado por nodemailer 10.x
  "SENDGRID_EMAIL",       // INACTIVA — SendGrid reemplazado por nodemailer 10.x
  "SIGMA_ACCOUNT_KEY",    // Opcional
  "FIREBASE_STORAGE_BUCKET",
]
```

### 6.3 Script de Despliegue (`deploy.sh`)

**Ubicacion:** Raiz del repositorio

**Flujo:**
1. Lee variables desde `src/.env.production`
2. Crea o actualiza secretos en Secret Manager mediante `gcloud`
3. Ejecuta `firebase deploy --only functions`

**Secrets gestionadas por `deploy.sh`:**

| Secret | Variable de origen | Estado |
|---|---|---|
| `DB_HOST` | `DB_HOST` | Obligatoria |
| `DB_PORT` | `DB_PORT` | Obligatoria |
| `DB_NAME` | `DB_NAME` | Obligatoria |
| `DB_USER` | `DB_USER` | Obligatoria |
| `DB_PASSWORD` | `DB_PASSWORD` | Obligatoria |
| `FIREBASE_STORAGE_BUCKET` | `FIREBASE_STORAGE_BUCKET` | Obligatoria |
| `SENDGRID_API_KEY` | `SENDGRID_API_KEY` | **Inactiva** — reemplazada por nodemailer |
| `SENDGRID_EMAIL` | `SENDGRID_EMAIL` | **Inactiva** — reemplazada por nodemailer |
| `SIGMA_ACCOUNT_KEY` | `SIGMA_ACCOUNT_KEY` | Opcional |
| `FCM_TOPIC_NAME_MOBILE` | `FCM_TOPIC_NAME_MOBILE` | Opcional |

**Variables en `.env.example` NO gestionadas como secrets por deploy.sh:**

| Variable | Razon |
|---|---|
| `NODE_ENV` | Se establece en el runtime de Cloud Functions automaticamente |
| `PORT` | Solo aplica en desarrollo local; Cloud Functions no usa puerto configurable |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No se despliega — archivos JSON estan excluidos en `firebase.json` |
| `FIREBASE_SERVICE_ACCOUNT` | Se resuelve con credenciales por defecto del runtime de Cloud Functions |
| `UPLOADS_DIR` | Solo aplica en desarrollo local; en produccion se usa Firebase Storage |
| `EMAIL_PROVIDER` | Valor por defecto en codigo (`sendMail.js`), no requiere secret |
| `GMAIL_USER` | Configuracion de nodemailer, no se gestiona como secret actualmente |
| `GMAIL_APP_PASSWORD` | Configuracion de nodemailer, no se gestiona como secret actualmente |

**Requisitos:**
- CLI de `gcloud` autenticada con permisos de Secret Manager
- CLI de `firebase` autenticada
- Archivo `src/.env.production` con valores validos

### 6.4 Scripts de package.json

| Script | Comando | Descripcion |
|---|---|---|
| `deploy` | `cd .. && bash deploy.sh` | Despliegue automatizado con gestion de secrets |
| `start` | `nodemon ./all-server.js` | Ejecucion local sin NODE_ENV |
| `start:dev` | `NODE_ENV=development nodemon ./all-server.js` | Desarrollo con hot reload |
| `start:prod` | `NODE_ENV=production nodemon ./all-server.js` | Simulacion de produccion local |
| `backend` | `nodemon ./all-server.js` | Alias de `start` |
| `test` | `jest --detectOpenHandles` | Ejecucion de tests |
| `format` | `prettier --write .` | Formateo de codigo |

### 6.5 Arquitectura de Despliegue

| Componente | Configuracion |
|---|---|
| Runtime | Node.js 20 (`nodejs20`) |
| Plataforma | Firebase Cloud Functions v2 (HTTP trigger) |
| Region | `us-west1` |
| Memoria | 1 GiB |
| Timeout | 300 segundos |
| Concurrencia | 80 |

### 6.6 Endpoint Publico

```
https://us-west1-mov-cali-app-ciudadana.cloudfunctions.net/appCiudadanaApi
```

Todos los endpoints de la API se sirven bajo esta URL base.

### 6.7 Archivos Excluidos en el Despliegue

La configuracion en `firebase.json` excluye los siguientes patrones:

| Patron | Se incluye | Justificacion |
|---|---|---|
| `.env`, `.env.*` | No | Contienen secretos locales |
| `**/config.json` | No | Obsoleto en produccion |
| `**/*_key.json` | No | Claves de servicio |
| `**/secrets.json` | No | Secretos de servicios externos |
| `**/example.env` | No | Plantillas de referencia |
| `node_modules` | No | Se instalan en el build |
| `__tests__` | No | Tests de desarrollo |
| `migrations` | No | Migraciones de base de datos |
| `seeders` | No | Seeders de base de datos |
| `infra` | No | Infraestructura |
| `uploads` | No | Archivos subidos |
| `*.test.js` | No | Tests |

### 6.8 Cuentas de Servicio de Firebase

| Entorno | ID del Proyecto | Ubicacion de la clave |
|---|---|---|
| Desarrollo | `app-ciudadana-cali` | `src/config/account_service_key.json` |
| Produccion | `mov-cali-app-ciudadana` | `src/config/account_service_key-prod.json` |

**Modulos que utilizan la clave:**

| Modulo | Uso |
|---|---|
| `src/middleware/authMiddleware.js` | Inicializacion de Firebase Admin (fallback) |
| `src/create-user-util.js` | Creacion de usuarios en Firebase Auth |
| `src/seeders/seedAdmin.js` | Seeder de administrador inicial |

**Alternativa mediante variable de entorno:**
En lugar de un archivo, puede utilizarse `FIREBASE_SERVICE_ACCOUNT` con el contenido JSON de la cuenta de servicio. Este enfoque es preferible para entornos serverless.

### 6.9 Referencia de Endpoints

**URL base:** `https://us-west1-mov-cali-app-ciudadana.cloudfunctions.net/appCiudadanaApi`

#### Vista General

| Prefijo | Autenticacion | Descripcion |
|---|---|---|
| `/health` | No requerida | Verificacion de estado |
| `/api/web/v1/admin/admin` | No requerida / Requerida | Administracion de usuarios y roles |
| `/api/web/v1/admin/role` | Requerida | Gestion de roles |
| `/api/web/v1/notifications` | Requerida | Notificaciones (panel web) |
| `/api/mobile/v1/notifications` | No requerida | Notificaciones (app movil) |
| `/api/web/v1/users` | Requerida | Usuarios (panel web) |
| `/api/mobile/v1/users` | Requerida (movil) | Usuarios (app movil) |
| `/api/web/v1/third_parties` | Requerida | Terceros (panel web) |
| `/api/mobile/v1/third_parties` | Requerida (movil) | Terceros (app movil) |
| `/api/web/v1/file_management/upload` | Requerida | Carga de archivos |
| `/api/v1/file_management/download` | No requerida | Descarga de archivos |
| `/api/web/v1/traffic` | Requerida | Estado de vias (panel web) |
| `/api/mobile/v1/traffic` | No requerida | Estado de vias (app movil) |

#### Administracion

**Ruta libre (sin autenticacion):**

| Metodo | Ruta | Controlador |
|---|---|---|
| POST | `/api/web/v1/admin/admin/email_verification` | `postEmailVerification` |

**Ruta con autenticacion:**

| Metodo | Ruta | Controlador |
|---|---|---|
| GET | `/api/web/v1/admin/admin/notifications` | `getAllNotifications` |
| POST | `/api/web/v1/admin/admin/` | `postRegister` |
| POST | `/api/web/v1/admin/admin/add_role/` | `postAddRole` |
| POST | `/api/web/v1/admin/admin/edit/` | `postEdit` |
| POST | `/api/web/v1/admin/admin/edit/mobile_user` | `postEditMobileUser` |
| POST | `/api/web/v1/admin/admin/delete` | `postDelete` |
| GET | `/api/web/v1/admin/admin/:id` | `getOneById` |
| POST | `/api/web/v1/admin/admin/set_passwd` | `postSetPasswd` |

**Gestion de roles:**

| Metodo | Ruta | Controlador |
|---|---|---|
| POST | `/api/web/v1/admin/role/edit` | `postEdit` |
| POST | `/api/web/v1/admin/role/delete` | `postDelete` |
| POST | `/api/web/v1/admin/role/user` | `postAssignRoleToUser` |
| POST | `/api/web/v1/admin/role/` | `postRegister` |
| GET | `/api/web/v1/admin/role/user` | `getUsersByRoleId` |
| GET | `/api/web/v1/admin/role/` | `getAll` |
| GET | `/api/web/v1/admin/role/:id` | `getRole` |

#### Usuarios

**Panel web:**

| Metodo | Ruta | Controlador |
|---|---|---|
| POST | `/api/web/v1/users/validate_lat_lon` | `postValidateLatLon` |
| POST | `/api/web/v1/users/account/info` | `postAccountInfo` |
| POST | `/api/web/v1/users/account/full_login` | `postAccountBaseLogin` |
| GET | `/api/web/v1/users/account/info` | `getAccountInfo` |
| GET | `/api/web/v1/users/account/login/phase` | `getAccountLoginPhase` |
| POST | `/api/web/v1/users/account/edit` | `postAccountFullLogin` |
| POST | `/api/web/v1/users/document_types/` | `postRegister` |
| POST | `/api/web/v1/users/document_types/edit` | `postEdit` |
| GET | `/api/web/v1/users/document_types` | `getAll` |
| GET | `/api/web/v1/users/document_types/:id` | `getOneById` |
| GET | `/api/web/v1/users/` | `getUsersListByDevice` |
| POST | `/api/web/v1/users/status` | `postUsersStatus` |
| POST | `/api/web/v1/users/full_login` | `postUsersFullLogin` |
| POST | `/api/web/v1/users/base_login` | `postUsersBaseLogin` |

**Aplicacion movil:**

| Metodo | Ruta | Controlador |
|---|---|---|
| POST | `/api/mobile/v1/users/account/info` | `postAccountInfo` |
| POST | `/api/mobile/v1/users/account/full_login` | `postAccountBaseLogin` |
| GET | `/api/mobile/v1/users/account/info` | `getAccountInfo` |
| GET | `/api/mobile/v1/users/account/login/phase` | `getAccountLoginPhase` |
| POST | `/api/mobile/v1/users/account/edit` | `postAccountFullLogin` |
| GET | `/api/mobile/v1/users/document_types` | `getAll` |

#### Notificaciones

**Panel web:**

| Metodo | Ruta | Controlador |
|---|---|---|
| POST | `/api/web/v1/notifications/validate_lat_lon` | `postValidateLatLon` |
| GET | `/api/web/v1/notifications/informationmb` | `getAllAdvertisements` |
| POST | `/api/web/v1/notifications/informationmb` | `postAdvertisement` |
| POST | `/api/web/v1/notifications/informationmb/edit` | `postAdvertisementEdit` |
| POST | `/api/web/v1/notifications/informationmb/status` | `postAdvertisementStatus` |
| POST | `/api/web/v1/notifications/informationmb/delete` | `postAdvertisementDelete` |
| GET | `/api/web/v1/notifications/security/attentionPoint` | `getAllSecurityAttentionPoints` |
| GET | `/api/web/v1/notifications/security/attentionPoint/:id` | `getOneSecurityAttentionPoint` |
| POST | `/api/web/v1/notifications/security/attentionPoint` | `postCreateSecurityAttentionPoint` |
| POST | `/api/web/v1/notifications/security/attentionPoint/edit` | `postEditSecurityAttentionPoint` |
| POST | `/api/web/v1/notifications/security/attentionPoint/delete` | `postDeleteSecurityAttentionPoint` |
| POST | `/api/web/v1/notifications/security/reports/approve` | `postApprove` |
| POST | `/api/web/v1/notifications/security/reports/disapprove` | `postDisapprove` |
| POST | `/api/web/v1/notifications/security/reports/expires` | `postExpires` |
| POST | `/api/web/v1/notifications/security/report_configuration` | `postRegister` |
| GET | `/api/web/v1/notifications/security/report_configuration` | `getReportConfig` |
| GET | `/api/web/v1/notifications/security/reports` | `getListAll` |
| GET | `/api/web/v1/notifications/security/reports/:id` | `getReport` |
| POST | `/api/web/v1/notifications/security/` | `postRegister` |
| POST | `/api/web/v1/notifications/security/edit` | `postEdit` |
| POST | `/api/web/v1/notifications/security/delete` | `postDelete` |
| GET | `/api/web/v1/notifications/security` | `getListAll` |
| GET | `/api/web/v1/notifications/security/:id` | `getSecurity` |
| POST | `/api/web/v1/notifications/security_category/` | `postRegister` |
| POST | `/api/web/v1/notifications/security_category/edit` | `postEdit` |
| POST | `/api/web/v1/notifications/security_category/delete` | `postDelete` |
| GET | `/api/web/v1/notifications/security_category` | `getAll` |
| GET | `/api/web/v1/notifications/security_category/:id` | `getOneById` |
| POST | `/api/web/v1/notifications/gender_line/` | `postRegister` |
| POST | `/api/web/v1/notifications/gender_line/edit` | `postEdit` |
| POST | `/api/web/v1/notifications/gender_line/delete` | `postDelete` |
| GET | `/api/web/v1/notifications/gender_line` | `getListAll` |
| POST | `/api/web/v1/notifications/gender_category/` | `postRegister` |
| POST | `/api/web/v1/notifications/gender_category/edit` | `postEdit` |
| POST | `/api/web/v1/notifications/gender_category/delete` | `postDelete` |
| GET | `/api/web/v1/notifications/gender_category` | `getAll` |
| POST | `/api/web/v1/notifications/gender_point/` | `postRegister` |
| POST | `/api/web/v1/notifications/gender_point/edit` | `postEdit` |
| POST | `/api/web/v1/notifications/gender_point/delete` | `postDelete` |
| GET | `/api/web/v1/notifications/gender_point` | `getListAll` |
| POST | `/api/web/v1/notifications/alert` | `sendAlerts` |
| GET | `/api/web/v1/notifications/alert` | `getlistAll` |
| POST | `/api/web/v1/notifications/attention_lines/` | `postRegister` |
| GET | `/api/web/v1/notifications/attention_lines/` | `getOne` |
| GET | `/api/web/v1/notifications/social_networks/` | `listSocialNetworks` |
| GET | `/api/web/v1/notifications/social_networks/types` | `listSocialNetworkTypes` |
| POST | `/api/web/v1/notifications/social_networks/` | `registerSocialNetwork` |
| POST | `/api/web/v1/notifications/social_networks/edit` | `updateSocialNetwork` |
| POST | `/api/web/v1/notifications/social_networks/status` | `changeStatusSocialNetwork` |
| POST | `/api/web/v1/notifications/social_networks/delete` | `deleteSocialNetwork` |
| GET | `/api/web/v1/notifications/mobile_services/` | `listMobileServices` |
| GET | `/api/web/v1/notifications/mobile_services/access` | `listMobileServiceTypes` |
| POST | `/api/web/v1/notifications/mobile_services/` | `registerMobileService` |
| POST | `/api/web/v1/notifications/mobile_services/edit` | `updateMobileService` |
| POST | `/api/web/v1/notifications/mobile_services/status` | `changeStatusMobileService` |
| POST | `/api/web/v1/notifications/mobile_services/delete` | `deleteMobileService` |
| GET | `/api/web/v1/notifications/dependencies` | `getAllDependencies` |
| GET | `/api/web/v1/notifications/dependencies/template` | `getDownloadXlsxTemplate` |
| GET | `/api/web/v1/notifications/dependencies/excel` | `getDownloadXlsxDependencies` |
| POST | `/api/web/v1/notifications/dependencies/excel` | `postUploadXlsxDependencies` |

**Aplicacion movil:**

| Metodo | Ruta | Controlador |
|---|---|---|
| GET | `/api/mobile/v1/notifications/publicity/` | `getUncategorized` |
| GET | `/api/mobile/v1/notifications/publicity/banners` | `getCategorized` |
| GET | `/api/mobile/v1/notifications/attention_lines/dependencies` | `getDependencies` |
| GET | `/api/mobile/v1/notifications/security` | `getListAll` |
| POST | `/api/mobile/v1/notifications/security/reports` | `postRegister` |
| GET | `/api/mobile/v1/notifications/security/reports` | `getListAllClosest` |
| GET | `/api/mobile/v1/notifications/security/attention_points` | `getSecurityAttentionPoints` |
| GET | `/api/mobile/v1/notifications/attention_lines/` | `getAttentionLine` |
| POST | `/api/mobile/v1/notifications/notifications/register` | `registerPush` |
| GET | `/api/mobile/v1/notifications/notifications/` | `getListActive` |
| GET | `/api/mobile/v1/notifications/social_networks/` | `getSocialNetworks` |
| GET | `/api/mobile/v1/notifications/gender/attention_points` | `getAttentionPoints` |
| GET | `/api/mobile/v1/notifications/gender` | `getCategoriesnAttentionLines` |
| GET | `/api/mobile/v1/notifications/services/` | `getMobileServices` |

#### Trafico

**Panel web** (sub-rutas bajo `/api/web/v1/traffic`):

| Sub-ruta | Descripcion |
|---|---|
| `/road_state` | Estado de vias |
| `/traffic_notification` | Notificaciones de trafico |
| `/bikes/terms_conditions` | Terminos de bicicletas |

**Aplicacion movil:**

| Metodo | Ruta | Controlador |
|---|---|---|
| GET | `/api/mobile/v1/traffic/mobility` | `getRoadStates` |
| GET | `/api/mobile/v1/traffic/bikes/terms` | `getTerms` |
| POST | `/api/mobile/v1/traffic/bikes/terms/agree` | `postAcceptTerms` |
| GET | `/api/mobile/v1/traffic/bikes/terms/agree` | `getAcceptTerms` |

#### Gestion de Archivos

| Metodo | Ruta | Autenticacion | Controlador |
|---|---|---|---|
| POST | `/api/web/v1/file_management/upload/image` | Requerida | `postSingleFile` |
| POST | `/api/web/v1/file_management/upload/pdf` | Requerida | `postSingleFile` |
| GET | `/api/v1/file_management/download/:folder/:fileName` | No requerida | `downloadFile` |
| GET | `/api/v1/file_management/download/secure/:folder/:fileName` | Requerida | `downloadSecuredFile` |

#### Terceros

**Aplicacion movil:**

| Metodo | Ruta | Controlador |
|---|---|---|
| GET | `/api/mobile/v1/third_parties/intercity_transport` | `getTransportRoutes` |
| GET | `/api/mobile/v1/third_parties/intercity_transport/cities` | `getAll` |
| GET | `/api/mobile/v1/third_parties/third_parties/categories` | `getAll` |
| GET | `/api/mobile/v1/third_parties/tourism/categories` | `getAll` |
| GET | `/api/mobile/v1/third_parties/tourism/` | `getCompaniesnServices` |
| GET | `/api/mobile/v1/third_parties/third_parties/` | `getCompaniesnServices` |
| GET | `/api/mobile/v1/third_parties/taxis` | `getQuery` |
| POST | `/api/mobile/v1/third_parties/taxis/complaint` | `postComplaint` |

**Panel web** (sub-rutas bajo `/api/web/v1/third_parties`):

| Sub-ruta | Descripcion |
|---|---|
| `/city` | Ciudades |
| `/categories` | Categorias |
| `/tourism_categories` | Categorias de turismo |
| `/tourism_company` | Empresas turisticas |
| `/tourism_service` | Servicios turisticos |
| `/company` | Empresas |
| `/company_service` | Servicios de empresa |
| `/transport_company/route/date` | Fechas de rutas |
| `/transport_company/route/hour` | Horarios de rutas |
| `/transport_company/route` | Rutas de transporte |
| `/transport_company` | Empresas de transporte |

**API de turismo** (`/api/web/v1/third_parties/tourism_company_api`):

| Metodo | Ruta | Controlador |
|---|---|---|
| GET | `/services/` | `getServices` |
| POST | `/services/` | `postService` |
| POST | `/services/edit` | `postEdit` |
| POST | `/services/delete` | `postDelete` |
| POST | `/services_bulk/` | `postBulkService` |
| POST | `/services_bulk/delete` | `postBulkServiceDelete` |

**API de transporte** (`/api/web/v1/third_parties/transport_company_api`):

| Metodo | Ruta | Controlador |
|---|---|---|
| POST | `/route/date/` | `postDateRegister` |
| POST | `/route/date/hours` | `postDateRegisterWithHour` |
| POST | `/route/date/edit` | `postDateEdit` |
| POST | `/route/date/delete` | `postDateDelete` |
| GET | `/route/date/` | `getDateAll` |
| POST | `/route/hour/` | `postHourRegister` |
| POST | `/route/hour/edit` | `postHourEdit` |
| POST | `/route/hour/delete` | `postHourDelete` |
| GET | `/route/hour/` | `getHourAll` |
| GET | `/route/itinerary` | `getRouteItinerary` |
| POST | `/route/` | `postRouteRegister` |
| POST | `/route/edit` | `postRouteEdit` |
| POST | `/route/delete` | `postRouteDelete` |
| GET | `/route` | `getRouteAll` |

---

## 7. Errores Comunes y Soluciones

### Error: Variables de entorno no se cargan en Cloud Functions

**Sintoma:** La funcion falla con errores de conexion a base de datos o servicios externos.
**Causa:** Los archivos `.env.*` no se despliegan a Cloud Functions (estan excluidos en `firebase.json`). Los valores deben estar en Secret Manager.
**Solucion:**
```bash
# Verificar que los secretos existen
gcloud secrets list --project=mov-cali-app-ciudadana

# Crear o actualizar los secretos faltantes
firebase functions:secrets:set DB_HOST --project mov-cali-app-ciudadana
# Repetir para cada variable necesaria

# Redeployar para que la funcion tome los nuevos secretos
firebase deploy --only functions --project mov-cali-app-ciudadana
```

### Error: Firebase Admin SDK no se inicializa

**Sintoma:** Error `FirebaseAppError` o `credential must be provided` al iniciar.
**Causa:** No se encontro la cuenta de servicio en `src/config/account_service_key.json` ni la variable `FIREBASE_SERVICE_ACCOUNT`.
**Solucion:**
```bash
# Opcion 1: Copiar la plantilla y agregar credenciales
cp src/config/account_service_key.example.json src/config/account_service_key.json
# Editar con las credenciales reales del proyecto Firebase

# Opcion 2: Usar variable de entorno (preferible para serverless)
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
```

### Error: Error de autenticacion con gcloud para Secret Manager

**Sintoma:** `ERROR: (gcloud.secrets.create) User does not have permission` al ejecutar `deploy.sh`.
**Causa:** La cuenta de gcloud no tiene el rol `roles/secretmanager.admin` en el proyecto.
**Solucion:**
```bash
# Verificar la cuenta activa
gcloud auth list

# Asignar el rol necesario (requiere permisos de admin)
gcloud projects add-iam-policy-binding mov-cali-app-ciudadana \
  --member="user:tu-email@domain.com" \
  --role="roles/secretmanager.admin"
```

### Error: Funcion no se despliega por timeout de build

**Sintoma:** `Error: Failed to configure trigger` o timeout durante el deploy.
**Causa:** El build de Cloud Functions excede el tiempo limite o hay dependencias conflictivas.
**Solucion:**
```bash
# Verificar que las dependencias son compatibles con nodejs20
cd src && npm ls

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Intentar deploy nuevamente
firebase deploy --only functions --project mov-cali-app-ciudadana
```

### Error: Conexion a base de datos rechazada

**Sintoma:** `SequelizeConnectionRefusedError` o `ECONNREFUSED`.
**Causa:** Las credenciales de base de datos son incorrectas o el servidor no es accesible desde Cloud Functions.
**Solucion:**
```bash
# Verificar las variables de entorno en desarrollo
cat src/.env.development | grep DB_

# En produccion, verificar los secretos
gcloud secrets versions access latest --secret=DB_HOST --project=mov-cali-app-ciudadana

# Verificar que la base de datos acepta conexiones desde la IP de Cloud Functions
# Cloud Functions usa IPs efimeras — configurar la base de datos para aceptar 0.0.0.0/0
# o usar Serverless VPC Access para conexion privada
```

### Error: Error de concurrencia en Cloud Functions

**Sintoma:** Requests fallan con `429 Too Many Requests` o timeouts intermitentes.
**Causa:** La funcion tiene un limite de concurrencia bajo (80 por defecto) y recibe mas requests simultaneos.
**Solucion:**
```bash
# Ajustar la concurrencia en functions.js (actualmente 80)
# O escalar horizontalmente con multiples instancias
firebase deploy --only functions --project mov-cali-app-ciudadana
```

### Error: Microservicio Docker no arranca

**Sintoma:** `Container failed to start` en Cloud Run o error local al ejecutar `docker run`.
**Causa:** Variables de entorno no pasadas al contenedor o puerto incorrecto.
**Solucion:**
```bash
# Verificar que las variables se pasan correctamente
docker run -d -p 3000:3000 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=app_ciudadana \
  -e DB_USER=postgres \
  -e DB_PASSWORD=****** \
  app_mobility_users_ms

# Ver logs del contenedor
docker logs <container-id>
```

### Error: Archivos de configuracion JSON no disponibles en produccion

**Sintoma:** Error `Cannot find module './config.json'` o configuracion obsoleta en produccion.
**Causa:** Los archivos `**/config.json` estan excluidos en `firebase.json` y no se despliegan.
**Solucion:** Migrar toda la configuracion a variables de entorno o Secret Manager. El modulo `src/config/dotenv.js` centraliza la carga de variables. Los archivos JSON solo funcionan en desarrollo local.

### Error: Se intenta desplegar a Google Cloud Run

**Sintoma:** Comandos como `gcloud builds submit` o `gcloud run deploy` no producen efecto en la API publica.
**Causa:** Google Cloud Run fue **deprecado** como plataforma de despliegue. La plataforma activa es **Firebase Cloud Functions**. Los Dockerfiles y comandos de Cloud Run en el README.md son referencia historica.
**Solucion:** Usar exclusivamente Firebase CLI para despliegue:
```bash
# Forma correcta de desplegar
npm run deploy
# o
firebase deploy --only functions --project mov-cali-app-ciudadana
```

### Error: Correos no se envian con SendGrid

**Sintoma:** Los correos electronicos no se entregan o hay errores de autenticacion con SendGrid.
**Causa:** SendGrid fue **deshabilitado** como proveedor de correo en favor de **nodemailer 10.x**. Las variables `SENDGRID_API_KEY` y `SENDGRID_EMAIL` permanecen en el codigo pero no se utilizan activamente.
**Solucion:** Verificar que el proveedor activo sea nodemailer en `src/utils/sendMail.js`:
```bash
# La variable EMAIL_PROVIDER controla el proveedor
# Por defecto apunta a sendgrid, pero debe configurarse para nodemailer
# Verificar la configuracion actual en sendMail.js
cat src/utils/sendMail.js
```
Si se requiere reactivar SendGrid, se deben configurar las secrets correspondientes, pero la via recomendada es nodemailer.

### Error: Uploads fallan con multer en lugar de busboy

**Sintoma:** Errores relacionados con multer en el manejo de archivos.
**Causa:** Multer fue **reemplazado por busboy** como motor de carga de archivos. El middleware activo es `src/middleware/uploadMiddleware.js` que usa Busboy directamente. Multer permanece en `package.json` por compatibilidad pero no se usa.
**Solucion:** Verificar que el upload middleware use busboy:
```bash
# Ver el middleware activo
cat src/middleware/uploadMiddleware.js
# Debe usar Busboy, NO multer
```

---

## Estado de la Migracion de Configuracion

### Tareas Completadas

- Unificacion de la carga de variables de entorno mediante `src/config/dotenv.js`.
- Eliminacion de contraseñas hardcodeadas de archivos de configuracion.
- Eliminacion de archivos de configuracion obsoletos (`config.json`, `config.sample.json`).
- Eliminacion de archivos `.env` huerfanos no gestionados por el sistema de carga.
- Declaracion de secretos en `functions.js` para Cloud Functions v2.
- Construccion de la URL de conexion a base de datos en `models/index.js` a partir de componentes individuales.

### Tareas Pendientes

> No hay tareas pendientes de migracion de configuracion. Los secretos se gestionan automaticamente mediante `deploy.sh` durante cada despliegue. El unico requisito es contar con `src/.env.production` con valores validos antes de ejecutar `npm run deploy` por primera vez en un nuevo entorno.
