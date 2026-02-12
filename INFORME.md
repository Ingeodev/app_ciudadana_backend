# INFORME: Arquitectura del Backend - App Ciudadana (Secretaría de Movilidad de Cali)

## 1. Resumen General

Este backend está desarrollado en **Node.js** con **Express** y sigue una arquitectura de **microservicios**. Fue diseñado para ser desplegado en **Google Cloud Platform (GCP)**, específicamente en **Cloud Run**, con imágenes Docker almacenadas en **Artifact Registry** y CI/CD mediante **Cloud Build**.

El proyecto consta de **6 microservicios** que alimentan aplicaciones móviles y web para la Secretaría de Movilidad de Cali:

| Microservicio | Directorio | Descripción breve |
|---|---|---|
| **Admin** | `src/microservices/admin` | Gestión de administradores y roles |
| **Users** | `src/microservices/users` | Gestión de usuarios (web y móvil) |
| **File Management** | `src/microservices/fileManagement` | Carga y descarga de archivos |
| **Notifications** | `src/microservices/notifications` | Alertas, reportes, seguridad, publicidad |
| **Third Parties** | `src/microservices/thirdParties` | Empresas de turismo, transporte y taxis |
| **Traffic** | `src/microservices/traffic` | Estado de vías, bicicletas, notificaciones de tráfico |

---

## 2. Stack Tecnológico

| Tecnología | Uso |
|---|---|
| Node.js 18 | Runtime |
| Express 4 | Framework HTTP |
| Sequelize 6 | ORM para PostgreSQL |
| PostgreSQL (pg) | Base de datos relacional |
| Firebase Admin SDK 11 | Autenticación y Cloud Messaging (push) |
| SendGrid (@sendgrid/mail) | Envío de correos electrónicos |
| Multer | Manejo de archivos (upload en memoria) |
| Joi | Validación de datos |
| Axios | Peticiones HTTP a APIs externas |
| Luxon | Manejo de fechas y zonas horarias |
| @turf/turf | Operaciones geoespaciales (polígono de Cali) |
| node-xlsx | Lectura/escritura de archivos Excel |
| Docker | Contenedorización |
| GCS Fuse | Montaje de buckets de GCP como sistema de archivos |
| Terraform | Infraestructura como código (GCP) |

---

## 3. Arquitectura de Despliegue

### 3.1 Modo Individual (Producción - Docker)

Cada microservicio tiene su propio `Dockerfile` y se despliega como un contenedor independiente en **Cloud Run** (región `us-east1`). Cada uno escucha en el **puerto 3000**.

```
cloudbuild.yaml → Build Docker images → Push a Artifact Registry → Deploy a Cloud Run
```

**Flujo de CI/CD (Cloud Build):**
1. Se extraen secretos de **GCP Secret Manager** (service keys, config DB, secretos de notificaciones).
2. Se construye la imagen Docker de cada microservicio.
3. Se publica cada imagen en Artifact Registry (`us-east1-docker.pkg.dev/cali-mobility/...`).
4. Se despliega cada servicio en Cloud Run.

### 3.2 Modo Monolito (Desarrollo Local)

El archivo `src/all-server.js` levanta **todos los microservicios en un solo proceso Express** en el **puerto 3001**. Este es el modo recomendado para desarrollo local.

### 3.3 Infraestructura GCP (Terraform)

Definida en `src/infra/`:
- **Proyecto GCP:** `cali-mobility` / `cali-mobility-automated`
- **Región:** `us-east1`
- **Artifact Registry:** Repositorios Docker por microservicio
- **Cloud Storage Bucket:** `cali-mobility-automated-data` (archivos subidos)
- **Cloud Run:** 6 servicios individuales

---

## 4. Archivos de Configuración Requeridos

Todos se ubican en `src/config/`. Se deben crear a partir de los archivos de ejemplo:

### 4.1 `config.json` (Conexión a Base de Datos)

Basado en `config.sample.json`. Define credenciales de PostgreSQL por entorno.

```json
{
  "development": {
    "username": "<USUARIO>",
    "password": "<CONTRASEÑA>",
    "database": "calimobility",
    "host": "<HOST_POSTGRESQL>",
    "dialect": "postgres"
  },
  "test": { "..." : "..." },
  "production": { "..." : "..." }
}
```

### 4.2 `account_service_key.json` (Firebase Admin SDK)

