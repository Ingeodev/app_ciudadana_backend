# SKILL: deploy-docs

## Contexto

Mantener y actualizar el archivo DEPLOY.md con las notas de despliegue del proyecto. Usar cuando se deba documentar despliegue, variables de entorno, service accounts, Secret Manager, configuracion de Firebase Cloud Functions, Dockerfiles, o cualquier decision de despliegue. Dispara en: "documentar despliegue", "actualizar DEPLOY.md", "agregar nota de deploy", "como se despliega", "migrar a Secret Manager", "registrar env var en docs de despliegue", o cualquier tarea que afecte como se despliega o configura el backend.

## Instrucciones

Generar o actualizar el archivo `DEPLOY.md` en la raiz del proyecto siguiendo ESTRICTAMENTE esta estructura de 7 secciones:

---

## 1. Descripcion

Proporcionar un resumen claro del proyecto que incluya:
- Nombre del proyecto y su proposito principal.
- A quien va dirigido (usuario final, cliente, organizacion).
- Breve descripcion de la funcionalidad principal.
- Contexto de negocio si aplica.

**Formato:**
```markdown
## 1. Descripcion

> Breve resumen del proyecto en 1-2 parrafos.

**Proposito:** [Para que sirve]
**Cliente/Usuario:** [A quien esta dirigido]
**Tipo de aplicacion:** [Backend, API, Microservicios, etc.]
```

---

## 2. Fuente

Especificar el repositorio de codigo y su propietario:
- URL del repositorio (GitHub, GitLab, Bitbucket, etc.).
- Propietario u organizacion dueña del repositorio.
- Rama principal (default branch).
- Si existen repositorios relacionados (frontend, mobile, infra).

**Formato:**
```markdown
## 2. Fuente

| Propiedad | Valor |
|---|---|
| Repositorio | [URL del repo] |
| Propietario | [Organizacion o usuario] |
| Rama principal | [main/master] |
| Proyectos relacionados | [Links si existen] |
```

---

## 3. Tecnologias Usadas

Listar todas las tecnologias utilizadas organizadas por categoria:

**Formato:**
```markdown
## 3. Tecnologias Usadas

### Lenguajes
- [Nombre y version]

### Frameworks
- [Nombre y version]

### SDKs y Librerias Principales
- [Nombre y version] — [Para que se usa]

### Infraestructura
- [Servicio de nube] — [Para que se usa]
- [Base de datos] — [Tipo y version]
- [Otro servicio] — [Para que se usa]

### Herramientas de Desarrollo
- [Herramienta] — [Para que se usa]
```

---

## 4. Guia de Creacion del Entorno de Desarrollo

### 4.1 Prerequisitos

Listar todo lo necesario antes de empezar:
- Version del runtime (Node.js, Python, Go, etc.).
- Herramientas CLI requeridas (firebase, gcloud, docker, etc.).
- Cuentas y permisos necesarios.

### 4.2 Variables de Entorno

Documentar CADA variable de entorno requerida:
- Nombre de la variable.
- Descripcion y proposito.
- Si es obligatoria u opcional.
- Valor de ejemplo (nunca secretos reales).
- Modulo o archivo donde se utiliza.

**Formato de tabla:**
```markdown
| Variable | Obligatoria | Descripcion | Ejemplo | Modulo |
|---|---|---|---|---|
| `DB_HOST` | Si | Servidor de base de datos | `localhost` | `models/index.js` |
```

### 4.3 Archivos de Configuracion

Listar archivos de configuracion necesarios:
- Nombre del archivo.
- Ubicacion en el proyecto.
- Si es versionado o no (.gitignore).
- Si existe plantilla (.example).
- Proposito del archivo.

### 4.4 Configuracion Inicial

Pasos para configurar el entorno desde cero:
1. Clonar repositorio.
2. Instalar dependencias.
3. Crear archivos de configuracion desde plantillas.
4. Configurar variables de entorno.
5. Configurar base de datos si aplica.

---

## 5. Puesta en Marcha

Instrucciones para ejecutar la aplicacion en desarrollo local:

### 5.1 Desarrollo Local

```bash
# Comandos paso a paso
cd [directorio]
npm install
# Configurar .env
npm run start:dev
```

### 5.2 Docker (si aplica)

```bash
# Build y run con Docker
docker build -t [nombre] .
docker run -p [puerto]:[puerto] [nombre]
```

### 5.3 Verificacion

Como verificar que la aplicacion esta funcionando:
- URL de health check.
- Endpoint de prueba.
- Logs esperados.

---

## 6. Despliegue

### 6.1 Formas de Desplegar

Documentar TODAS las formas de desplegar:
- Despliegue automatizado (scripts).
- Despliegue manual (comandos directos).
- Despliegue via CI/CD (si existe).
- Despliegue con Docker/contenedores (si aplica).

### 6.2 Configuracion de Variables en Infraestructura

Explicar como se configuran las variables de entorno en cada entorno:
- Produccion: [Secret Manager, AWS Parameter Store, etc.]
- Staging: [Metodo]
- Procedimiento paso a paso.

### 6.3 Scripts Personalizados

Si existen scripts de despliegue:
- Ubicacion del script.
- Que hace el script (paso a paso).
- Requisitos para ejecutarlo.
- Secrets que gestiona.

### 6.4 Scripts de package.json

Listar los scripts relevantes de `package.json`:

```markdown
| Script | Comando | Descripcion |
|---|---|---|
| `deploy` | `bash deploy.sh` | Despliegue automatizado |
| `start:dev` | `NODE_ENV=development nodemon` | Desarrollo local |
```

### 6.5 Endpoint Publico

URL base de la API o aplicacion desplegada.

### 6.6 Arquitectura de Despliegue

- Region donde se despliega.
- Recursos asignados (memoria, timeout, concurrencia).
- Runtime y version.

---

## 7. Errores Comunes y Soluciones

Documentar errores frecuentes con su solucion:

**Formato:**
```markdown
### [Nombre del error]

**Sintoma:** [Que se ve cuando ocurre]
**Causa:** [Por que ocurre]
**Solucion:** [Como resolverlo]

\`\`\`bash
# Comandos para solucionar
\`\`\`
```

Incluir al menos estos categorias si aplican:
- Errores de autenticacion/permisos.
- Errores de conexion a base de datos.
- Errores de despliegue (Firebase, Docker, CI/CD).
- Errores de variables de entorno.
- Errores de dependencias.

---

## Reglas de Uso

1. NO omitir ninguna de las 7 secciones.
2. Usar tablas para listas de variables, scripts, y endpoints.
3. Incluir bloques de codigo con bash para comandos.
4. NUNCA incluir secretos reales, usar ejemplos ficticios.
5. Referenciar archivos del proyecto con rutas relativas.
6. Mantener secciones numeradas consistentemente.
7. Usar separadores `---` entre secciones principales.
8. Las secciones de endpoints deben agruparse por microservicio o modulo.
9. Documentar el estado actual de tareas pendientes si aplica.
