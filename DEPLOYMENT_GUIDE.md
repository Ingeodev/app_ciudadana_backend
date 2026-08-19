# Guía de Despliegue - Backend Cali Mobility (Monolito)

## 1. Resumen del Sistema

Este documento describe cómo replicar el ambiente de producción del backend Cali Mobility en Google Cloud Run. El despliegue utiliza una arquitectura de **monolito modular** con Node.js/Express desplegado como contenedor serverless.

### Características del Despliegue Actual

- **Servicio desplegado:** https://cali-mobility-monolith-502836405953.us-east1.run.app
- **Proyecto GCP:** `app-ciudadana-cali-493402`
- **Región:** `us-east1` (Carolina del Sur, EE.UU.)
- **Contenedor:** Node.js 18 Alpine
- **Recursos:** 1 CPU, 512Mi memoria, 1-10 instancias
- **Concurrencia:** 80 requests por instancia

### Arquitectura del Pipeline CI/CD

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ Secret      │    │ Cloud Build     │    │ Artifact Registry│
│ Manager     │───▶│ (build + push)  │───▶│ (imagen Docker)  │
└─────────────┘    └─────────────────┘    └──────────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────┐    ┌──────────────────┐
                    │ Cloud Run      │◀───│ Deploy           │
                    │ (producción)   │    │ (gcloud run)     │
                    └─────────────────┘    └──────────────────┘
```

---

## 2. Requisitos Previos

### Herramientas Requeridas

| Herramienta | Versión mínima | Propósito |
|-------------|----------------|-----------|
| `gcloud` CLI | 400.0.0+ | CLI de GCP para todos los comandos |
| Docker | 20.10+ | Construcción local de imágenes |
| Git | 2.30+ | Control de versiones |
| `jq` | 1.6+ | Procesamiento de JSON en scripts |

### Verificar Instalación

```bash
# Verificar gcloud
gcloud version

# Verificar Docker
docker --version

# Verificar configuración de gcloud
gcloud auth list
```

### Permisos Requeridos en GCP

Para ejecutar esta guía necesitas permisos de **Propietario** (`roles/owner`) o los siguientes roles granulares:

- `roles/resourcemanager.projectOwner`
- `roles/iam.serviceAccountAdmin`
- `roles/secretmanager.admin`
- `roles/artifactregistry.admin`
- `roles/run.admin`

---

## 3. Configuración del Proyecto GCP

### 3.1 Identificar tu Project ID y Project Number

Todos los comandos requieren reemplazar estos valores con los tuyos:

| Variable | Valor en este proyecto | Reemplazar por |
|----------|----------------------|----------------|
| `PROJECT_ID` | `app-ciudadana-cali-493402` | Tu ID de proyecto |
| `PROJECT_NUMBER` | `502836405953` | Tu número de proyecto |
| `REGION` | `us-east1` | Tu región preferida |
| `SERVICE_NAME` | `cali-mobility-monolith` | Nombre del servicio |

### 3.2 Activar las APIs Necesarias

```bash
# Configurar el proyecto
export PROJECT_ID="app-ciudadana-cali-493402"
gcloud config set project $PROJECT_ID

# Activar Cloud Run API
gcloud services enable run.googleapis.com

# Activar Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Activar Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Activar Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Verificar servicios activos
gcloud services list --enabled --filter="name:run,cloudbuild,artifactregistry,secretmanager"
```

**Tiempo estimado:** 2-5 minutos por API.

### 3.3 Configurar la Región Predeterminada

```bash
gcloud config set run/region us-east1
gcloud config set compute/region us-east1
```

---

## 4. Configuración de Secretos

El pipeline usa **Secret Manager** para inyectar credenciales sensibles durante el build. No se almacenan en el repositorio.

### 4.1 Estructura de Secretos Requeridos

| Nombre del Secreto | Contenido esperado | Ubicación en el código |
|-------------------|-------------------|----------------------|
| `db_secrets` | JSON con credenciales PostgreSQL | `src/config/config.json` |
| `service_key` | JSON de Firebase Admin SDK | `src/config/account_service_key.json` |
| `email_key` | JSON de API key SendGrid | `src/config/email_service_key.json` |
| `notifications_secrets` | JSON con tokens de SIGMA SMS | `src/microservices/notifications/secrets.json` |

### 4.2 Formato Esperado de Cada Secreto

#### `db_secrets` (config.json)
```json
{
  "development": {
    "username": "tu_usuario",
    "password": "tu_password",
    "database": "cali_mobility",
    "host": "35.xxx.xxx.xxx",
    "dialect": "postgres",
    "port": 5432
  },
  "production": {
    "username": "tu_usuario",
    "password": "tu_password",
    "database": "cali_mobility",
    "host": "35.xxx.xxx.xxx",
    "dialect": "postgres",
    "port": 5432
  }
}
```

#### `service_key` (account_service_key.json)
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-firebase",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

#### `email_key` (email_service_key.json)
```json
{
  "apiKey": "SG.xxxxxxxxxxxxxx.xxxxxxxxxxxxxx"
}
```

#### `notifications_secrets` (secrets.json)
```json
{
  "sigma_token": "tu_token_de_sigma",
  "sigma_url": "https://api.sigma.com.co/sms"
}
```

### 4.3 Crear los Secretos

```bash
export PROJECT_NUMBER="502836405953"