Basado en `account_service_key.example.json`. Es la clave de servicio del proyecto Firebase.

```json
{
  "type": "service_account",
  "project_id": "<PROJECT_ID>",
  "private_key_id": "<KEY_ID>",
  "private_key": "<PRIVATE_KEY>",
  "client_email": "<SERVICE_ACCOUNT_EMAIL>",
  "client_id": "<CLIENT_ID>",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

### 4.3 `email_service_key.json` (SendGrid)

Basado en `email_service_key.example.json`. Credenciales de SendGrid para envío de correos.

```json
{
  "email": "<EMAIL_REMITENTE>",
  "api_key": "<SENDGRID_API_KEY>"
}
```

### 4.4 `microservices_urls.json` (URLs de otros servicios)

URLs del frontend y del servicio de file management en producción.

```json
{
  "front": "https://<URL_FRONTEND>",
  "fileManagement": "https://<URL_FILE_MANAGEMENT>"
}
```

### 4.5 `utc_zone.json` (Zona horaria)

Ya configurado. Zona horaria de la base de datos.

```json
{
  "UTC_ZONE_DB": "America/Bogota"
}
```

### 4.6 `secrets/notification_secrets.json` (Notifications)

Ubicado en `src/microservices/notifications/secrets.json`. Basado en `secrets.sample.json`.

```json
{
  "SIGMA_ACCOUNT_KEY": "<SIGMA_API_KEY>"
}
```

---

## 5. Variables de Entorno

| Variable | Uso | Obligatoria | Microservicio |
|---|---|---|---|
| `NODE_ENV` | Entorno (`development`, `test`, `production`). Determina qué config de DB se usa. Default: `development` | No | Todos |
| `PORT` | Puerto del servidor. Default: `3000` | No | fileManagement |
| `FCM_TOPIC_NAME_MOBILE` | Nombre del topic de Firebase Cloud Messaging para notificaciones push a móviles. Ejemplo: `mobileUsersNotifications` | Sí | Notifications |
| `BUCKET` | Nombre del bucket de GCS (solo para deploy con GCS Fuse en GCP) | Solo en GCP | Todos (en Docker) |

Se recomienda crear un archivo `.env` en `src/` con:

```env
NODE_ENV=development
FCM_TOPIC_NAME_MOBILE=mobileUsersNotifications
PORT=3000
```

---

## 6. Descripción Detallada de Microservicios

---

### 6.1 Admin (`src/microservices/admin`)

**Descripción:** Gestiona los usuarios administradores del sistema web y sus roles/permisos. Permite crear, editar, eliminar administradores, asignar roles con políticas de acceso, y restablecer contraseñas. También provee un endpoint para consultar notificaciones internas del panel administrativo.

**Puerto individual:** 3000

**Endpoints principales:**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/web/v1/admin/admin` | POST | Registrar un nuevo administrador |
| `/api/web/v1/admin/admin/edit` | POST | Editar un administrador |
| `/api/web/v1/admin/admin/delete` | POST | Eliminar un administrador |
| `/api/web/v1/admin/admin/set_passwd` | POST | Cambiar contraseña |
| `/api/web/v1/admin/admin/add_role` | POST | Asignar rol a usuario |
| `/api/web/v1/admin/admin/notifications` | GET | Listar notificaciones admin |
| `/api/web/v1/admin/admin/:id` | GET | Obtener admin por ID |
| `/api/web/v1/admin/role` | CRUD | Gestión de roles y políticas |

**Tabla de dependencias externas:**

| Dependencia | Tipo | Uso |
|---|---|---|
| PostgreSQL | Base de datos | Tablas: `User`, `Role`, `AdminNotification` |
| Firebase Admin SDK | Autenticación | Creación/edición de usuarios en Firebase, verificación de tokens, custom claims |
| SendGrid | Email | Envío de correos (reset de contraseña, verificación) |

---

### 6.2 Users (`src/microservices/users`)

**Descripción:** Gestiona los usuarios de la plataforma, tanto web (administradores) como móviles (ciudadanos). Provee endpoints separados para cada tipo de cliente. Permite registrar usuarios, listar, editar, habilitar/deshabilitar, y gestionar verificación de correos.

**Puerto individual:** 3000

