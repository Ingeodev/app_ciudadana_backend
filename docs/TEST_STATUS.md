# TEST_STATUS — Diagnóstico QA y estrategia de actualización de pruebas

> Estado: borrador inicial (sep 2026). El backend NO se modifica: este documento es solo el plan.

---

## 1. Resumen ejecutivo

La suite de tests de `src/__tests__/` (Jest + Supertest, ~42 archivos) fue escrita contra un entorno de integración que **hoy no existe configurado**:

- No hay `jest.config.js` en el repo (solo `jest.config.sample.js`). Sin él, los `global.*` que usan todas las suites (`global.thirdPartiesMicroserviceDefaultHost`, `global.firebaseKey`, `global.firebaseTestWebUserLogin`, etc.) quedan `undefined` → **ninguna suite de integración puede correr tal como está**.
- La suite golpea `http://localhost:3000` (el monolith) y hace login real contra Firebase (identitytoolkit) con usuarios de test que **no existen** en ningún proyecto Firebase.
- El `authMiddleware` web exige que el usuario exista en la tabla `Users` de la BD con `userMobile=false` → los usuarios de test deben estar **también en la BD**.
- La BD de producción (`34.24.93.52`) tiene solo 4 usuarios reales y **ninguno de test**. **No correr la suite contra esa BD.**

Conclusión: las pruebas **no pasan hoy** (no están en condiciones de ejecutarse), no porque el código esté roto, sino porque falta el entorno de pruebas y parte de la suite está desactualizada. Además hay **huecos de cobertura importantes** (ver §3).

---

## 2. Diagnóstico del estado de la suite

### 2.1 Bloqueantes

| # | Problema | Impacto |
|---|----------|---------|
| B1 | No existe `jest.config.js` (solo `jest.config.sample.js` con valores "MUST Change") | Todas las suites de integración fallan: `global.*` = `undefined` |
| B2 | No hay usuarios de test en Firebase (`testWeb@testmail.com` / `testMobile@testmail.com`) | Fallan los logins `identitytoolkit` de las 42 suites |
| B3 | Los usuarios de test no están en la tabla `Users` de la BD (requisito de `authMiddleware` web) | Fallan todos los endpoints web con `401 User not found.` |
| B4 | No hay BD de pruebas (las suites escriben datos reales) | Riesgo de contaminar la BD de producción |
| B5 | Inconsistencia de proyectos: service account local = `app-ciudadana-cali`, deploy = `mov-cali-app-ciudadana`, bucket = `app-ciudadana-cali.firebasestorage.app`, Web API Key del frontend = `mov-cali-app-ciudadana` | Los tokens de los tests deben validarse contra el MISMO proyecto que usa el service account del servidor |

### 2.2 Problemas de diseño de la suite

- **29 archivos sin extensión `.test.js`** (p. ej. `thirdParties/web/cities.js`). Corren igual porque Jest ejecuta todo lo que está dentro de `__tests__/`, pero la intención de "esto es un test" queda ambigua.
- **`notifications/webAdvertisementCategories.test.js` es código muerto**: todo el CRUD está comentado y solo queda un `test('TODO: Replace...')` que hace `return true`.
- **`notifications/_afterMobile_webReports.js` depende del orden de ejecución** (asume que `mobileReports.test.js` corrió antes). Frágil, se rompe si cambia el sequencer o se corre en paralelo.
- **Hosts inconsistentes**: unas suites usan `...MicroserviceDefaultHost` y otras `...MicroserviceLocalHost`. Hoy ambos valen `localhost:3000`, pero cualquier cambio futuro rompe la mitad.
- **`admins/web/adminNotifications.js` apunta al host de *users*** (`usersMicroserviceLocalHost`) pero con path `/admin/notifications` — mezcla de microservicio.
- **Sin cleanup**: `users/web/users.js`, `users/mobile/users.js`, `documentTypes`, `webAlerts`, `mobileAlerts`, `webAttentionLines` crean datos (usuarios, doc types, alertas, líneas de atención) y **no los borran**.
- **Estado compartido entre suites**: todas reutilizan los mismos usuarios de test y corren en workers paralelos (`jest --detectOpenHandles` sin `--runInBand`) → riesgo de conflictos/duplicados.
- **Imágenes hardcodeadas**: varias suites usan `global.testImageInStorage` (URL ya subida a Storage) en vez de probar el flujo real de upload.

---

