# STRATEGY.md — Estrategia de Simplificación de Infraestructura

## 1. Situación Actual

El backend de la App Ciudadana depende de los siguientes servicios externos y componentes de infraestructura:

| Servicio | Propósito | Impacto en el sistema |
|---|---|---|
| **GCP Cloud Run** (x6) | Hosting de cada microservicio | Alto — es la plataforma completa de despliegue |
| **GCP Cloud Build** | CI/CD | Medio — automatización del build/deploy |
| **GCP Artifact Registry** | Almacén de imágenes Docker | Medio — dependencia de GCP para imágenes |
| **GCP Secret Manager** | Gestión de secretos | Bajo — se puede reemplazar con `.env` |
| **GCP Cloud Storage + GCS Fuse** | Almacenamiento de archivos subidos | Medio — los archivos se montan como directorio local |
| **Firebase Authentication** | Autenticación de usuarios (web y móvil) | **Crítico** — cada request pasa por Firebase |
| **Firebase Cloud Messaging (FCM)** | Notificaciones push a dispositivos móviles | Alto — feature principal de la app |
| **SendGrid** | Envío de correos electrónicos | Medio — reset de contraseña, verificación |
| **SIGMA Movil** | Envío masivo de SMS | Bajo — servicio externo puntual |
| **API de Taxis** | Consulta de datos de taxis | Bajo — servicio externo de solo lectura |
| **PostgreSQL (Aurora AWS)** | Base de datos principal | **Crítico** — almacena todos los datos |
| **Terraform** | Infraestructura como código | Bajo — solo para provisionar GCP |

---

## 2. Objetivo

Migrar todo el sistema a una **arquitectura Docker Compose en una sola máquina** (AWS, GCP, DigitalOcean, o cualquier VPS con Docker), eliminando la dependencia de servicios propietarios de nube cuando sea posible y conveniente.

---

## 3. Análisis por Componente

### 3.1 🟢 Fácil de Reemplazar

#### 3.1.1 GCP Cloud Run → Docker Compose

| Aspecto | Actual | Propuesto |
|---|---|---|
| Despliegue | 6 contenedores en Cloud Run | `docker-compose.yml` con todos los servicios |
| Networking | Cloud Run gestiona URLs y balanceo | Red interna de Docker + Nginx como reverse proxy |
| Escalado | Automático por Cloud Run | Manual (vertical, escalando la máquina) |

**Esfuerzo:** Bajo. Ya existen los Dockerfiles. Solo hay que crear un `docker-compose.yml` que levante todos los servicios + PostgreSQL + Nginx.

> [!TIP]
> Se puede usar el modo `all-server.js` (monolito) para simplificar aún más: un solo contenedor que sirve todo en el puerto 3001. Esto elimina la necesidad de 6 Dockerfiles separados y un reverse proxy. Es la opción recomendada para un equipo pequeño.

#### 3.1.2 GCP Cloud Build → CI/CD simple

| Aspecto | Actual | Propuesto |
|---|---|---|
| CI/CD | Cloud Build con `cloudbuild.yaml` | GitHub Actions / GitLab CI / deploy manual con SSH |
| Build | En la nube | En el servidor con `docker compose build` |

**Esfuerzo:** Bajo. Se puede hacer deploy manual vía SSH o un script simple.

#### 3.1.3 GCP Secret Manager → Variables de entorno / archivos `.env`

| Aspecto | Actual | Propuesto |
|---|---|---|
| Secretos | Secret Manager de GCP | Archivos `.env` + `config/*.json` en el servidor |

**Esfuerzo:** Mínimo. El sistema ya soporta `.env` y archivos JSON locales.

#### 3.1.4 GCP Cloud Storage + GCS Fuse → Volúmenes Docker

| Aspecto | Actual | Propuesto |
|---|---|---|
| Archivos | Bucket GCS montado con GCS Fuse | Volumen Docker mapeado a directorio del host |

**Esfuerzo:** Bajo. Cambiar el directorio de uploads a un volumen Docker persistente. Ya funciona con el sistema de archivos local.

#### 3.1.5 Terraform → No necesario

Si se despliega en una sola máquina con Docker, Terraform ya no es necesario. La infraestructura se reduce a: un servidor + Docker instalado.

---

### 3.2 🟡 Requiere Análisis / Esfuerzo Moderado

#### 3.2.1 Firebase Authentication → ¿Reemplazable?

> [!IMPORTANT]
> Firebase Auth es la dependencia más crítica de analizar. Su reemplazo impacta **toda** la autenticación del sistema y las **apps móviles** que ya están en producción.