**Endpoints principales:**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/web/v1/users` | GET/POST | CRUD de usuarios web |
| `/api/mobile/v1/users` | GET/POST | CRUD de usuarios móviles |

**Tabla de dependencias externas:**

| Dependencia | Tipo | Uso |
|---|---|---|
| PostgreSQL | Base de datos | Tablas: `User`, `Role`, `DocumentType` |
| Firebase Admin SDK | Autenticación | Creación de usuarios, verificación de tokens, generación de enlaces de verificación de email y reset de contraseña |
| SendGrid | Email | Envío de correos de verificación y restablecimiento de contraseña |

---

### 6.3 File Management (`src/microservices/fileManagement`)

**Descripción:** Servicio de gestión de archivos. Permite subir archivos (imágenes, PDFs) al servidor y descargarlos mediante una URI generada. En producción, el almacenamiento se monta desde un bucket de Google Cloud Storage usando **GCS Fuse**. Los archivos se almacenan en una carpeta `uploads/` relativa al directorio del servicio.

**Puerto individual:** 3000 (configurable vía `PORT`)

**Endpoints principales:**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/web/v1/file_management/upload` | POST | Subir un archivo (imagen/PDF) |
| `/api/v1/file_management/download/:folder/:fileName` | GET | Descargar un archivo público |

**Tabla de dependencias externas:**

| Dependencia | Tipo | Uso |
|---|---|---|
| PostgreSQL | Base de datos | No usa directamente (pero carga los modelos) |
| GCS Fuse / Sistema de archivos | Almacenamiento | Directorio `uploads/` (local o montado desde GCS bucket) |
| Multer | Librería | Procesamiento de archivos en memoria antes de guardarlos |

---

### 6.4 Notifications (`src/microservices/notifications`)

**Descripción:** Es el microservicio más grande y complejo. Gestiona toda la información que se muestra a los ciudadanos en la app móvil y los datos que los administradores configuran desde el panel web. Incluye:

- **Alertas/Notificaciones push** (Firebase Cloud Messaging) y SMS (SIGMA Movil)
- **Publicidad/Anuncios** (banners informativos con categorías)
- **Seguridad ciudadana** (puntos de atención, categorías, reportes ciudadanos)
- **Género** (líneas de atención, puntos de atención, categorías de género)
- **Redes sociales** de la Secretaría
- **Líneas de atención** telefónica
- **Dependencias** administrativas de la Secretaría (importación por Excel)
- **Servicios móviles** (configuración de servicios visibles en la app)
- **Reportes ciudadanos** (aprobación, desaprobación, expiración + subida de imágenes)
- **Configuraciones de reportes**

**Puerto individual:** 3000

**Endpoints principales (Web):**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/web/v1/notifications/informationmb` | GET/POST | CRUD de publicidad/anuncios |
| `/api/web/v1/notifications/alert` | GET/POST | Enviar y listar alertas (push + SMS) |
| `/api/web/v1/notifications/security` | CRUD | Gestión de entidades de seguridad |
| `/api/web/v1/notifications/security_category` | CRUD | Categorías de seguridad |
| `/api/web/v1/notifications/security/attentionPoint` | CRUD | Puntos de atención de seguridad |
| `/api/web/v1/notifications/security/reports` | GET/POST | Gestión de reportes |
| `/api/web/v1/notifications/gender_line` | CRUD | Líneas de atención de género |
| `/api/web/v1/notifications/gender_category` | CRUD | Categorías de género |
| `/api/web/v1/notifications/gender_point` | CRUD | Puntos de atención de género |
| `/api/web/v1/notifications/social_networks` | CRUD | Redes sociales |
| `/api/web/v1/notifications/mobile_services` | CRUD | Servicios móviles |
| `/api/web/v1/notifications/attention_lines` | GET/POST | Líneas de atención |
| `/api/web/v1/notifications/dependencies` | GET/POST | Dependencias (incluyendo importación Excel) |

**Endpoints principales (Móvil):**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/mobile/v1/notifications/publicity` | GET | Anuncios (con y sin categoría) |
| `/api/mobile/v1/notifications/notifications/register` | POST | Registrar dispositivo para push |
| `/api/mobile/v1/notifications/notifications` | GET | Listar alertas activas |
| `/api/mobile/v1/notifications/security` | GET | Info de seguridad |
| `/api/mobile/v1/notifications/security/reports` | GET/POST | Reportes ciudadanos |
| `/api/mobile/v1/notifications/gender` | GET | Categorías y líneas de género |
| `/api/mobile/v1/notifications/social_networks` | GET | Redes sociales |
| `/api/mobile/v1/notifications/services` | GET | Servicios móviles |