## 3. Cobertura vs. endpoints (huecos)

Mapa del servidor: **227 endpoints** (levantados de `src/app.js` + routers). La suite cubre ~120.

### 3.1 Resumen por microservicio

| Microservicio | Endpoints | Cubiertos | Sin testear | Observación |
|---|---|---|---|---|
| notifications (web+mobile) | 79 | ~40 | ~39 | La mayoría de huecos en social_networks, mobile_services, gender_point, PQRS |
| thirdParties (web+mobile) | 88 | ~70 | ~18 | CRUD muy bien cubierto; faltan taxis/complaint y validate_lat_lon |
| users (web+mobile) | 22 | ~14 | ~8 | Faltan `base_login`, `account/delete`, `account/full_login/upload-file`, listado |
| admin | 19 | ~5 | ~14 | Falta TODO el router de roles, PQRS admin, set_passwd, add_role |
| traffic (web+mobile) | 14 | 0 | 14 | **Sin ningún test** |
| fileManagement | 4 | 0 | 4 | **Sin ningún test** |
| global | 1 (`/health`) | 0 | 1 | — |

### 3.2 Huecos prioritarios (features vivas sin test)

**P0 — Features recientes sin cobertura (lo más crítico):**

| Endpoint | Función |
|---|---|
| `POST /api/mobile/v1/notifications/attention_lines/pqrsdf/upload-file` | Upload de adjunto PQRS (commit `feat(pqrs)`) |
| `POST /api/mobile/v1/notifications/attention_lines/pqrsdf` | Creación de PQRS ciudadano |
| `GET /api/mobile/v1/notifications/attention_lines/pqrsdf` | Listado/paginación de PQRS del ciudadano |
| `GET /api/web/v1/admin/admin/pqrs` | PQRS admin (listado) |
| `GET /api/web/v1/admin/admin/pqrs/:id` | PQRS admin (detalle) |
| `POST /api/web/v1/admin/admin/pqrs/respond` | Respuesta a PQRS |
| `POST /api/mobile/v1/users/account/delete` | Eliminación de cuenta móvil (diff sin commitear en rama) |
| `POST /api/web/v1/file_management/upload/image` | Upload de imagen |
| `POST /api/web/v1/file_management/upload/pdf` | Upload de PDF |
| `GET /api/v1/file_management/download/:folder/:fileName` | Descarga pública |
| `GET /api/v1/file_management/download/secure/:folder/:fileName` | Descarga autenticada |

**P1 — Microservicios sin cobertura:**

- **traffic** (14): `road_state` CRUD, `traffic_notification`, `bikes/terms_conditions`, `mobility`, `bikes/terms/agree` (web y mobile).
- **admin roles** (6): `POST /admin/role`, `edit`, `delete`, `user`, `GET /user`, `GET /:id`.

**P2 — Endpoints sueltos:**

- `social_networks` (web CRUD + GET mobile + `types`).
- `mobile_services` (web CRUD + `access`) — hoy solo se crea uno de apoyo en `webAdvertisement.test.js`.
- `gender_point` (web CRUD) — hay suites para `gender_line` y `gender_category`, falta `gender_point`.
- `report_configuration` (GET/POST) y `security/reports/approve|disapprove|expires`.
- `users base_login`, `users web GET /` (listado, está comentado en el test), `users mobile account/full_login/upload-file`.
- `thirdParties taxis/complaint`, `validate_lat_lon` (notifications, users, thirdParties, traffic).
- `GET /health`.

### 3.3 Cumplimiento de los 5 tipos de pruebas del escenario esperado (`docs/TEST_STRATEGY.md`)

El escenario esperado exige **5 tipos de pruebas**:

| # | Tipo exigido | Estado | Evidencia |
|---|---|---|---|
| 1 | **Funcionalidad e integración del sistema** | 🟡 **Parcial — cubierto en volumen, no ejecutable** | ~674 `test()` en 42 archivos, todos de integración HTTP contra el monolith (super test). Pero no corren hoy (falta entorno, §2.1) y hay huecos (PQRS, traffic, fileManagement, admin pqrs, §3.2). |
| 2 | **Rendimiento y tiempo de ejecución** | 🔴 **No cubierto** | Sin herramientas de carga (k6/artillery/JMeter/Locust), sin aserciones de latencia/throughput. El único `jest.setTimeout(10000)` es límite anti-cuelgue, no un umbral de rendimiento. |
| 3 | **Seguridad** | 🔴 **Casi nulo** | Solo autenticación básica: 533 checks de `401` (sin header/token) y 6 de `403` (web vs mobile). Un test de token inválido/vencido. Nada de inyección SQL/XSS/SSRF, autorización por recurso (aislamiento entre usuarios), headers de seguridad, ni burpsuite/mobfs (que el propio plan exige). |
| 4 | **Protección de datos (Habeas data)** | 🔴 **No cubierto** | Cero tests de cifrado, exposición de datos personales en respuestas/logs, aislamiento de datos entre usuarios, consentimiento, ni borrado de cuentas (`account/delete` sin test). |
| 5 | **Stress en simulación de alta concurrencia** | 🔴 **No cubierto** | Sin pruebas de carga/concurrencia de ningún tipo. La suite corre secuencial y no simula usuarios simultáneos. |

**Veredicto: se cumple solo 1 de 5 tipos, y de forma incompleta.**

Además, el escenario esperado exige entregar **un plan de pruebas + informe de ejecución según la Guía G.SIS.01 del MinTIC** — no existe ningún informe (el `docs/TEST_STRATEGY.md` es la semilla de ese plan, y no hay registro de ejecución).

Nota: el **escenario propuesto** (Plan Maestro "App Movilidad v2") agrega otras categorías que tampoco están: **unitarias** (solo `tryRetry.test.js`), **regresión** (sin CI que la ejecute en cada cambio), **usabilidad** (uniformidad entre las 3 plataformas — nada), y **encriptación/habeas data** (nada).

---

## 4. Estrategia de actualización de tests

Enfoque: **primero entorno aislado, después estabilizar lo que hay, y por último cerrar huecos por prioridad**. Nada se corre contra producción.

### Fase 0 — Entorno de pruebas aislado

#### 4.0.1 Proyecto Firebase de pruebas: `app-ciudadana-backend-cali`

Pasos en Firebase Console / CLI (proyecto **nuevo y separado** de `mov-cali-app-ciudadana`):

1. Crear proyecto `app-ciudadana-backend-cali`.
2. **Authentication** → habilitar proveedor **Email/Password**.
3. **Storage** → crear bucket por defecto (usar las reglas de `storage.rules` del repo).
4. **Project settings** → registrar una **Web App** → obtener la **Web API Key** (la van a usar los tests en `identitytoolkit`). Guardarla como `FIREBASE_WEB_API_KEY`.
5. **Service accounts** → generar JSON del service account → guardarlo en `src/config/account_service_key.test.json` (NO versionar).
6. Verificar consistencia: service account, Web API Key, bucket y `authDomain` deben ser **todos del proyecto de pruebas**.

#### 4.0.2 Base de datos alterna (no tocar `34.24.93.52`)

Opción recomendada: **Postgres en Docker** (con PostGIS, lo usa la migración `enable-postgis`).

```bash
docker run -d --name app-ciudadana-test-db \
  -e POSTGRES_USER=app_ciudadana_test \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=app_ciudadana_test \
  -p 5433:5432 \
  postgis/postgis:15-3.4
```

Estructura de datos (en `src/`, con `NODE_ENV=test` y `DB_*` apuntando a la BD de prueba):

```bash
npx sequelize-cli db:migrate      # todas las migrations de src/migrations/
node seeders/seedAdmin.js         # crea rol super_master_user + admin (Firebase + BD)
```

> `src/config/config.js` ya construye la conexión desde `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`; basta crear `src/.env.test` con esos valores apuntando a la BD de pruebas y al service account de pruebas.

#### 4.0.3 Usuarios de test (Firebase + BD)

Crear un seeder nuevo (patrón de `seeders/seedAdmin.js`) que haga `findOrCreate` en Firebase **y** en la tabla `Users`:

| Email | `userMobile` | Rol | Lo usan |
|---|---|---|---|
| `testWeb@testmail.com` | `false` | `super_master_user` | Suites web (exigen `authMiddleware` con User en BD) |
| `testMobile@testmail.com` | `true` | — | Suites mobile (`authMiddlewareMobile` es permisivo) |
| `testBaseLogin@testmail.com` | `true` | — | Futuros tests de `base_login` |

#### 4.0.4 `jest.config.js` (a crear en `src/`)

Base: `jest.config.sample.js`, con valores reales del entorno de pruebas:

- `globals`: todos los hosts → `http://localhost:3000`; `firebaseKey` → `FIREBASE_WEB_API_KEY` del proyecto de pruebas; `firebaseTestWebUserLogin` / `firebaseTestMobileUserLogin` con los emails/password de test.
- `testSequencer`: `./jest.custom-sequencer.js` (dejar el del repo).
- `testPathIgnorePatterns`: revisar — NO excluir `utils` sin decidir si `tryRetry` debe correr (recomendado: que corra, es el único test unitario).

#### 4.0.5 Arranque

```bash
# 1) servidor local contra entorno de prueba
cd src && NODE_ENV=test node all-server.js   # puerto 3000

# 2) en otra terminal
cd src && npm test                           # o: npx jest --runInBand
```

Smoke inicial: `GET /health` + `__tests__/utils/tryRetry.test.js`.

### Fase 1 — Estabilizar la suite existente

1. **Definir `testMatch` explícito** (solo `*.test.js`) **o** renombrar los 29 archivos sin extensión. Recomendado: `testMatch` con `**/__tests__/**/*.test.js` y renombrar/agrupar el resto.
2. **Eliminar o completar `webAdvertisementCategories.test.js`** (hoy es un placeholder).
3. **Eliminar la dependencia de orden de `_afterMobile_webReports.js`**: convertirlo en suite independiente e idempotente (que cree sus propios datos) o fusionarlo en `mobileReports.test.js` con `afterAll`.
4. **Normalizar hosts**: usar únicamente `...MicroserviceDefaultHost` en todas las suites.
5. **Corregir `admins/web/adminNotifications.js`**: host de admin (`adminsMicroservice...`) + path correcto.
6. **Agregar cleanup (`afterAll`)** a las suites que ensucian: `users/web/users.js`, `users/mobile/users.js`, `documentTypes`, `webAlerts`, `mobileAlerts`, `webAttentionLines`.
7. **Correr con `--runInBand`** (las suites comparten los mismos usuarios de test).
8. **Idempotencia**: cada suite debe generar identificadores únicos (UUID) y borrar lo que crea.

### Fase 2 — Cerrar huecos por prioridad

Crear suites nuevas (con el patrón de las existentes: login → operación → cleanup):

1. **P0**:
   - `notifications/mobile/pqrs.test.js` → `upload-file`, `POST /pqrsdf`, `GET /pqrsdf` (con filtros radicado/status si aplican).
   - `admins/web/pqrsAdmin.test.js` → `GET /admin/pqrs`, `GET /admin/pqrs/:id`, `POST /admin/pqrs/respond`.
   - `users/mobile/accountDelete.test.js` → `POST /account/delete` (+ verificación de que el usuario queda deshabilitado/borrado).
   - `fileManagement/uploadDownload.test.js` → upload image/pdf, download público y secure.
2. **P1**:
   - `traffic/web/*.test.js` y `traffic/mobile/*.test.js` → CRUD completo + `bikes/terms/agree`.
   - `admins/web/roles.test.js` → router de roles completo.
3. **P2**:
   - `notifications/web/socialNetworks.test.js`, `notifications/web/mobileServices.test.js`, `notifications/web/genderPoints.test.js`, `notifications/web/reportsAdmin.test.js` (approve/disapprove/expires + report_configuration), `notifications/mobile/socialNetworks.test.js`, `notifications/mobile/services.test.js`.
   - `users/web/baseLogin.test.js`, `users/mobile/fullLoginUpload.test.js`, listado `GET /`.
   - `thirdParties/mobile/taxis.test.js` (incluye `taxis/complaint`).
   - `health.test.js`.

### Fase 3 — Calidad y mantenimiento

1. **Subir archivos por el flujo real** (endpoint de upload) en vez de usar URLs hardcodeadas de Storage.
2. **Datos aislados por suite**: nunca compartir registros entre suites; nombres/emails únicos.
3. **CI (recomendado)**: GitHub Action que levante Postgres Docker + servidor + `jest --runInBand`, corriendo solo contra el entorno de pruebas.
4. **Documentar** en `docs/DEPLOY.md`/README la sección "Cómo correr los tests" con los pasos de la Fase 0.

### Fase 4 — Cumplir los 5 tipos de pruebas del escenario (Tipo 1 = Fases 0–2)