# 1. Crear db_secrets
echo '{"development":{"username":"tu_usuario","password":"tu_password","database":"cali_mobility","host":"localhost","dialect":"postgres","port":5432},"production":{"username":"tu_usuario","password":"tu_password","database":"cali_mobility","host":"35.xxx.xxx.xxx","dialect":"postgres","port":5432}}' | gcloud secrets create db_secrets --replication-policy=automatic --data-file=-

# 2. Crear service_key (Firebase Admin SDK)
gcloud secrets create service_key --replication-policy=automatic

# Agregar el valor (reemplazar con tu archivo)
gcloud secrets versions add service_key --data-file=src/config/account_service_key.json

# 3. Crear email_key (SendGrid)
gcloud secrets create email_key --replication-policy=automatic
gcloud secrets versions add email_key --data-file=src/config/email_service_key.json

# 4. Crear notifications_secrets
gcloud secrets create notifications_secrets --replication-policy=automatic
gcloud secrets versions add notifications_secrets --data-file=src/microservices/notifications/secrets.json

# Verificar secretos creados
gcloud secrets list
```

### 4.4 Agregar Versiones a Secretos Existentes

Si los secretos ya existen pero quieres actualizar el valor:

```bash
# Actualizar db_secrets
gcloud secrets versions add db_secrets --data-file=- < nuevos_secretos.json

# Listar versiones de un secreto
gcloud secrets versions list db_secrets

# Ver el valor de una versión específica
gcloud secrets versions access latest --secret=db_secrets
```

---

## 5. Configuración de IAM

### 5.1 Service Accounts Involucradas

| Service Account | Propósito | Email |
|----------------|-----------|-------|
| Cloud Build | Ejecutar el pipeline CI/CD | `PROJECT_NUMBER@cloudbuild.gserviceaccount.com` |
| Cloud Run | Ejecutar el contenedor desplegado | `PROJECT_NUMBER-compute@developer.gserviceaccount.com` |

### 5.2 Configurar Permisos para Cloud Build Service Account

La cuenta de Cloud Build necesita permisos para:
- Leer secretos de Secret Manager
- Escribir imágenes en Artifact Registry
- Desplegar servicios en Cloud Run

```bash
export PROJECT_NUMBER="502836405953"
export PROJECT_ID="app-ciudadana-cali-493402"

CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# 1. Rol de builder (requerido para ejecutar builds)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/cloudbuild.builds.builder"

# 2. Acceso a secretos (secretAccessor permite leer versiones)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/secretmanager.secretAccessor"

# 3. Acceso a Artifact Registry (writer para push de imágenes)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/artifactregistry.writer"

# 4. Acceso a Cloud Run (deployer para crear/actualizar servicios)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/run.developer"

# Verificar roles asignados
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:cloudbuild.gserviceaccount.com"
```

### 5.3 Configurar Permisos para Cloud Run (Compute Service Account)

La cuenta de ejecución de Cloud Run debe poder acceder a los secretos en runtime:

```bash
export PROJECT_NUMBER="502836405953"
export PROJECT_ID="app-ciudadana-cali-493402"

COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Agregar rol de acceso a secretos (necesario para leer credenciales en runtime)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$COMPUTE_SA" \
  --role="roles/secretmanager.secretAccessor"
```

### 5.4 Hacer el Servicio Accesible Público (Opcional)

Para permitir acceso sin autenticación (necesario para APIs públicas):

```bash
# Ejecutar una vez - esto hace el servicio público
gcloud run services add-iam-policy-binding cali-mobility-monolith \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1 \
  --project=$PROJECT_ID