**Tabla de dependencias externas:**

| Dependencia | Tipo | Uso |
|---|---|---|
| PostgreSQL | Base de datos | Tablas: `Alert`, `Advertisement`, `Security`, `SecurityCategory`, `SecurityAttentionPoint`, `GenderCategory`, `GenderAttentionLine`, `GenderAttentionPoint`, `SocialNetwork`, `SocialNetworkType`, `Report`, `ReportStatus`, `ReportConfiguration`, `MobileService`, `AttentionLine`, `Dependency`, `RoadState`, `User` |
| Firebase Admin SDK | Autenticación + Push | Verificación de tokens + envío de notificaciones push vía FCM Topics |
| SIGMA Movil API | SMS | Envío masivo de SMS a ciudadanos (`https://aio2.sigmamovil.com/api/sms`) |
| @turf/turf | Geoespacial | Validación de coordenadas dentro del polígono de Cali |
| Multer | Archivos | Subida de imágenes en reportes y archivos Excel de dependencias |

**Variable de entorno requerida:** `FCM_TOPIC_NAME_MOBILE`

**Archivo de secretos requerido:** `secrets.json` (clave SIGMA para SMS)

---

### 6.5 Third Parties (`src/microservices/thirdParties`)

**Descripción:** Gestiona las empresas de terceros vinculadas a la movilidad de Cali. Incluye tres categorías principales:

- **Empresas de turismo:** Categorías, empresas, servicios turísticos
- **Empresas de transporte:** Compañías, rutas, horarios, tarifas
- **Categorías generales de terceros** (taxis, etc.)
- **API de consulta de taxis** (servicio externo)
- **Ciudades** asociadas a las rutas

**Puerto individual:** 3000

**Endpoints principales (Web):**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/web/v1/third_parties` | CRUD | Gestión general de terceros |
| `/api/web/v1/third_parties/tourism_company_api` | GET/POST | API de empresas de turismo |
| `/api/web/v1/third_parties/transport_company_api` | GET/POST | API de empresas de transporte + importación de rutas Excel |

**Endpoints principales (Móvil):**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/mobile/v1/third_parties` | GET | Consulta de empresas, categorías, servicios, rutas |

**Tabla de dependencias externas:**

| Dependencia | Tipo | Uso |
|---|---|---|
| PostgreSQL | Base de datos | Tablas: `ThirdPartyCompany`, `ThirdPartyCategory`, `ThirdPartyService`, `TourismCompany`, `TourismCategory`, `TourismService`, `TransportCompany`, `TransportRoute`, `RouteTimetable`, `RouteTimetableHourTariff`, `City`, `TaxiComplaint` |
| API externa de Taxis | API REST | Consulta de información (`https://www.mycodestorage.com/AppCiudadana/APIS/PaqueteB/TAXI.php`) |
| Firebase Admin SDK | Autenticación | Verificación de tokens |
| Multer | Archivos | Importación de rutas por Excel |

---

### 6.6 Traffic (`src/microservices/traffic`)

**Descripción:** Gestiona la información de tráfico y movilidad de la ciudad. Incluye el estado de las vías, términos y condiciones del servicio de bicicletas, y notificaciones de tráfico.

**Puerto individual:** 3000

