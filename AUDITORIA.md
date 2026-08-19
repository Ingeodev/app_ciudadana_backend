# 📋 INFORME DE AUDITORÍA CONSOLIDADO

## App Ciudadana Backend

**Fecha de emisión:** 2026-04-14  
**Fuentes:** Reporte de Arquitectura (silly-copper-primate), Reporte de Auditoría (irrelevant-coffee-otter)  
**Alcance:** src/ — Backend completo (Node.js/Express/Sequelize/Firebase)

---

## 1. Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Puntuación de calidad** | **3.5 / 10** |
| Hallazgos críticos | 4 |
| Hallazgos altos | 6 |
| Hallazgos medios | 7 |
| Hallazgos bajos | 5 |
| **Total de hallazgos** | **22** |

El backend presenta **bugs activos que producen crashes en producción**, secretos comprometidos en el repositorio, y una duplicación masiva de código que impide el mantenimiento sostenible. La arquitectura actual es un **monolito modular** (no microservicios), con problemas críticos de seguridad que requieren atención inmediata.

---

## 2. Hallazgos Críticos de Seguridad

### 2.1 Credenciales Exuestas en Repositorio

| ID | Hallazgo | Severidad | Ubicación |
|----|----------|-----------|-----------|
| **C-01** | Private Key de Firebase Admin SDK expuesta | 🔴 P0 | `src/config/account_service_key.json` |
| **C-02** | Credenciales de base de datos hardcodeadas | 🔴 P0 | `src/config/config.json` |

#### C-01: Firebase Private Key Expuesta

La clave privada RSA completa de la cuenta de servicio de Firebase (`firebase-adminsdk-fbsvc@app-ciudadana-cali.iam.gserviceaccount.com`) está commitada en el repositorio. Aunque el archivo está en `.gitignore`, ya fue trackeada en el historial de git, lo que significa que **el secreto está permanentemente comprometido**.

**Impacto:** Acceso total al proyecto Firebase de producción. Un atacante puede crear/eliminar usuarios, modificar tokens, leer datos y revocar sesiones de todos los usuarios.

**Acción inmediata requerida:**
1. Revocar la service account en Google Cloud Console y generar una nueva.
2. Usar Google Secret Manager o variables de entorno para inyectar credenciales en runtime.
3. Limpiar el historial de git con `git filter-repo` o `BFG Repo Cleaner`.

#### C-02: Credenciales de Base de Datos en Texto Plano

Las credenciales de Supabase (usuario, contraseña y host) están hardcodeadas en `config.json`. Peor aún: son **idénticas** para development, test y production, lo que significa que las pruebas locales se conectan directamente a la base de datos de producción.

```json
// config/config.json (EXPUESTO)
{
  "development": {
    "username": "postgres.dhhdwuxomghkrovmyhit",
    "password": "Carboximetilcelulosa2026*",
    "database": "postgres",
    "host": "aws-0-us-west-2.pooler.supabase.com"
  }
}
```

**Acción inmediata requerida:**
1. Rotar la contraseña de Supabase inmediatamente.
2. Migrar todas las credenciales a variables de entorno.
3. Implementar `.env` y agregar `config/*.json` al `.gitignore`.

---

## 3. Análisis de Arquitectura

### 3.1 Patrón Detectado: Monolito Modular (No Microservicios)

El proyecto implementa 6 microservicios bajo `src/microservices/`, pero **no son verdaderos microservicios**:

| Aspecto | Estado Real | Evaluación |
|---------|-------------|------------|
| Base de datos | Compartida (PostgreSQL única) | ❌ Acoplamiento fuerte |
| Modelos | Copia física en `src/models/` compartida | ❌ Sin aislamiento de datos |
| Puerto | Todos usan 3000 (excepto monolito en 3001) | ⚠️ Conflicto potencial |
| Comunicación | Require directo (`../../../../models/`) | ❌ Sin API interna |
| Despliegue | Mismo proceso (`all-server.js`) | ❌ Monolito con rutas separadas |

**Estructura actual:**

```
src/
├── all-server.js          ← Punto de entrada monolito (puerto 3001)
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/                ← Sequelize COMPARTIDO
│   ├── index.js           ← Conexión única a PostgreSQL
│   └── [37 modelos]
└── microservices/
    ├── users/       (users, notifications, traffic,
    ├── notifications/  thirdParties, fileManagement, admin)
    ├── traffic/          Todos comparten la misma DB
    ├── thirdParties/
    ├── fileManagement/
    └── admin/
```

