# DEPLOY.md — Guía de Despliegue

> Documentación oficial de despliegue del backend de **App Ciudadana — Alcaldía de Cali**.

---

## 1. Arquitectura de Despliegue

### 1.1 Stack Tecnológico

| Componente | Tecnología | Referencia |
|---|---|---|
| Runtime | Node.js 20 (nodejs20) | `firebase.json:4` |
| Plataforma | Firebase Cloud Functions v2 (HTTP trigger) | `functions.js` |
| Región | `us-west1` | `functions.js:8` |
| Recursos | 1 GiB memoria, 300s timeout, 80 de concurrencia | `functions.js:9-11` |
| Base de datos | PostgreSQL | `src/models/index.js` |
| ORM | Sequelize 6 | `src/models/index.js` |
| Autenticación | Firebase Admin SDK | `src/middleware/authMiddleware.js` |
| Framework HTTP | Express 4.18 | `src/app.js` |

### 1.2 Estructura del Proyecto

```
/ (raíz del repositorio)
├── firebase.json              → Configuración de Cloud Functions
├── .firebaserc                → Proyecto: mov-cali-app-ciudadana
├── deploy.sh                  → Script automatizado de despliegue
├── storage.rules              → Reglas de Firebase Storage
└── src/                       → Código fuente de Firebase Functions
    ├── functions.js           → Entry point (Cloud Functions v2)
    ├── app.js                 → Aplicación Express
    ├── all-server.js          → Entry point para desarrollo local
    ├── package.json           → Dependencias y scripts
    ├── config/                → Configuración (keys, dotenv, timezone)
    ├── middleware/            → Autenticación, errores, upload
    ├── models/                → Modelos Sequelize
    ├── migrations/            → Migraciones de base de datos
    └── microservices/         → Módulos de negocio
        ├── admin/
        ├── fileManagement/
        ├── notifications/
        ├── thirdParties/
        ├── traffic/
        └── users/
```

### 1.3 Procedimiento de Despliegue

```bash
# Despliegue automatizado (recomendado)
npm run deploy

# Despliegue manual
firebase deploy --only functions --project mov-cali-app-ciudadana
```

El script `deploy.sh` gestiona la creación o actualización de secretos en Secret Manager antes de ejecutar el despliegue. El proyecto por defecto se encuentra definido en `.firebaserc`.

### 1.4 Endpoint Público

```
https://us-west1-mov-cali-app-ciudadana.cloudfunctions.net/appCiudadanaApi
```

Todos los endpoints de la API se sirven bajo esta URL base.

---

## 2. Gestión de Configuración

### 2.1 Principio de Configuración

Las variables de entorno determinan **cómo** se ejecuta el proceso (inyectadas por el host). Los archivos de configuración determinan **qué** utiliza el código (resueltos mediante `require()`).

### 2.2 Archivos Excluidos en el Despliegue

La configuración en `firebase.json` excluye los siguientes patrones durante el despliegue a Cloud Functions:

| Patrón | Se incluye | Justificación |
|---|---|---|
| `.env`, `.env.*` | No | Contienen secretos locales |
| `**/config.json` | No | Obsoleto en producción |
| `**/*_key.json` | No | Claves de servicio |
| `**/secrets.json` | No | Secretos de servicios externos |
| `**/example.env` | No | Plantillas de referencia |

Como consecuencia, cualquier configuración que dependa de archivos JSON no estará disponible en el entorno de producción. El único mecanismo válido en Cloud Functions es `process.env`.

### 2.3 Matriz de Configuración por Entorno

