# BACKEND DE MOVILIDAD CALI

Backend en **Node.js 20** + **Express** para la **Aplicación Ciudadana de Cali**.
Desplegado como **Firebase Cloud Functions (v2)** en la región `us-west1`.

**Tabla de Contenidos**

- [1. Stack Tecnológico](#1-stack-tecnológico)
- [2. Arquitectura](#2-arquitectura)
  - [2.1. Formato de Respuesta](#21-formato-de-respuesta)
  - [2.2. Estructura del Proyecto](#22-estructura-del-proyecto)
- [3. Endpoints de la API](#3-endpoints-de-la-api)
  - [3.1. Salud](#31-salud)
  - [3.2. Usuarios](#32-usuarios)
  - [3.3. Notificaciones](#33-notificaciones)
  - [3.4. Tráfico](#34-tráfico)
  - [3.5. Administración](#35-administración)
  - [3.6. Gestión de Archivos](#36-gestión-de-archivos)
  - [3.7. Terceros](#37-terceros)
- [4. Autenticación](#4-autenticación)
- [5. Ejecución Local](#5-ejecución-local)
- [6. Despliegue](#6-despliegue)
- [7. Variables de Entorno](#7-variables-de-entorno)
- [8. Contribuidores](#8-contribuidores)
- [9. Licencia](#9-licencia)

---

## 1. Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Runtime | Node.js 20 |
| Framework HTTP | Express 4.18 |
| Cloud Host | Firebase Cloud Functions v2 |
| Base de datos | PostgreSQL |
| ORM | Sequelize 6 |
| Autenticación | Firebase Admin SDK |
| Email | SendGrid |
| SMS | Sigma |
| Storage | Firebase Storage |
| Validación | Joi |
| Testing | Jest + Supertest |

---

## 2. Arquitectura

### 2.1. Formato de Respuesta

#### Solicitud HTTP Exitosa

La API devuelve los datos procesados en formato JSON.

#### Solicitud HTTP Fallida

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "detail": "Descripción detallada del problema"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | number | Código HTTP (400, 401, 404, 500, etc.) |
| `code` | string | Código de error interno de la aplicación |
| `detail` | string | Descripción legible del error |

### 2.2. Estructura del Proyecto

```
src/
├── functions.js          → Entry point de Cloud Functions v2
├── app.js                → App Express (monta todos los routers)
├── all-server.js         → Entry point local (nodemon)
├── config/               → Configuración (dotenv, keys, timezone)
├── middleware/           → Auth, error handling, upload
├── models/               → Modelos Sequelize
├── migrations/           → Migraciones de BD
└── microservices/        → 6 dominios como routers Express
    ├── admin/            → Gestión de admins y roles
    ├── fileManagement/   → Upload y download de archivos
    ├── notifications/    → Alertas, reportes, seguridad, publicidad
    ├── thirdParties/     → Taxis, transporte, turismo, empresas
    ├── traffic/          → Estado de vías, bicicletas
    └── users/            → Usuarios, tipos de documento
```

---

## 3. Endpoints de la API

**Base URL (producción):**
```
https://us-west1-mov-cali-app-ciudadana.cloudfunctions.net/appCiudadanaApi
```

### 3.1. Salud

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | ❌ | Verifica que el servicio está activo |

### 3.2. Usuarios

#### Web (`/api/web/v1/users`) — Requiere auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/validate_lat_lon` | Valida que coordenadas pertenecen a Cali |
| POST | `/account/info` | Envía información de cuenta |
| POST | `/account/full_login` | Login completo |
| GET | `/account/info` | Obtiene información de cuenta |
| GET | `/account/login/phase` | Obtiene fase del login |
| POST | `/account/edit` | Edita cuenta |
| POST | `/document_types/` | Registra tipo de documento |
| POST | `/document_types/edit` | Edita tipo de documento |
| GET | `/document_types` | Lista todos los tipos de documento |
| GET | `/document_types/:id` | Obtiene tipo de documento por ID |
| GET | `/` | Lista usuarios por dispositivo |
| POST | `/status` | Actualiza estado de usuario |
| POST | `/full_login` | Login completo de usuario |
| POST | `/base_login` | Login base de usuario |

#### Mobile (`/api/mobile/v1/users`) — Requiere auth mobile

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/account/info` | Envía información de cuenta |
| POST | `/account/full_login` | Login completo (con archivo) |
| GET | `/account/info` | Obtiene información de cuenta |
| GET | `/account/login/phase` | Obtiene fase del login |
| POST | `/account/edit` | Edita cuenta |
| GET | `/document_types` | Lista tipos de documento |

### 3.3. Notificaciones

#### Web (`/api/web/v1/notifications`) — Requiere auth

| Dominio | Endpoints principales |
|---|---|
| **Publicidad** | `GET/POST /informationmb`, `POST /informationmb/{edit,status,delete}` |
| **Seguridad** | `GET/POST /security`, `GET /security/:id`, `POST /security/{edit,delete}` |
| **Categorías seguridad** | `GET/POST /security_category`, `POST /security_category/{edit,delete}` |
| **Puntos de atención** | `GET/POST /security/attentionPoint`, `POST /security/attentionPoint/{edit,delete}` |
| **Reportes** | `GET /security/reports`, `GET /security/reports/:id`, `POST /security/reports/{approve,disapprove,expires}` |
| **Config reportes** | `GET/POST /security/report_configuration` |
| **Género - líneas** | `GET/POST /gender_line`, `POST /gender_line/{edit,delete}` |
| **Género - categorías** | `GET/POST /gender_category`, `POST /gender_category/{edit,delete}` |
| **Género - puntos** | `GET/POST /gender_point`, `POST /gender_point/{edit,delete}` |
| **Alertas** | `POST /alert`, `GET /alert` |
| **Líneas de atención** | `POST /attention_lines/`, `GET /attention_lines/` |
| **Redes sociales** | `GET/POST /social_networks/`, `GET /social_networks/types`, `POST /social_networks/{edit,status,delete}` |
| **Servicios móviles** | `GET/POST /mobile_services/`, `GET /mobile_services/access`, `POST /mobile_services/{edit,status,delete}` |
| **Dependencias** | `GET /dependencies`, `GET /dependencies/{template,excel}`, `POST /dependencies/excel` |

#### Mobile (`/api/mobile/v1/notifications`) — Sin auth requerida

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/publicity/` | Publicidad sin categoría |
| GET | `/publicity/banners` | Publicidad con categoría |
| GET | `/attention_lines/dependencies` | Lista dependencias |
| GET | `/security` | Lista seguridad |
| POST | `/security/reports` | Registra reporte (con imagen) |
| GET | `/security/reports` | Reportes cercanos |
| GET | `/security/attention_points` | Puntos de atención de seguridad |
| GET | `/attention_lines/` | Líneas de atención |
| POST | `/notifications/register` | Registra push token |
| GET | `/notifications/` | Alertas activas |
| GET | `/social_networks/` | Redes sociales |
| GET | `/gender/attention_points` | Puntos de atención de género |
| GET | `/gender` | Categorías y líneas de género |
| GET | `/services/` | Servicios móviles |

### 3.4. Tráfico

#### Web (`/api/web/v1/traffic`) — Requiere auth

| Sub-ruta | Descripción |
|---|---|
| `/road_state` | Estado de vías (CRUD) |
| `/traffic_notification` | Notificaciones de tráfico |
| `/bikes/terms_conditions` | Términos y condiciones de bicicletas |

#### Mobile (`/api/mobile/v1/traffic`) — Sin auth

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/mobility` | Estado de vías |
| GET | `/bikes/terms` | Términos de bicicletas |
| POST | `/bikes/terms/agree` | Aceptar términos |
| GET | `/bikes/terms/agree` | Verificar aceptación |

### 3.5. Administración

#### Admin sin auth (`/api/web/v1/admin/admin`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/email_verification` | Verificación de email |

#### Admin con auth (`/api/web/v1/admin/admin`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/notifications` | Lista notificaciones |
| POST | `/` | Registra admin |
| POST | `/add_role/` | Asigna rol |
| POST | `/edit/` | Edita admin |
| POST | `/edit/mobile_user` | Edita usuario móvil |
| POST | `/delete` | Elimina admin |
| GET | `/:id` | Obtiene admin por ID |
| POST | `/set_passwd` | Establece contraseña |

#### Roles (`/api/web/v1/admin/role`) — Requiere auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/edit` | Edita rol |
| POST | `/delete` | Elimina rol |
| POST | `/user` | Asigna rol a usuario |
| POST | `/` | Crea rol |
| GET | `/user` | Usuarios por rol |
| GET | `/` | Lista todos los roles |
| GET | `/:id` | Obtiene rol por ID |

### 3.6. Gestión de Archivos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/web/v1/file_management/upload/image` | ✅ | Sube imagen |
| POST | `/api/web/v1/file_management/upload/pdf` | ✅ | Sube PDF |
| GET | `/api/v1/file_management/download/:folder/:fileName` | ❌ | Descarga archivo |
| GET | `/api/v1/file_management/download/secure/:folder/:fileName` | ✅ | Descarga archivo seguro |

### 3.7. Terceros

#### Mobile (`/api/mobile/v1/third_parties`) — Requiere auth mobile

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/intercity_transport` | Transporte intermunicipal |
| GET | `/intercity_transport/cities` | Ciudades |
| GET | `/third_parties/categories` | Categorías |
| GET | `/tourism/categories` | Categorías de turismo |
| GET | `/tourism/` | Empresas y servicios turísticos |
| GET | `/third_parties/` | Empresas y servicios |
| GET | `/taxis` | Consulta taxis |
| POST | `/taxis/complaint` | Queja de taxi |

#### Web (`/api/web/v1/third_parties`) — Requiere auth

| Sub-ruta | Descripción |
|---|---|
| `/city` | Ciudades (CRUD) |
| `/categories` | Categorías (CRUD) |
| `/tourism_categories` | Categorías de turismo (CRUD) |
| `/tourism_company` | Empresas turísticas (CRUD) |
| `/tourism_service` | Servicios turísticos (CRUD) |
| `/company` | Empresas (CRUD) |
| `/company_service` | Servicios de empresa (CRUD) |
| `/transport_company/route/date` | Fechas de rutas |
| `/transport_company/route/hour` | Horarios de rutas |
| `/transport_company/route` | Rutas de transporte |
| `/transport_company` | Empresas de transporte |

#### API Turismo (`/api/web/v1/third_parties/tourism_company_api`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/services/` | Lista servicios |
| POST | `/services/` | Crea servicio |
| POST | `/services/edit` | Edita servicio |
| POST | `/services/delete` | Elimina servicio |
| POST | `/services_bulk/` | Crea servicios en lote |
| POST | `/services_bulk/delete` | Elimina servicios en lote |

#### API Transporte (`/api/web/v1/third_parties/transport_company_api`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/route/date/` | Crea fecha de ruta |
| POST | `/route/date/hours` | Crea fecha con horario |
| POST | `/route/date/edit` | Edita fecha |
| POST | `/route/date/delete` | Elimina fecha |
| GET | `/route/date/` | Lista fechas |
| POST | `/route/hour/` | Crea horario |
| POST | `/route/hour/edit` | Edita horario |
| POST | `/route/hour/delete` | Elimina horario |
| GET | `/route/hour/` | Lista horarios |
| GET | `/route/itinerary` | Itinerario de ruta |
| POST | `/route/` | Crea ruta |
| POST | `/route/edit` | Edita ruta |
| POST | `/route/delete` | Elimina ruta |
| GET | `/route` | Lista rutas |

---

## 4. Autenticación

La API utiliza **Firebase Authentication** mediante `authMiddleware.js`.

- **Endpoints web**: requieren token Firebase válido (`authMiddleware`).
- **Endpoints mobile**: usan `authMiddlewareMobile`.
- **Algunos endpoints** tienen verificación de permisos por rol (`hasPermissions`).
- **Endpoints públicos**: `/health`, `/api/v1/file_management/download/*`, `/api/web/v1/admin/admin/email_verification`, tráfico mobile, notificaciones mobile.

> Los comentarios `// hasPermissions({ role: "super_master_user" })` están desactivados
> en el código. La verificación de roles está pendiente de activación.

---

## 5. Ejecución Local

### 5.1. Modo Monolito (Recomendado para desarrollo)

1. Instalar dependencias:
   ```bash
   cd src
   npm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp src/.env.example src/.env.development
   # Editar src/.env.development con tus valores
   cp src/config/account_service_key.example.json src/config/account_service_key.json
   # Editar con tu service account de Firebase
   ```

3. Ejecutar el servidor:
   ```bash
   npm start           # desarrollo (NODE_ENV=development)
   npm run start:prod  # producción local
   npm run backend     # equivalente a npm start
   ```

   El servidor corre por defecto en el puerto **3001**.

### 5.2. Health Check

```bash
curl http://localhost:3001/health
# {"msg":"everything seems to be ok"}
```

---

## 6. Despliegue

### 6.1. Requisito previo

Autenticación con Firebase y gcloud CLI:

```bash
firebase login
gcloud auth login
```

### 6.2. Deploy automatizado (recomendado)

El script `deploy.sh` crea/actualiza secrets en Secret Manager y luego deploya:

```bash
# Asegurar que src/.env.production existe con valores válidos
npm run deploy
```

### 6.3. Deploy manual

```bash
firebase deploy --only functions --project mov-cali-app-ciudadana
```

### 6.4. Configurar secrets (primera vez)

```bash
# Base de datos y storage (obligatorias)
firebase functions:secrets:set DB_HOST     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_PORT     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_NAME     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_USER     --project mov-cali-app-ciudadana
firebase functions:secrets:set DB_PASSWORD --project mov-cali-app-ciudadana
firebase functions:secrets:set FIREBASE_STORAGE_BUCKET --project mov-cali-app-ciudadana

# Correo electrónico (no activas — pendientes de habilitación)
firebase functions:secrets:set SENDGRID_API_KEY  --project mov-cali-app-ciudadana
firebase functions:secrets:set SENDGRID_EMAIL    --project mov-cali-app-ciudadana

# SMS (opcional)
firebase functions:secrets:set SIGMA_ACCOUNT_KEY --project mov-cali-app-ciudadana
```

### 6.5. URL pública

```
https://us-west1-mov-cali-app-ciudadana.cloudfunctions.net/appCiudadanaApi
```

> Para más detalles, ver [DEPLOY.md](DEPLOY.md).

---

## 7. Variables de Entorno

### 7.1. Críticas

| Variable | Descripción |
|---|---|
| `NODE_ENV` | Ambiente: `development`, `production`, `test` |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL (default: 5432) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `FIREBASE_SERVICE_ACCOUNT` | JSON del service account de Firebase (o usa archivo `.json`) |
| `FIREBASE_STORAGE_BUCKET` | Bucket de Firebase Storage |

### 7.2. No activas

> Estas variables están configuradas en el código pero el servicio correspondiente no se encuentra habilitado en producción.

| Variable | Descripción |
|---|---|
| `SENDGRID_API_KEY` | API key de SendGrid (envío de correos — pendiente de habilitación) |
| `SENDGRID_EMAIL` | Email remitente de SendGrid (envío de correos — pendiente de habilitación) |

### 7.3. Opcionales

| Variable | Descripción |
|---|---|
| `SIGMA_ACCOUNT_KEY` | Token para SMS vía Sigma |
| `FCM_TOPIC_NAME_MOBILE` | Topic de Firebase Cloud Messaging |
| `UPLOADS_DIR` | Directorio local para uploads |
| `PORT` | Puerto del servidor local (default: 3001) |

> En **producción**, las variables críticas se inyectan vía **Firebase Secret Manager**.
> En **desarrollo**, se cargan desde `src/.env.development` (via `config/dotenv.js`).

---

## 8. Contribuidores

Desarrollado para la Alcaldía de Cali.

## 9. Licencia

Derechos reservados © 2024.