### 3.2 Error de Conexión a Supabase (Pooling)

El host actual (`aws-0-us-west-2.pooler.supabase.com`) usa el puerto incorrecto para el pooler de Supabase. El formato correcto del pooler es:

```
postgres://[user]:[password]@aws-0-us-west-2.pooler.supabase.com:6543/[database]
```

El error "Tenant or user not found" indica que el pooler no puede autenticar al usuario con la configuración actual.

### 3.3 Cuellos de Botella Arquitectónicos

| # | Cuello de Botella | Severidad | Impacto |
|---|-------------------|-----------|---------|
| 1 | Base de datos compartida | 🔴 Crítico | Un query pesado bloquea todos los servicios |
| 2 | Sequelize con logging activo | 🟠 Alto | IO masiva en producción |
| 3 | CORS extremadamente permisivo | 🟠 Alto | Seguridad comprometida |
| 4 | Sin circuit breaker | 🟡 Medio | Si la DB falla, todo falla |
| 5 | Sin connection pooling configurado | 🟡 Medio | Agotamiento de conexiones Supabase |
| 6 | Firebase Auth sin caching | 🟡 Medio | Latencia innecesaria en cada request |
| 7 | Sin rate limiting | 🟡 Medio | Sin protección contra abuso |
| 8 | Hooks duplicados en modelos | 🟡 Medio | Violación DRY |

---

## 4. Errores de Código y Lógica

### 4.1 ReferenceErrors que Causan Crashes en Producción

| ID | Archivo | Línea | Descripción |
|----|---------|-------|-------------|
| **C-03** | `admin/v1/controllers/webAdmin.js` | 260 | `resCreate` no definido en `postSetPasswd` |
| **C-04** | `admin/v1/controllers/webAdmin.js` | 292 | `clientId` no definido en `postAddRole` |
| **M-04** | `admin/v1/controllers/webAdmin.js` | 542 | Variable `update` no definida en `postSendMailResetPasswd` |

#### C-03: ReferenceError en postSetPasswd

```javascript
// ❌ PROBLEMA:
const resUpdate = await setPasswd(clientId, passwd);
if (resUpdate.status) {
  throw {
    status: resCreate.status,   // ← ReferenceError: resCreate is not defined
    message: resCreate.detail,
  };
}

// ✅ CORRECCIÓN:
if (resUpdate.status) {
  throw {
    status: resUpdate.status,
    message: resUpdate.detail,
  };
}
```

#### C-04: Variable clientId no definida en postAddRole

La función valida `{ id, roleId }` del body, pero llama `addCustomClaim(clientId, role)` donde `clientId` nunca fue declarado ni derivado de `id`.

### 4.2 Bugs de Routing y Seguridad

| ID | Archivo | Descripción |
|----|---------|-------------|
| **A-02** | `fileManagement/v1/routes/download.js` | Ruta pública registrada ANTES del middleware de auth; archivos "seguros" accesibles sin autenticación |

La ruta `GET /:folder/:fileName` está registrada antes de `router.use(authMiddleware)`, por lo que las rutas `/secure/:folder/:fileName` nunca se alcanzan.

### 4.3 Otros Errores de Lógica

| ID | Archivo | Descripción |
|----|---------|-------------|
| **A-03** | `authMiddleware.js` L104-114 | `authMiddlewareMobile` permite acceso si el usuario no existe en la DB |
| **M-05** | `users/v1/controllers/web/users.js` L236 | Pasa string literal `"clientId"` en lugar de la variable `clientId` |
| **M-06** | `admin/v1/controllers/webAdminFree.js` L16 | Base64 decode solo reemplaza la primera ocurrencia de `-` y `_` |

---

## 5. Inconsistencias de Modelos (Sequelize)

### 5.1 Foreign Keys Contradictorias

| Modelo | Campo | allowNull | Contradicción |
|--------|-------|-----------|---------------|
| `user.js` | `roleId` | `true` | Permite NULL |
| `role.js` | FK roleId | `allowNull: false` | NO permite NULL |

```javascript
// user.js línea 166-168
roleId: {
  type: DataTypes.INTEGER,
  allowNull: true,  // ← Permite NULL
}

// role.js línea 12-16
Role.hasMany(models.User, {
  foreignKey: { name: "roleId", allowNull: false }  // ← NO permite NULL
});
```

### 5.2 Tipos de Datos No Estándar

```javascript
// user.js línea 244
acceptBicycleTerms: {
  type: "TIMESTAMPZ",  // ← STRING, no es DataTypes válido
  allowNull: true,
}
```