```

**⚠️ Advertencia:** Esto expone tu API a internet sin autenticación. Solo hacerlo si es una API pública.

---

## 6. Artifact Registry

### 6.1 Crear el Repositorio

```bash
export PROJECT_ID="app-ciudadana-cali-493402"

# Crear repositorio Docker
gcloud artifact registries create cali-mobility-monolith \
  --location=us-east1 \
  --repository-format=docker

# Verificar repositorio creado
gcloud artifact repositories list
```

### 6.2 Configurar Autenticación de Docker

Para hacer push de imágenes desde tu máquina local:

```bash
gcloud auth configure-docker us-east1-docker.pkg.dev
```

Esto crea el archivo `~/.docker/config.json` con las credenciales necesarias.

### 6.3 Verificar Acceso

```bash
# Listar repositorios
gcloud artifact repositories list --location=us-east1

# Ver detalles del repositorio
gcloud artifact repositories describe cali-mobility-monolith \
  --location=us-east1
```

---

## 7. Pipeline de Cloud Build

### 7.1 Archivo de Configuración

El archivo `cloudbuild-monolith.yaml` define el pipeline completo:

```yaml
#cloudbuild-monolith.yaml
steps:
  # FASE 1: Inyección de secretos al workspace
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: "bash"
    args:
      - "-c"
      - |
        mkdir -p workspace/config workspace/secrets
        echo $$DB_SECRETS > workspace/config/config.json
        echo $$API_KEY > workspace/config/account_service_key.json
        echo $$EMAIL_KEY > workspace/config/email_service_key.json
        echo $$NOTIFICATIONS_SECRETS > workspace/secrets/notification_secrets.json
    secretEnv:
      - DB_SECRETS
      - API_KEY
      - EMAIL_KEY
      - NOTIFICATIONS_SECRETS

  # FASE 1.5: Copiar secretos a la ubicación correcta
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: "bash"
    args:
      - "-c"
      - |
        cp workspace/config/config.json src/config/config.json
        cp workspace/config/account_service_key.json src/config/account_service_key.json
        cp workspace/config/email_service_key.json src/config/email_service_key.json
        cp workspace/secrets/notification_secrets.json src/microservices/notifications/secrets.json

  # FASE 2: Build de imagen Docker
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - "build"
      - "-t"
      - "us-east1-docker.pkg.dev/app-ciudadana-cali-493402/cali-mobility-monolith/monolith:latest"
      - "-f"
      - "src/Dockerfile.monolith"
      - "."

  # FASE 3: Push a Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - "push"
      - "us-east1-docker.pkg.dev/app-ciudadana-cali-493402/cali-mobility-monolith/monolith:latest"

  # FASE 4: Deploy a Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - "run"
      - "deploy"
      - "cali-mobility-monolith"
      - "--image"
      - "us-east1-docker.pkg.dev/app-ciudadana-cali-493402/cali-mobility-monolith/monolith:latest"
      - "--region"
      - "us-east1"
      - "--platform"
      - "managed"
      - "--allow-unauthenticated"
      - "--memory"
      - "512Mi"
      - "--cpu"
      - "1"
      - "--min-instances"
      - "1"
      - "--max-instances"
      - "10"
      - "--concurrency"
      - "80"
      - "--timeout"
      - "60s"

availableSecrets:
  secretManager:
    - versionName: projects/502836405953/secrets/db_secrets/versions/latest
      env: DB_SECRETS
    - versionName: projects/502836405953/secrets/service_key/versions/latest
      env: API_KEY
    - versionName: projects/502836405953/secrets/email_key/versions/latest
      env: EMAIL_KEY
    - versionName: projects/502836405953/secrets/notifications_secrets/versions/latest
      env: NOTIFICATIONS_SECRETS

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: "E2_HIGHCPU_8"
```

### 7.2 Actualizar el Archivo para Tu Proyecto

Antes de usar el archivo, reemplaza estos valores:

| Valor | Reemplazar por |
|-------|----------------|
| `app-ciudadana-cali-493402` | Tu PROJECT_ID |
| `502836405953` | Tu PROJECT_NUMBER |
| `us-east1` | Tu región |

### 7.3 Ejecutar el Pipeline Manualmente

```bash
export PROJECT_ID="app-ciudadana-cali-493402"

# Ejecutar el build
gcloud builds submit . \
  --config=cloudbuild-monolith.yaml \
  --project=$PROJECT_ID \
  --substitutions=_PROJECT_ID=$PROJECT_ID