| Configuración | Desarrollo | Producción |
|---|---|---|
| Base de datos | `.env.development` (`DB_*`) | Secret Manager (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) |
| Firebase Admin | `account_service_key.json` o variable `FIREBASE_SERVICE_ACCOUNT` | Variable `FIREBASE_SERVICE_ACCOUNT` o credenciales por defecto |
| Envío de correos | `email_service_key.json` o `SENDGRID_API_KEY` | Secret Manager (`SENDGRID_API_KEY`, `SENDGRID_EMAIL`) |
| SMS (Sigma) | `SIGMA_ACCOUNT_KEY` | Secret Manager (`SIGMA_ACCOUNT_KEY`) |
| Firebase Storage | `FIREBASE_STORAGE_BUCKET` | Secret Manager (`FIREBASE_STORAGE_BUCKET`) |
| Topic FCM | `FCM_TOPIC_NAME_MOBILE` | Variable de entorno |
| Directorio uploads | `UPLOADS_DIR` | Variable de entorno |
| Configuración estática | Archivos JSON en `config/` | Archivos JSON (si no están excluidos) |

### 2.4 Carga de Variables de Entorno

El módulo `src/config/dotenv.js` centraliza la carga de variables. Resuelve el archivo en el siguiente orden:

1. `.env.[NODE_ENV]` (por ejemplo, `.env.development`)
2. `.env` (fallback)

La resolución del path es relativa a `src/`, lo que permite su uso desde cualquier directorio de trabajo.

| Archivo | Propósito | Carga automática |
|---|---|---|
| `src/.env.example` | Plantilla de referencia | No |
| `src/.env` | Valor por defecto | Sí |
| `src/.env.development` | Desarrollo local | Sí (si `NODE_ENV=development`) |
| `src/.env.production` | Producción local | Sí (si `NODE_ENV=production`) |

En Cloud Functions, los archivos `.env.*` no se despliegan. Los valores se inyectan mediante Secret Manager.

### 2.5 Archivos de Configuración Estática

| Archivo | Propósito | Se despliega |
|---|---|---|
| `config.js` | Configuración de base de datos | Sí |
| `dotenv.js` | Módulo de carga de variables | Sí |
| `microservices_urls.json` | URLs de microservicios | Sí |
| `utc_zone.json` | Zona horaria | Sí |
| `account_service_key.json` | Cuenta de servicio Firebase (dev) | No |
| `account_service_key-prod.json` | Cuenta de servicio Firebase (prod) | No |
| `email_service_key.json` | Clave de SendGrid | No |

---

## 3. Variables de Entorno

### 3.1 Catálogo de Variables

| Variable | Módulo | Propósito | Prioridad |
|---|---|---|---|
| `NODE_ENV` | Global | Entorno de ejecución | Crítica |
| `DB_HOST` | `models/index.js` | Servidor PostgreSQL | Crítica |
| `DB_PORT` | `models/index.js` | Puerto PostgreSQL (predeterminado: 5432) | Crítica |
| `DB_NAME` | `models/index.js`, `migrations/` | Nombre de la base de datos | Crítica |
| `DB_USER` | `models/index.js` | Usuario de PostgreSQL | Crítica |
| `DB_PASSWORD` | `models/index.js` | Contraseña de PostgreSQL | Crítica |
| `FIREBASE_SERVICE_ACCOUNT` | `authMiddleware.js` | Clave de Firebase Admin (JSON) | Crítica |
| `FIREBASE_STORAGE_BUCKET` | `fileManagement/`, `config/` | Bucket de Firebase Storage | Crítica |
| `SENDGRID_API_KEY` | `sendMail.js`, `webAdmin.js` | Clave de API de SendGrid (envío de correos) | No activa |
| `SENDGRID_EMAIL` | `sendMail.js`, `webAdmin.js` | Correo remitente | No activa |
| `FCM_TOPIC_NAME_MOBILE` | `notifications/` | Topic de Firebase Cloud Messaging | Opcional |
| `SIGMA_ACCOUNT_KEY` | `notifications/` | Token de SMS (Sigma) | Opcional |
| `UPLOADS_DIR` | `fileManagement/` | Directorio de cargas | Opcional |
| `PORT` | `all-server.js` | Puerto del servidor local | Opcional |

### 3.2 Construcción de la URL de Conexión