**Endpoints principales (Web):**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/web/v1/traffic` | CRUD | Gestión de estado de vías, bicicletas, notificaciones |

**Endpoints principales (Móvil):**

| Ruta | Método | Descripción |
|---|---|---|
| `/api/mobile/v1/traffic` | GET | Consulta de estado de vías, bicicletas, notificaciones |

**Tabla de dependencias externas:**

| Dependencia | Tipo | Uso |
|---|---|---|
| PostgreSQL | Base de datos | Tablas: `RoadState`, `BicyclesTermCondition`, `TrafficNotification` |
| Firebase Admin SDK | Autenticación | Verificación de tokens |

---

## 7. Dependencias Compartidas (Transversales)

Las siguientes dependencias son compartidas por **todos** los microservicios a través de las carpetas `src/middleware`, `src/models`, `src/utils` y `src/config`:

| Dependencia | Componente | Descripción |
|---|---|---|
| **PostgreSQL** | `src/models/index.js` | ORM Sequelize que carga 37 modelos automáticamente. Se configura desde `config/config.json`. |
| **Firebase Admin SDK** | `src/middleware/authMiddleware.js` | Inicialización global de Firebase. Exporta `authMiddleware` (web) y `authMiddlewareMobile` (móvil). |
| **SendGrid** | `src/utils/sendMail.js` | Envío de correos. Se configura desde `config/email_service_key.json`. |
| **Firebase (CRUD usuarios)** | `src/utils/firebaseAdmin.js` | Crear/eliminar usuarios en Firebase, cambiar contraseñas, generar enlaces de verificación. |
| **Validación geoespacial** | `src/utils/polygonCali.js` | Polígono de la ciudad de Cali para validar coordenadas dentro de los límites de la ciudad. |
| **Zona horaria** | `src/utils/utcZone.js` | Ajuste de timestamps a la zona horaria `America/Bogota`. |

---

## 8. Cómo Ejecutar el Backend en Local

### 8.1 Requisitos Previos

1. **Node.js 18+** instalado
2. **PostgreSQL** instalado y corriendo (local o remota)
3. **Proyecto de Firebase** con Authentication habilitado
4. **Cuenta de SendGrid** (opcional, solo si se necesita enviar correos)

### 8.2 Pasos para Ejecutar

```bash
# 1. Navegar al directorio del código fuente
cd src/

# 2. Instalar dependencias
npm install

# 3. Crear los archivos de configuración
# Copiar y completar cada archivo de ejemplo:
cp config/config.sample.json config/config.json
cp config/account_service_key.example.json config/account_service_key.json
cp config/email_service_key.example.json config/email_service_key.json

# 4. Crear el archivo de secretos de notificaciones
# Copiar y completar:
cp microservices/notifications/secrets.sample.json microservices/notifications/secrets.json

# 5. Crear el archivo .env en src/
cat > .env << EOF
NODE_ENV=development
FCM_TOPIC_NAME_MOBILE=mobileUsersNotifications
PORT=3000
EOF

# 6. Ejecutar en modo monolito (todos los microservicios juntos)
npm run backend
# El servidor estará en http://localhost:3001

# Alternativa: ejecutar un microservicio individual
# cd microservices/admin && node index.js   → http://localhost:3000
```

### 8.3 Archivos a Editar con Datos Reales

| Archivo | Dato requerido |
|---|---|
| `config/config.json` | `username`, `password`, `host` de PostgreSQL |
| `config/account_service_key.json` | Clave de servicio de Firebase (descargar desde Firebase Console) |
| `config/email_service_key.json` | `email` remitente y `api_key` de SendGrid |
| `microservices/notifications/secrets.json` | `SIGMA_ACCOUNT_KEY` para el servicio de SMS |
| `config/microservices_urls.json` | URLs del frontend y servicio de file management (para local: `http://localhost:3001`) |

### 8.4 Verificar que Funciona

```bash
# Health check
curl http://localhost:3001/health
# Respuesta esperada: {"msg":"everything seems to be ok"}
```

### 8.5 Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| `npm run backend` | `nodemon ./all-server.js` | Levanta todos los microservicios en modo monolito (puerto 3001) con hot-reload |
| `npm start` | `nodemon ./index.js` | Levanta solo el `index.js` raíz (puerto 3000, endpoint básico) |
| `npm test` | `jest` | Ejecuta tests (requiere microservicios corriendo) |
| `npm run format` | `prettier --write .` | Formatea el código |

---

## 9. Modelos de Base de Datos (37 tablas)

Los siguientes modelos Sequelize existen en `src/models/`:

| Modelo | Tabla | Microservicio(s) que lo usan |
|---|---|---|
| `User` | users | Admin, Users, Notifications |
| `Role` | roles | Admin |
| `AdminNotification` | admin_notifications | Admin |
| `Alert` | alerts | Notifications |
| `Advertisement` | advertisements | Notifications |
| `Security` | securities | Notifications |
| `SecurityCategory` | security_categories | Notifications |
| `SecurityAttentionPoint` | security_attention_points | Notifications |
| `GenderCategory` | gender_categories | Notifications |
| `GenderAttentionLine` | gender_attention_lines | Notifications |
| `GenderAttentionPoint` | gender_attention_points | Notifications |
| `Report` | reports | Notifications |
| `ReportStatus` | report_statuses | Notifications |
| `ReportConfiguration` | report_configurations | Notifications |
| `MobileService` | mobile_services | Notifications |
| `AttentionLine` | attention_lines | Notifications |
| `Dependency` | dependencies | Notifications |
| `SocialNetwork` | social_networks | Notifications |
| `SocialNetworkType` | social_network_types | Notifications |
| `ThirdPartyCompany` | third_party_companies | Third Parties |
| `ThirdPartyCategory` | third_party_categories | Third Parties |
| `ThirdPartyService` | third_party_services | Third Parties |
| `TourismCompany` | tourism_companies | Third Parties |
| `TourismCategory` | tourism_categories | Third Parties |
| `TourismService` | tourism_services | Third Parties |
| `TransportCompany` | transport_companies | Third Parties |
| `TransportRoute` | transport_routes | Third Parties |
| `RouteTimetable` | route_timetables | Third Parties |
| `RouteTimetableHourTariff` | route_timetable_hour_tariffs | Third Parties |
| `City` | cities | Third Parties |
| `TaxiComplaint` | taxi_complaints | Third Parties |
| `RoadState` | road_states | Traffic, Notifications |
| `BicyclesTermCondition` | bicycles_term_conditions | Traffic |
| `TrafficNotification` | traffic_notifications | Traffic |
| `DocumentType` | document_types | Users |
| `UserApiKey` | user_api_keys | (API pública) |

> **Nota:** Todos los modelos son cargados automáticamente por `src/models/index.js`, por lo que están disponibles para cualquier microservicio, aunque no todos los usen.

---

## 10. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTES                                      │
│         App Móvil (Android/iOS)    │    Panel Web Admin           │
└────────────────┬───────────────────┴──────────┬──────────────────┘
                 │ Firebase Auth Token          │
                 ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              LOAD BALANCER / CLOUD RUN                           │
├─────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│  Admin  │  Users   │  File    │  Notif   │  Third   │  Traffic  │
│  :3000  │  :3000   │  Mgmt    │  :3000   │  Parties │  :3000    │
│         │          │  :3000   │          │  :3000   │           │
├─────────┴──────────┴──────────┴──────────┴──────────┴───────────┤
│                   Middleware Compartido                           │
│         authMiddleware (Firebase) │ errorHandler                  │
├─────────────────────────────────────────────────────────────────┤
│              Sequelize ORM  (37 modelos)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────────────┐
              ▼              ▼                      ▼
      ┌──────────┐  ┌───────────────┐      ┌──────────────┐
      │ PostgreSQL│  │ Firebase Auth │      │ GCS Bucket   │
      │ (Aurora)  │  │ + FCM Push    │      │ (archivos)   │
      └──────────┘  └───────────────┘      └──────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             ┌───────────┐    ┌─────────────┐
             │ SendGrid  │    │ SIGMA SMS   │
             │ (Email)   │    │ (SMS masivo)│
             └───────────┘    └─────────────┘
```

---

## 11. Notas Importantes

1. **Base de datos compartida:** Todos los microservicios comparten la misma base de datos PostgreSQL. No hay separación de esquemas.

2. **Firebase inicialización:** Firebase Admin SDK se inicializa una sola vez en `authMiddleware.js` y se exporta para ser reutilizado por los demás módulos.

3. **Sin autenticación en algunos endpoints:** Varios endpoints tienen `hasPermissions` comentado (deshabilitado). Solo se valida que el usuario esté autenticado via Firebase, pero no se verifican roles específicos.

4. **GCS Fuse en producción:** En el despliegue con Docker en GCP, se usa GCS Fuse para montar un bucket de Cloud Storage como directorio local (`/src/uploads`), permitiendo que el servicio de archivos funcione de la misma forma en local y en producción.

5. **API externa de taxis:** El microservicio de Third Parties tiene una dependencia a una API externa en `https://www.mycodestorage.com/AppCiudadana/APIS/PaqueteB/TAXI.php`.

6. **Modo all-server.js:** En desarrollo local se usa `all-server.js` que monta todas las rutas en un solo proceso. En producción cada microservicio corre independientemente en su contenedor.

7. **El servicio de Users NO tiene authMiddleware global** — a diferencia de los demás, parece que cada ruta maneja la autenticación individualmente.