| Tipo | Qué agregar |
|---|---|
| 1. Funcionalidad e integración | Ya en marcha (Fases 0–2): estabilizar + cerrar huecos. |
| 2. Rendimiento | Definir SLAs de latencia (p. ej. p95 < 500 ms en endpoints críticos) y automatizar con **k6** (o artillery) sobre el entorno de pruebas: login, listados, PQRS, upload. Generar reporte en el informe de ejecución. |
| 3. Seguridad | Capa de tests de autorización: (a) 401 con token inválido/vencido/malformado, (b) 403 de RBAC (usuario sin rol / rol distinto), (c) aislamiento por recurso (usuario A no accede a datos de usuario B), (d) inyección SQL/XSS en inputs (validate_lat_lon, búsquedas), (e) cabeceras de seguridad. Complementar con escaneo **burpsuite (web)** y **mobfs (móvil)** según el propio plan maestro; registrar hallazgos en el informe. |
| 4. Protección de datos (Habeas data) | Validar: (a) los datos personales no se exponen en respuestas ni logs (auditoría de controllers), (b) cifrado en reposo del esquema (columnas sensibles), (c) `account/delete` realmente elimina/blinda los datos del usuario, (d) consentimiento/políticas de tratamiento, (e) encriptación de credenciales/archivos. |
| 5. Stress / alta concurrencia | Pruebas de carga con **k6** (p. ej. 100 VUs × 5 min) sobre endpoints críticos (login, publicity, reports, PQRS), midiendo errores < 1% y degradación aceptable. Simular picos en Cloud Functions (concurrency 80) o en el monolith local. |

Cierre formal: redactar el **plan de pruebas + informe de ejecución** siguiendo G.SIS.01 (MinTIC), con trazabilidad requisito → caso → resultado.

---

## 5. Riesgos y consideraciones

- **No ejecutar la suite actual contra la BD de producción** (`34.24.93.52`): crea ciudades, dependencias, usuarios, alertas, etc., y varias suites no limpian.
- El login de los tests usa la **Web API Key pública** (identitytoolkit). Si el proyecto de pruebas no tiene Auth habilitado, todas las suites fallan en el `beforeAll`.
- `authMiddleware` (web) exige registro en `Users` con `userMobile=false`; sin el seeder de test, todo `/api/web/*` responde `401 User not found.`
- `authMiddlewareMobile` es permisivo (si el usuario no existe en BD, deja pasar), pero NO si el usuario existe con `deletedAt` o `disabled=true`.
- La inconsistencia de proyectos (service account vs bucket vs deploy) está documentada; el entorno de pruebas debe ser 100% consistente para que los tokens se validen.
- El `jest.config.sample.js` debe quedar como referencia, y el `jest.config.js` real debe estar en `.gitignore` (o versionarse con valores dummy) para no filtrar credenciales.

---

## 6. Archivos relevantes

| Archivo | Rol |
|---|---|
| `src/__tests__/` | Suite actual (42 archivos, ~29 sin `.test.js`) |
| `src/jest.config.sample.js` | Template de config (globals/hosts) — a convertir en `jest.config.js` real |
| `src/jest.custom-sequencer.js` | Orden de ejecución de tests |
| `src/config/config.js` | Conexión a BD desde `DB_*` |
| `src/config/dotenv.js` | Carga de `.env.<NODE_ENV>` |
| `src/seeders/seedAdmin.js` | Patrón para crear usuarios (Firebase + BD) |
| `src/migrations/` | Esquema completo (48 migraciones) para la BD de pruebas |
| `src/middleware/authMiddleware.js` | Requisitos de usuarios web/mobile para los tests |

---

## 7. Bitácora de implementación — Fase 0 (entorno de pruebas)

> Fecha: 2026-09-24. Nada de esto toca producción. **El servidor quedó corriendo en `localhost:3000` con `NODE_ENV=test`** (proceso `setsid`, log en `/tmp/opencode/server_test.log`).

### 7.1 Base de datos de pruebas (Supabase)

- Conexión: `aws-0-us-west-2.pooler.supabase.com` (DB `postgres`, user `postgres.dhhdwuxomghkrovmyhit`) — configurada en `src/.env.test`.
- La BD venía restaurada con 37 tablas pero **sin tabla `SequelizeMeta`**. Se comparó el esquema contra producción y se confirmó que solo faltaban las 3 migraciones de PQRS.
- **Acción:** se creó `SequelizeMeta` marcando como aplicadas las 45 migraciones previas (el estado de columnas/extensiones ya coincidía con producción) y se ejecutó `NODE_ENV=test npx sequelize-cli db:migrate`:
  - ✅ `20260922100000-create-pqrs` → tabla `Pqrs`
  - ✅ `20260922100001-create-pqrs-statuses` → tabla `PqrsStatuses`
  - ✅ `20260922110000-create-pqrs-responses` → tabla `PqrsResponses`