**Cómo se usa Firebase Auth actualmente:**

1. **Middleware de autenticación** (`authMiddleware.js`): Verifica tokens JWT de Firebase en cada request.
2. **Gestión de usuarios** (`firebaseAdmin.js`): Crea, edita, elimina usuarios en Firebase. Genera enlaces de reset de contraseña y verificación de email.
3. **Custom claims**: Se asignan roles a los tokens de Firebase (`addCustomClaim`).
4. **Las apps móviles** usan Firebase SDK para login. El token se envía al backend.

**Opciones:**

| Opción | Descripción | Esfuerzo | Riesgo |
|---|---|---|---|
| **A) Mantener Firebase Auth** | Seguir usando Firebase solo para autenticación. Es gratuito hasta 50K usuarios/mes y no requiere infraestructura propia. | Nulo | Nulo |
| **B) Reemplazar con JWT propio** | Implementar login/registro propio, generar JWT con `jsonwebtoken`, almacenar usuarios y contraseñas (hashed con bcrypt) en PostgreSQL. | **Alto** | **Alto** — requiere cambiar las apps móviles para no usar Firebase SDK |
| **C) Reemplazar con Keycloak** | Desplegar Keycloak en Docker como servidor de autenticación OAuth2/OIDC. | **Alto** | Medio — Keycloak es robusto pero agrega complejidad |

**Recomendación:**

> [!CAUTION]
> **Opción A (mantener Firebase Auth)** es la más pragmática. Firebase Authentication es **gratuito** para el volumen de usuarios de esta aplicación, no requiere infraestructura propia, y cambiarlo requeriría modificar las **apps móviles ya compiladas**. El ahorro de costo es cero y el riesgo es alto.
>
> Solo considerar B o C si hay un requerimiento explícito de eliminar toda dependencia de Google.

**Si se decide reemplazar (Opción B - JWT propio):**

Los cambios necesarios serían:

```
1. Crear tabla `auth_users` en PostgreSQL (email, password_hash, verified, role)
2. Crear endpoints: POST /auth/login, POST /auth/register, POST /auth/refresh
3. Generar JWT con jsonwebtoken (con secret/RSA key propio)
4. Reemplazar authMiddleware.js para verificar JWT propio en lugar de Firebase
5. Reemplazar firebaseAdmin.js (createUser, deleteUser, etc.) con lógica propia
6. Implementar hash de contraseñas con bcrypt
7. Implementar flujo de verificación de correo propio
8. Implementar flujo de reset de contraseña propio
9. MODIFICAR LAS APPS MÓVILES para usar login propio en vez de Firebase SDK
```

---

#### 3.2.2 SendGrid → ¿Reemplazable?

**Cómo se usa actualmente:**
- Envío de correos de verificación de email y reset de contraseña.
- Se usa vía `@sendgrid/mail` con API key.

**Opciones:**

| Opción | Descripción | Costo | Esfuerzo |
|---|---|---|---|
| **A) Mantener SendGrid** | Capa gratuita de 100 correos/día | $0 | Nulo |
| **B) SMTP propio con Nodemailer** | Usar `nodemailer` con un servidor SMTP propio o de terceros (Gmail, Amazon SES, Mailgun) | Variable | Bajo |
| **C) Mailhog (solo dev/staging)** | Servidor SMTP local para pruebas | $0 | Bajo |

**Recomendación:**

**Opción B** es la más flexible. Reemplazar `@sendgrid/mail` por `nodemailer` toma unas 2-3 horas. `nodemailer` funciona con cualquier servidor SMTP:
- **Amazon SES** ($0.10 por 1000 correos)
- **Gmail SMTP** (gratuito, limitado a 500/día)
- **SMTP propio** (Postfix en Docker)

El cambio afecta únicamente el archivo `src/utils/sendMail.js` (29 líneas).

---

#### 3.2.3 Firebase Cloud Messaging (FCM) → ¿Reemplazable?

**Cómo se usa actualmente:**
- Envío de notificaciones push a dispositivos móviles via Topics de FCM.
- Registro de deviceTokens de los usuarios.

> [!WARNING]
> **FCM NO se puede eliminar fácilmente.** Las notificaciones push en Android y iOS requieren pasar por APNs (Apple) y FCM/GCM (Google). FCM es el estándar de la industria y es **gratuito sin límite de mensajes**.

**Opciones:**