```

**Tiempo estimado:** 5-10 minutos (depende del npm install y tamaño de la imagen).

---

## 8. Cloud Build Trigger (Opcional)

Si quieres despliegue automático al hacer push a GitHub/GitLab:

### 8.1 Crear el Trigger

```bash
export PROJECT_ID="app-ciudadana-cali-493402"

# Crear trigger para push a main
gcloud beta builds triggers create github \
  --name=deploy-monolith-to-cloud-run \
  --repo=owner/repo \
  --branch-pattern="^main$" \
  --build-config=cloudbuild-monolith.yaml \
  --project=$PROJECT_ID
```

### 8.2 Configurar Conexión con GitHub (Primera vez)

```bash
# 1. Ir a Cloud Build en Console
# 2. Settings > GitHub > Connect Repository
# 3. Autorizar GCP en GitHub
# 4. Seleccionar el repositorio
```

---

## 9. Despliegue Manual

### 9.1 Despliegue Directo con gcloud (Sin Cloud Build)

Si necesitas un despliegue rápido sin el pipeline completo:

```bash
export PROJECT_ID="app-ciudadana-cali-493402"
export REGION="us-east1"

# 1. Construir la imagen localmente
docker build -t us-east1-docker.pkg.dev/$PROJECT_ID/cali-mobility-monolith/monolith:latest \
  -f src/Dockerfile.monolith .

# 2. Push a Artifact Registry
docker push us-east1-docker.pkg.dev/$PROJECT_ID/cali-mobility-monolith/monolith:latest

# 3. Desplegar a Cloud Run
gcloud run deploy cali-mobility-monolith \
  --image us-east1-docker.pkg.dev/$PROJECT_ID/cali-mobility-monolith/monolith:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 60s \
  --project $PROJECT_ID
```

### 9.2 Despliegue con Secrets ya Montados

Si necesitas desplegar con secretos montados como volumen (alternativa a la inyección en build):

```bash
# Montar secretos como volumen en Cloud Run
gcloud run deploy cali-mobility-monolith \
  --image us-east1-docker.pkg.dev/$PROJECT_ID/cali-mobility-monolith/monolith:latest \
  --region $REGION \
  --platform managed \
  --update-secrets=CONFIG=projects/$PROJECT_ID/secrets/db_secrets:latest:latest \
  --update-secrets=SERVICE_KEY=projects/$PROJECT_ID/secrets/service_key:latest:latest \
  --update-secrets=EMAIL_KEY=projects/$PROJECT_ID/secrets/email_key:latest:latest \
  --update-secrets=NOTIFICATIONS_SECRETS=projects/$PROJECT_NUMBER/secrets/notifications_secrets:latest:latest
```

---

## 10. Verificación Post-Despliegue

### 10.1 Verificar el Servicio

```bash
export PROJECT_ID="app-ciudadana-cali-493402"
export REGION="us-east1"

# Obtener la URL del servicio
SERVICE_URL=$(gcloud run services describe cali-mobility-monolith \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --format "value(status.url)")

echo "Servicio desplegado en: $SERVICE_URL"

# Probar endpoint de salud
curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/health
```

### 10.2 Verificar Logs

```bash
# Ver logs en tiempo real
gcloud logs read --resource=type=cloud_run_revision \
  --resource=labels.service_name=cali-mobility-monolith \
  --limit=50

# Ver logs de errores
gcloud logs read --resource=type=cloud_run_revision \
  --resource=labels.service_name=cali-mobility-monolith \
  --filter="severity>=ERROR" \
  --limit=20
```

### 10.3 Verificar Métricas

```bash
# Ver estadísticas del servicio
gcloud run services describe cali-mobility-monolith \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID
```

### 10.4 Endpoints Comunes a Probar

| Endpoint | Propósito |
|----------|-----------|
| `/` | Raíz del servicio |
| `/health` | Health check |
| `/api/v1/...` | Endpoints de la API |

---

## 11. Actualización de Secretos

### 11.1 Actualizar un Secreto

```bash
# Agregar nueva versión al secreto
gcloud secrets versions add db_secrets --data-file=- < nuevo_config.json

# El pipeline usará automáticamente la versión "latest"
# Cloud Build toma la versión más reciente
```

### 11.2 Forzar Uso de Versión Específica

Si necesitas usar una versión específica (no latest):

```yaml
# En cloudbuild-monolith.yaml, cambiar:
availableSecrets:
  secretManager:
    - versionName: projects/502836405953/secrets/db_secrets/versions/1
      env: DB_SECRETS