- `SequelizeMeta` quedó con las 48 migraciones.

### 7.2 Firebase Auth (proyecto `app-ciudadana-cali`)

Usuarios de test creados (password: `123456`):

| Email | UID (clientId) | `userMobile` | Rol | Uso |
|---|---|---|---|---|
| `testWeb@testmail.com` | `YxWcA1yTzkYLDgytwNr9dF4RD422` | `false` | `super_master_user` (id 1) | Suites web (`authMiddleware`) |
| `testMobile@testmail.com` | `nLyjgqhjpDYuSTMPPbGPZNM4Euz1` | `true` | — | Suites mobile (`authMiddlewareMobile`) |

Registros creados en `Users` de la BD de pruebas (id 8 y 9, `loginPhase=fullLogin`, `disabled=false`, `passwdReset=false`).

### 7.3 Verificación end-to-end (servidor `NODE_ENV=test`)

| Prueba | Resultado |
|---|---|
| `GET /health` | 200 OK |
| `GET /api/web/v1/notifications/security` con token `testWeb` | 400 (validación de query, **cruzó el auth** ✓) |
| `GET /api/web/v1/notifications/security` sin token | 401 `Missing header Authorization` ✓ |
| `GET /api/mobile/v1/third_parties/taxis` con token `testMobile` | 400 (valida `q`, **cruzó el auth mobile** ✓) |

### 7.4 Valores para el futuro `jest.config.js`

- Todos los hosts (`notifications/users/thirdParties/admins/fileManagement/trafficMicroserviceDefaultHost` y `LocalHost`) → `http://localhost:3000`.
- `firebaseKey` → Web API Key de **app-ciudadana-cali**: `AIzaSyDGBtPegjVsB2v5eHArLwBR7z02ucdYS4c`.
- `firebaseTestWebUserLogin` → `{ email: 'testWeb@testmail.com', password: '123456', clientType: 'CLIENT_TYPE_WEB' }`.
- `firebaseTestMobileUserLogin` → `{ email: 'testMobile@testmail.com', password: '123456', clientType: 'CLIENT_TYPE_WEB' }`.

### 7.5 Hallazgos a corregir

1. **`src/.env.test` apunta a `FIREBASE_SERVICE_ACCOUNT_PATH=./config/account_service_testing.json`, pero el archivo real es `account_service_key-testing.json`.** Hoy funciona por fallback: `authMiddleware.js` cae a `../config/account_service_key.json`, que es del mismo proyecto (`app-ciudadana-cali`). Corregir el path para que use explícitamente el service account de testing.
2. `firebase.json` incluye `"**/*_key.json"` en `ignore` de functions — correcto, evita subir credenciales.
3. La migración `update-SecurityAttentionPoints-CreatedByUser` quedó registrada como aplicada sin la FK `fk_SecurityAttentionPoints_User` (mismo estado que producción) — consistente, no tocar.

### 7.6 Smoke test (`jest.config.js` + primera suite)

Se creó **`src/jest.config.js`** (ignorado por git) con hosts → `localhost:3000`, `firebaseKey` de `app-ciudadana-cali` y los usuarios de test. Ejecutado contra el servidor `NODE_ENV=test`:

```
npx jest --runInBand __tests__/notifications/webSecurity.test.js
→ 13 passed, 6 failed (19 total)
```

**El pipeline funciona de punta a punta** (jest config → login Firebase → servidor → BD → validadores). Los 6 fallos son **desfase suite-vs-API**, no del entorno:

| Test | Espera | Recibe | Causa |
|---|---|---|---|
| POST /security/ | 201 | 400 | `phone: "testPhone"` no pasa el validador (exige numérico de 10 dígitos, `validatorSecurity.js:7`) |
| GET /security/ (list 2) | 2 items | 1 | Como POST falló, no se crearon los 2 registros |
| GET /security/:id | 200 | 400 | id inexistente (POST falló) |
| POST /security/edit | 200 | 400 | mismo problema del `phone` |
| POST /security/edit (id 999) | 404 | 400 | `id` no pasa Joi antes del lookup |
| POST /security/delete | 200 | 400 | mismo problema del `phone` |