La cadena de conexión a la base de datos se construye en `src/models/index.js` a partir de las variables `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` y `DB_NAME`. Las credenciales se codifican mediante `encodeCredential` (variante de `encodeURIComponent` que también escapa `! ' ( ) *`). Este enfoque permite gestionar cada componente como un secreto individual.

### 3.3 Secretos en Producción

Los secretos se gestionan mediante **Firebase Secret Manager**, que los expone como variables de entorno en tiempo de ejecución.

#### Declaración en el código

Las siguientes secrets están declaradas en `functions.js`:

```js
secrets: [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "SENDGRID_API_KEY",     // No activa — envío de correos pendiente de habilitación
  "SENDGRID_EMAIL",       // No activa — envío de correos pendiente de habilitación
  "SIGMA_ACCOUNT_KEY",    // Opcional — servicio SMS
  "FIREBASE_STORAGE_BUCKET",
]
```

#### Procedimiento de configuración

```bash
# Base de datos (obligatorias)
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

> El método `firebase functions:config:set` se encuentra deprecado en Cloud Functions v2.

---

## 4. Script de Despliegue

### 4.1 Descripción

El script `deploy.sh` (ubicado en la raíz del repositorio) automatiza el siguiente flujo:

1. Lectura de variables desde `src/.env.production`
2. Creación o actualización de secretos en Secret Manager mediante `gcloud`
3. Despliegue de la función a Firebase Cloud Functions

### 4.2 Secrets Gestionadas

**Obligatorias:**

| Secret | Variable de origen |
|---|---|
| `DB_HOST` | `DB_HOST` |
| `DB_PORT` | `DB_PORT` |
| `DB_NAME` | `DB_NAME` |
| `DB_USER` | `DB_USER` |
| `DB_PASSWORD` | `DB_PASSWORD` |
| `FIREBASE_STORAGE_BUCKET` | `FIREBASE_STORAGE_BUCKET` |

**Opcionales:**

| Secret | Variable de origen | Notas |
|---|---|---|
| `SENDGRID_API_KEY` | `SENDGRID_API_KEY` | No activa — envío de correos pendiente de habilitación |
| `SENDGRID_EMAIL` | `SENDGRID_EMAIL` | No activa — envío de correos pendiente de habilitación |
| `SIGMA_ACCOUNT_KEY` | `SIGMA_ACCOUNT_KEY` | Servicio SMS |
| `FCM_TOPIC_NAME_MOBILE` | `FCM_TOPIC_NAME_MOBILE` | Topic FCM para notificaciones push |

### 4.3 Requisitos

- CLI de `gcloud` autenticada con permisos de Secret Manager
- CLI de `firebase` autenticada
- Archivo `src/.env.production` con valores válidos

---

## 5. Cuentas de Servicio de Firebase

### 5.1 Gestión de Claves

| Entorno | ID del Proyecto | Ubicación de la clave |
|---|---|---|
| Desarrollo | `app-ciudadana-cali` | `src/config/account_service_key.json` |
| Producción | `mov-cali-app-ciudadana` | `src/config/account_service_key-prod.json` |

Las claves de cuenta de servicio no deben versionarse. Los patrones correspondientes se encuentran excluidos en `.gitignore`.

### 5.2 Módulos que Utilizan la Clave

| Módulo | Uso |
|---|---|
| `src/middleware/authMiddleware.js` | Inicialización de Firebase Admin (fallback) |
| `src/create-user-util.js` | Creación de usuarios en Firebase Auth |
| `src/seeders/seedAdmin.js` | Seeder de administrador inicial |

### 5.3 Configuración para Desarrollo

Existe una plantilla versionable en `src/config/account_service_key.example.json`. Para utilizarla:

```bash
cp src/config/account_service_key.example.json src/config/account_service_key.json
```

### 5.4 Alternativa mediante Variable de Entorno

En lugar de un archivo, puede utilizarse la variable `FIREBASE_SERVICE_ACCOUNT` con el contenido JSON de la cuenta de servicio. Este enfoque es preferible para entornos serverless.

---

## 6. Referencia de Endpoints

### 6.1 Vista General de Rutas

Todos los endpoints se sirven bajo la URL base de Cloud Functions:

```
https://us-west1-mov-cali-app-ciudadana.cloudfunctions.net/appCiudadanaApi
```

| Prefijo | Autenticación | Descripción |
|---|---|---|
| `/health` | No requerida | Verificación de estado del servicio |
| `/api/web/v1/admin/admin` | No requerida (libre) | Verificación de correo electrónico |
| `/api/web/v1/admin/admin` | Requerida | Administración de usuarios y roles |
| `/api/web/v1/admin/role` | Requerida | Gestión de roles |
| `/api/web/v1/notifications` | Requerida | Notificaciones (panel web) |
| `/api/mobile/v1/notifications` | No requerida | Notificaciones (aplicación móvil) |
| `/api/web/v1/users` | Requerida | Usuarios (panel web) |
| `/api/mobile/v1/users` | Requerida (móvil) | Usuarios (aplicación móvil) |
| `/api/web/v1/third_parties` | Requerida | Terceros (panel web) |
| `/api/mobile/v1/third_parties` | Requerida (móvil) | Terceros (aplicación móvil) |
| `/api/web/v1/third_parties/tourism_company_api` | Requerida | API de turismo |
| `/api/web/v1/third_parties/transport_company_api` | Requerida | API de transporte |
| `/api/web/v1/file_management/upload` | Requerida | Carga de archivos |
| `/api/v1/file_management/download` | No requerida | Descarga de archivos |
| `/api/web/v1/traffic` | Requerida | Estado de vías (panel web) |
| `/api/mobile/v1/traffic` | No requerida | Estado de vías (aplicación móvil) |

### 6.2 Administración

**Ruta libre (sin autenticación):**

| Método | Ruta | Controlador |
|---|---|---|
| POST | `/api/web/v1/admin/admin/email_verification` | `postEmailVerification` |

**Ruta con autenticación:**

| Método | Ruta | Controlador |
|---|---|---|
| GET | `/api/web/v1/admin/admin/notifications` | `getAllNotifications` |
| POST | `/api/web/v1/admin/admin/` | `postRegister` |
| POST | `/api/web/v1/admin/admin/add_role/` | `postAddRole` |
| POST | `/api/web/v1/admin/admin/edit/` | `postEdit` |
| POST | `/api/web/v1/admin/admin/edit/mobile_user` | `postEditMobileUser` |
| POST | `/api/web/v1/admin/admin/delete` | `postDelete` |
| GET | `/api/web/v1/admin/admin/:id` | `getOneById` |
| POST | `/api/web/v1/admin/admin/set_passwd` | `postSetPasswd` |

**Gestión de roles:**

| Método | Ruta | Controlador |
|---|---|---|
| POST | `/api/web/v1/admin/role/edit` | `postEdit` |
| POST | `/api/web/v1/admin/role/delete` | `postDelete` |
| POST | `/api/web/v1/admin/role/user` | `postAssignRoleToUser` |
| POST | `/api/web/v1/admin/role/` | `postRegister` |
| GET | `/api/web/v1/admin/role/user` | `getUsersByRoleId` |
| GET | `/api/web/v1/admin/role/` | `getAll` |
| GET | `/api/web/v1/admin/role/:id` | `getRole` |

### 6.3 Usuarios

**Panel web:**

| Método | Ruta | Controlador |
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

**Aplicación móvil:**

| Método | Ruta | Controlador |
|---|---|---|
| POST | `/api/mobile/v1/users/account/info` | `postAccountInfo` |
| POST | `/api/mobile/v1/users/account/full_login` | `postAccountBaseLogin` |
| GET | `/api/mobile/v1/users/account/info` | `getAccountInfo` |
| GET | `/api/mobile/v1/users/account/login/phase` | `getAccountLoginPhase` |
| POST | `/api/mobile/v1/users/account/edit` | `postAccountFullLogin` |
| GET | `/api/mobile/v1/users/document_types` | `getAll` |

### 6.4 Notificaciones

**Panel web:**

| Método | Ruta | Controlador |
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

**Aplicación móvil:**

| Método | Ruta | Controlador |
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

### 6.5 Tráfico

**Panel web** (sub-rutas bajo `/api/web/v1/traffic`):

| Sub-ruta | Descripción |
|---|---|
| `/road_state` | Estado de vías |
| `/traffic_notification` | Notificaciones de tráfico |
| `/bikes/terms_conditions` | Términos de bicicletas |

**Aplicación móvil:**

| Método | Ruta | Controlador |
|---|---|---|
| GET | `/api/mobile/v1/traffic/mobility` | `getRoadStates` |
| GET | `/api/mobile/v1/traffic/bikes/terms` | `getTerms` |
| POST | `/api/mobile/v1/traffic/bikes/terms/agree` | `postAcceptTerms` |
| GET | `/api/mobile/v1/traffic/bikes/terms/agree` | `getAcceptTerms` |

### 6.6 Gestión de Archivos

| Método | Ruta | Autenticación | Controlador |
|---|---|---|---|
| POST | `/api/web/v1/file_management/upload/image` | Requerida | `postSingleFile` |
| POST | `/api/web/v1/file_management/upload/pdf` | Requerida | `postSingleFile` |
| GET | `/api/v1/file_management/download/:folder/:fileName` | No requerida | `downloadFile` |
| GET | `/api/v1/file_management/download/secure/:folder/:fileName` | Requerida | `downloadSecuredFile` |

### 6.7 Terceros

**Aplicación móvil:**

| Método | Ruta | Controlador |
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

| Sub-ruta | Descripción |
|---|---|
| `/city` | Ciudades |
| `/categories` | Categorías |
| `/tourism_categories` | Categorías de turismo |
| `/tourism_company` | Empresas turísticas |
| `/tourism_service` | Servicios turísticos |
| `/company` | Empresas |
| `/company_service` | Servicios de empresa |
| `/transport_company/route/date` | Fechas de rutas |
| `/transport_company/route/hour` | Horarios de rutas |
| `/transport_company/route` | Rutas de transporte |
| `/transport_company` | Empresas de transporte |

**API de turismo** (`/api/web/v1/third_parties/tourism_company_api`):

| Método | Ruta | Controlador |
|---|---|---|
| GET | `/services/` | `getServices` |
| POST | `/services/` | `postService` |
| POST | `/services/edit` | `postEdit` |
| POST | `/services/delete` | `postDelete` |
| POST | `/services_bulk/` | `postBulkService` |
| POST | `/services_bulk/delete` | `postBulkServiceDelete` |

**API de transporte** (`/api/web/v1/third_parties/transport_company_api`):

| Método | Ruta | Controlador |
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

## 7. Estado de la Migración de Configuración

### 7.1 Tareas Completadas

- Unificación de la carga de variables de entorno mediante `src/config/dotenv.js`.
- Eliminación de contraseñas hardcodeadas de archivos de configuración.
- Eliminación de archivos de configuración obsoletos (`config.json`, `config.sample.json`).
- Eliminación de archivos `.env` huérfanos no gestionados por el sistema de carga.
- Declaración de secretos en `functions.js` para Cloud Functions v2.
- Construcción de la URL de conexión a base de datos en `models/index.js` a partir de componentes individuales.

### 7.2 Tareas Pendientes

- Creación de secretos en Secret Manager para las variables de base de datos (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- Creación de secretos para servicios externos (`SENDGRID_API_KEY`, `SENDGRID_EMAIL`, `SIGMA_ACCOUNT_KEY`, `FIREBASE_STORAGE_BUCKET`).