```

### 11.3 Rotación de Secretos Recomendada

```bash
# Ver versiones actuales
gcloud secrets versions list db_secrets

# Deshabilitar versión antigua (opcional)
gcloud secrets versions disable 1 --secret=db_secrets
```

---

## 12. Troubleshooting

### 12.1 Errores Comunes y Soluciones

#### Error: "Permission denied on secret"

```
ERROR: (gcloud.builds.submit) build failed with error: 7 PERMISSION_DENIED: 
Permission denied on secret (or it may not exist)
```

**Causa:** La Cloud Build SA no tiene acceso al secreto.

**Solución:**
```bash
export PROJECT_NUMBER="502836405953"
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/secretmanager.secretAccessor"
```

#### Error: "Artifact Registry: not found"

```
ERROR: (gcloud.builds.submit) build failed with error: 3 NOT_FOUND: 
Artifact Registry 'cali-mobility-monolith' not found
```

**Causa:** El repositorio de Artifact Registry no existe.

**Solución:**
```bash
gcloud artifact registries create cali-mobility-monolith \
  --location=us-east1 \
  --repository-format=docker
```

#### Error: "Cloud Run: quota exceeded"

```
Error: quota exceeded for 'cloud-run-egress'
```

**Causa:** Cuota de red была excedida.

**Solución:**
- Revisar cuotas en Console > Cloud Run > Quotas
- Contactar soporte para aumento de cuota

#### Error: "Build timeout"

```
Build step exceeded timeout limit of 10m
```

**Causa:** El build tarda más de 10 minutos.

**Solución:**
```yaml
# En cloudbuild-monolith.yaml, agregar timeout más alto
timeout: 1800s  # 30 minutos
```

#### Error: "Image not found"

```
Error: Container image 'us-east1-docker.pkg.dev/...' not found
```

**Causa:** La imagen no existe en Artifact Registry.

**Solución:**
```bash
# Ver imágenes en el repositorio
gcloud artifact repositories docker images list \
  us-east1-docker.pkg.dev/app-ciudadana-cali-493402/cali-mobility-monolith
```

#### Error: "Module not found" en producción

```
Error: Cannot find module './config/config.json'
```

**Causa:** Los secretos no se copiaron correctamente en el paso 1.5 del pipeline.

**Solución:**
- Verificar que los secretos existen en Secret Manager
- Revisar logs del build para ver el paso de inyección

#### Error: "Database connection refused"

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa:** La aplicación intenta conectarse a localhost en lugar del host de PostgreSQL.

**Solución:**
- Verificar que `config.json` tiene el host correcto
- En producción, el host debe ser la IP externa de Cloud SQL, no `localhost`
- Si usas Cloud SQL, agregar connectivity config al deploy

### 12.2 Comandos de Debugging

```bash
# Ver detalles del último build
gcloud builds describe $(gcloud builds list --limit=1 --format="value(id)")

# Ver logs detallados del build
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")

# Ver configuración actual del servicio
gcloud run services describe cali-mobility-monolith --region us-east1

# Probar imagen localmente antes de desplegar
docker run -p 3000:3000 us-east1-docker.pkg.dev/$PROJECT_ID/cali-mobility-monolith/monolith:latest
```

### 12.3 Rollback a Versión Anterior

```bash
# 1. Listar revisiones
gcloud run revisions list --service cali-mobility-monolith --region us-east1

# 2. Traffic a revisión anterior (100%)
gcloud run services set-traffic cali-mobility-monolith \
  --to-revision=cali-mobility-monolith-00001-abc \
  --region us-east1 \
  --platform managed
```

### 12.4 Configuración de Variables de Entorno Adicionales

Si necesitas agregar variables de entorno adicionales:

```bash
gcloud run deploy cali-mobility-monolith \
  --update-env-vars "NODE_ENV=production,LOG_LEVEL=info"
```

---

## Anexo: Variables de Entorno del Proyecto

El Dockerfile configura las siguientes variables de entorno:

```dockerfile
ENV NODE_ENV=production \
    PORT=3000 \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2
```

Para agregar más variables:

```bash
gcloud run deploy cali-mobility-monolith \
  --update-env-vars "TU_VARIABLE=valor"
```

---

## Referencias

- [Documentación Cloud Run](https://cloud.google.com/run/docs)
- [Documentación Cloud Build](https://cloud.google.com/build/docs)
- [Documentación Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [Documentación Secret Manager](https://cloud.google.com/secret-manager/docs)

---

**Última actualización:** Mayo 2026
**Versión del documento:** 1.0