Este es el patrón de la Fase 1: las suites usan datos que ya no cumplen los validadores actuales.

### 7.7 Storage — RESUELTO

- ~~El bucket `app-ciudadana-cali.firebasestorage.app` no existía (proyecto sin billing).~~
- El usuario habilitó Storage en `app-ciudadana-cali`; el bucket ya existe.
- Imagen de prueba subida y verificada en `test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png` (PNG, 70 bytes).
- `GET /api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png` → **200, image/png**.
- El usuario también corrigió `FIREBASE_SERVICE_ACCOUNT_PATH=./config/account_service_key-testing.json` en `.env.test` (apunta al archivo real). Servidor `NODE_ENV=test` reiniciado con la config corregida.

---

## 8. Resultado de la estabilización (Fase 1) — rama `testing`

> 2026-09-24. En la rama `testing`. Fix aprobado por el usuario: `req.rawBody` en `app.js`.

### 8.1 Fix aplicado al backend (aprobado)
- **`src/app.js`**: middleware que captura `req.rawBody` para `multipart/form-data` + `verify` en `bodyParser.json()`. Desbloquea los **13 endpoints de upload** (dependencies, cities, transport_routes, PQRS, reports, full_login, file_management). Sin esto todos devolvían `400 "rawBody not available"` (bug latente desde `c53e7b6 feat(pqrs)`).

### 8.2 Resultado por grupo (suite a suite, 100%)

| Grupo | Suites | Tests |
|---|---|---|
| notifications/web | 8 | ✅ verdes (webSecurity 19, webSecurityCategories 17, webGenderCategories 16, webGenderAttentionLines 16, webAlerts 6, webAdvertisement 20, webAttentionLines 3, allSecurityAttentionPoint 22) |
| notifications/mobile | 9 | ✅ verdes + 2 skips (webDependencies 14+1skip, mobileSecurity 2, mobileReports 10, mobilePublicity 8, mobileGender 6, mobileDependencies 3, mobileAttentionLines 1, mobileAlerts 3+1skip, _afterMobile_webReports 3) |
| thirdParties | 17 | ✅ 407/407 (web 11 + mobile 6 + allTourismCategories) |
| users + admins | 6 | ✅ 81/81 (2 tests DISABLED por bug backend) |
| `webAdvertisementCategories.test.js` | — | **Eliminado** (placeholder `return true`, código muerto) |

**Total: ~40 suites, ~657 tests en verde. 2 skipped + 2 disabled por bugs de backend (ver 8.3).**

### 8.3 Bugs de backend pendientes (bloquean tests puntuales)

| Bug | Endpoint | Efecto | Ubicación |
|---|---|---|---|
| 1. Path relativo mal | `GET /dependencies/template` | 404 (el archivo vive en `microservices/notifications/static/`) | `webDependencies.js:90` |
| 2. `FCM_TOPIC_NAME_MOBILE` vacío en `.env*` | `POST /notifications/register` con token inválido | 500 en vez de 422 | `mobileAlert.js` + `.env` |
| 3. Path relativo mal | `GET /transport_company/route/template` | 500 (workaround: symlink `src/static`) | `transportRoutes.js:927` |
| 4. Ruta comentada | `GET /admin/admin` (listado admins) | 404, 2 tests DISABLED | `webAdmin.js:70-74` |

### 8.4 Hallazgos sendgrid / sigma (regla del usuario)
- **No hay ningún test que use sendgrid ni sigma.** Los 34 archivos revisados: los flujos de email del backend ya usan `EMAIL_PROVIDER=gmail` (nodemailer); las alertas usan push FCM con `sms:false` (no disparan SMS). Nada que sustituir ni eliminar. El único proveedor externo tocado es FCM (bug 8.3.2).

### 8.5 Run completo (repo entero): se cuelga por throttling de identitytoolkit
- Las suites pasan **individualmente y por bloque** (`notifications` 17/17, `thirdParties` por bloques, `users+admins` 6/6).
- El **run completo encadenado** se cuelga después de ~16 logins seguidos a la misma cuenta de test: Firebase Auth (identitytoolkit) hace rate-limit/backoff y el `beforeAll` de login queda esperando sin timeout.
- **Propuestas para CI:** (a) reusar el idToken entre suites (compartir estado global), (b) `--testTimeout` global + manejo del 429/backoff en los logins, (c) pool de usuarios de test por suite. Elegir en Fase 3.