### 5.3 Modelos sin Índices Definidos

Modelos críticos **SIN índices** (impacto en performance):
- `Report` (tabla de alto volumen)
- `Alert`
- `SecurityAttentionPoint`

### 5.4 Resumen de Inconsistencias

| Inconsistencia | Ejemplo | Impacto |
|----------------|---------|---------|
| Definición de columnas FK | `User.roleId: allowNull: true` vs `Role.id: allowNull: false` | Contradicción lógica |
| Nombres de tablas | Algunos usan `tableName`, otros no | Inconsistencia implícita |
| Índices | Solo algunos modelos tienen índices definidos | Performance desigual |
| Hooks | Algunos tienen `afterFind`, otros no | Transformación inconsistente |
| Tipos de datos especiales | `User.acceptBicycleTerms` usa `"TIMESTAMPZ"` (string) | Puede fallar en PostgreSQL |
| ENUM hardcoded | `Report.isApproved` usa ENUM('yes', 'no') | Requiere migrations manuales |

---

## 6. Plan de Acción Recomendado

### Inmediato (0-24 horas)

| Prioridad | Acción | ID |
|-----------|--------|-----|
| 🔴 P0 | Revocar service account Firebase y generar nueva clave | C-01 |
| 🔴 P0 | Rotar contraseña de base de datos Supabase | C-02 |
| 🔴 Crítico | Corregir ReferenceError en `postSetPasswd` (resCreate → resUpdate) | C-03 |
| 🔴 Crítico | Corregir ReferenceError en `postAddRole` (clientId no definido) | C-04 |

### Sprint 1 (Esta semana)

| Prioridad | Acción | ID |
|-----------|--------|-----|
| 🟠 Alto | Corregir bug de routing: archivos seguros accesibles sin auth | A-02 |
| 🟠 Alto | Corregir `authMiddlewareMobile` para verificar usuario en DB | A-03 |
| 🟠 Alto | Configurar CORS con whitelist de orígenes | A-01 |
| 🟠 Alto | Verificar rol contra tabla de DB en middleware | A-05 |
| 🟡 Medio | Corregir ReferenceError en `postSendMailResetPasswd` | M-04 |
| 🟡 Medio | Corregir paso de `clientId` en `getAccountLoginPhase` | M-05 |
| 🟡 Medio | Corregir base64 decode en `postEmailVerification` | M-06 |

### Sprint 2 (Próximas 2 semanas)

| Prioridad | Acción | ID |
|-----------|--------|-----|
| 🟡 Medio | Centralizar `use_validator_on_data` (5 archivos duplicados) | M-01 |
| 🟡 Medio | Centralizar `corsOptions` (6 microservicios duplicados) | M-02 |
| 🟠 Alto | Migrar credenciales a variables de entorno / Secret Manager | C-02 |
| 🟡 Medio | Eliminar console.log de políticas en producción | M-07 |
| 🟡 Medio | Eliminar bodyParser.json() duplicado en microservicios | M-03 |

### Mediano Plazo (1-3 meses)

| Acción | Descripción |
|--------|-------------|
| **Corregir inconsistencias Sequelize** | Unificar definición de FK, tipos de datos, índices |
| **Implementar índices** | Crear índices en columnas frecuentemente consultadas |
| **Implementar circuit breaker** | Usar `opossum` o `cockatiel` para resiliencia |
| **Cachear tokens Firebase** | Implementar cache en memoria para `verifyIdToken` |
| **Configurar rate limiting** | Proteger endpoints contra abuso |

### Largo Plazo (Si se requiere migración a microservicios reales)

1. Separar bases de datos: Una DB por servicio
2. Implementar API Gateway (Kong, AWS API Gateway o Traefik)
3. Implementar Message Queue (RabbitMQ o Kafka)
4. Implementar Service Discovery (Consul o Kubernetes DNS)
5. Deployment independiente: Docker/Kubernetes por servicio

---

## Estado de Configuración Original

> **Nota:** Los archivos de configuración originales NO han sido eliminados. Los problemas identificados son:

- `src/config/config.json` — Credenciales hardcodeadas
- `src/config/account_service_key.json` — Private key expuesta
- `src/config/PSE-148063.pdf` — Archivo binario innecesario en el repo

Se recomienda mover estos archivos a versiones de ejemplo (`.sample`) y usar variables de entorno para las credenciales reales.

---

*Informe generado a partir de la consolidación de los reportes del Arquitecto y el Auditor. Ambos análisis fueron completados el 2026-04-14.*