| Opción | Descripción | Viable |
|---|---|---|
| **A) Mantener FCM** | Seguir usando Firebase solo para push notifications | ✅ **Recomendado** |
| **B) OneSignal** | Servicio alternativo de push (también gratuito) | Posible, pero requiere cambiar SDK en apps móviles |
| **C) Self-hosted (ntfy, Gotify)** | Servidores propios de notificaciones | ❌ No funciona con push nativo de Android/iOS |

**Recomendación:**

**Mantener FCM.** Es gratuito, no requiere infraestructura, y eliminarlo requeriría cambiar las apps móviles. Se puede usar la misma `account_service_key.json` de Firebase sin necesidad de usar Firebase Auth.

> [!NOTE]
> Firebase permite usar **solo FCM** sin usar Firebase Auth. Si se reemplaza la autenticación, el archivo `account_service_key.json` sigue siendo necesario solo para enviar notificaciones push.

---

### 3.3 🔴 No Reemplazable (APIs Externas)

| Servicio | Razón |
|---|---|
| **SIGMA Movil (SMS)** | API de terceros contratada. No se puede auto-hostear. |
| **API de Taxis** | API de terceros externa. Solo se consume. |

---

## 4. Arquitectura Propuesta: Docker Compose Single-Machine

### 4.1 Opción Recomendada: Monolito con Docker Compose

```yaml
# docker-compose.yml (ejemplo conceptual)
services:
  # Base de datos
  postgres:
    image: postgres:15
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: calimobility
      POSTGRES_USER: ...
      POSTGRES_PASSWORD: ...
    ports:
      - "5432:5432"

  # Backend (modo monolito)
  backend:
    build:
      context: .
      dockerfile: Dockerfile.monolith
    ports:
      - "3001:3001"
    volumes:
      - uploads_data:/src/uploads
    depends_on:
      - postgres
    env_file:
      - .env

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - backend

volumes:
  pg_data:
  uploads_data:
```

### 4.2 Diagrama de la Arquitectura Simplificada

```
┌──────────────────────────────────────────────────┐
│              SERVIDOR (VPS / EC2 / VM)            │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │              Docker Compose                  │  │
│  │                                              │  │
│  │  ┌────────┐  ┌──────────────┐  ┌─────────┐  │  │
│  │  │ Nginx  │→ │   Backend    │→ │ Postgres│  │  │
│  │  │ :80    │  │   (monolito) │  │  :5432  │  │  │
│  │  │ :443   │  │   :3001      │  │         │  │  │
│  │  └────────┘  └──────────────┘  └─────────┘  │  │
│  │                     │                        │  │
│  │              uploads_data (volumen Docker)    │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │ Internet
        ┌────────────┼────────────────┐
        ▼            ▼                ▼
  ┌───────────┐ ┌─────────┐   ┌───────────┐
  │ Firebase  │ │ SendGrid│   │ SIGMA SMS │
  │ FCM Push  │ │ o SMTP  │   │           │
  └───────────┘ └─────────┘   └───────────┘
```

---

## 5. Tabla Resumen de Decisiones

| Componente | Acción | Prioridad | Esfuerzo | Ahorro |
|---|---|---|---|---|
| Cloud Run (hosting) | → Docker Compose en VPS | **P1** | Bajo | Alto (elimina 6 servicios Cloud Run) |
| Cloud Build (CI/CD) | → Script de deploy SSH o GitHub Actions | **P1** | Bajo | Medio |
| Secret Manager | → Archivos `.env` + JSON locales | **P1** | Mínimo | Bajo |
| GCS + GCS Fuse | → Volumen Docker | **P1** | Bajo | Medio |
| Terraform | → Eliminar (no necesario) | **P1** | Nulo | Bajo |
| Artifact Registry | → Docker local (build en el servidor) | **P1** | Bajo | Bajo |
| PostgreSQL (Aurora) | → PostgreSQL en Docker | **P1** | Bajo | Alto (elimina Aurora AWS) |
| Firebase Auth | → **Mantener** (gratuito) o JWT propio | **P3** | Alto si se reemplaza | $0 (ya es gratis) |
| Firebase FCM | → **Mantener** (obligatorio para push) | — | — | — |
| SendGrid | → Nodemailer + SMTP externo | **P2** | Bajo | Bajo |
| SIGMA SMS | → **Mantener** (API externa) | — | — | — |
| API Taxis | → **Mantener** (API externa) | — | — | — |

---

## 6. Plan de Migración por Fases

### Fase 1: "Docker Compose en un solo servidor" (1-2 semanas)

**Objetivo:** Desplegar el sistema actual tal cual en un VPS con Docker Compose, sin cambiar código.

- [ ] Provisionar un VPS (mínimo: 2 vCPU, 4GB RAM, 40GB SSD)
- [ ] Crear `Dockerfile.monolith` basado en `all-server.js`
- [ ] Crear `docker-compose.yml` con PostgreSQL + Backend + Nginx
- [ ] Configurar variables de entorno y archivos de configuración
- [ ] Migrar datos de PostgreSQL Aurora a PostgreSQL en Docker
- [ ] Configurar SSL con Let's Encrypt (certbot)
- [ ] Configurar backups automáticos de PostgreSQL
- [ ] Probar todos los endpoints y funcionalidades
- [ ] Apuntar DNS al nuevo servidor

**Se mantiene:** Firebase Auth, FCM, SendGrid, SIGMA.

**Se elimina:** Cloud Run, Cloud Build, Artifact Registry, Secret Manager, GCS Fuse, Terraform.

---

### Fase 2: "Reemplazar SendGrid por SMTP" (2-3 días)

**Objetivo:** Independizarse de SendGrid.

- [ ] Instalar `nodemailer` como dependencia
- [ ] Refactorizar `src/utils/sendMail.js` para usar Nodemailer
- [ ] Configurar un proveedor SMTP (Amazon SES, Gmail, o propio)
- [ ] Probar envío de correos (reset contraseña, verificación)
- [ ] Eliminar dependencia `@sendgrid/mail` del `package.json`

---

### Fase 3: "Reemplazar Firebase Auth" (2-4 semanas) — OPCIONAL

> [!CAUTION]
> **Solo ejecutar esta fase si hay un requerimiento explícito de eliminar Firebase.** Esta fase implica cambios en el backend Y en las aplicaciones móviles.

- [ ] Diseñar esquema de autenticación JWT propio
- [ ] Crear tabla `auth_credentials` en PostgreSQL
- [ ] Implementar endpoints de `/auth/login`, `/auth/register`, `/auth/refresh-token`
- [ ] Implementar hash de contraseñas con `bcrypt`
- [ ] Refactorizar `authMiddleware.js` para verificar JWT propio
- [ ] Refactorizar `firebaseAdmin.js` para usar PostgreSQL
- [ ] Implementar flujo de verificación de email (requiere SMTP)
- [ ] Implementar flujo de reset de contraseña
- [ ] Migrar usuarios existentes de Firebase a base de datos local
- [ ] **Modificar apps móviles** para usar login propio
- [ ] Mantener `account_service_key.json` SOLO para FCM push

---

## 7. Requisitos Mínimos del Servidor

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disco | 40 GB SSD | 80 GB SSD |
| SO | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24+ | 24+ |
| Docker Compose | v2+ | v2+ |

**Estimados de costo mensual:**

| Proveedor | Instancia | Precio aprox. |
|---|---|---|
| AWS (EC2) | t3.medium (2 vCPU, 4GB) | ~$30-35 USD/mes |
| DigitalOcean | Droplet 4GB | ~$24 USD/mes |
| Hetzner | CPX21 (3 vCPU, 4GB) | ~$7 EUR/mes |
| Google Cloud (Compute) | e2-medium (2 vCPU, 4GB) | ~$25-30 USD/mes |
| OVH | VPS Value (4GB) | ~$12 USD/mes |

**vs. costo actual estimado de Cloud Run (6 servicios):** $50-150+ USD/mes dependiendo del tráfico.

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Pérdida de datos PostgreSQL | Media | Backups diarios automáticos + backup externo (S3, etc.) |
| Downtime durante migración | Alta | Migrar en horario de bajo tráfico. Mantener el sistema actual mientras se prueba |
| FCM sin Firebase Auth | Baja | FCM funciona independientemente de Auth. Se pueden usar por separado |
| Cambio en apps móviles (si se cambia Auth) | Alta | Publicar nueva versión de la app antes de desactivar Firebase Auth |
| Servidor sin escalado automático | Media | Monitoreo con alertas. Escalar verticalmente si el tráfico crece |

---

## 9. Conclusión

La **Fase 1** es la de mayor impacto y menor esfuerzo: migrar a Docker Compose en un VPS reduce la complejidad drásticamente y puede disminuir los costos en un 50-75%. Se puede ejecutar **sin cambiar una sola línea de código** del backend, ya que el modo `all-server.js` ya está implementado.

**Firebase Auth y FCM deberían mantenerse** inicialmente. Son gratuitos, confiables, y reemplazarlos tiene un costo de desarrollo desproporcionado respecto al beneficio.

La recomendación es ejecutar las fases en orden: **Fase 1 primero**, evaluar resultados, y solo entonces decidir si las Fases 2 y 3 son necesarias.
