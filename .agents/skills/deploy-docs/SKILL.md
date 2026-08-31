---
name: deploy-docs
description: Mantener y actualizar el archivo DEPLOY.md con las notas de despliegue del proyecto. Usar cuando se deba documentar despliegue, variables de entorno, service accounts, Secret Manager, configuración de Firebase Cloud Functions, Dockerfiles, o cualquier decisión de despliegue. Dispara en: "documentar despliegue", "actualizar DEPLOY.md", "agregar nota de deploy", "cómo se despliega", "migrar a Secret Manager", "registrar env var en docs de despliegue", o cualquier tarea que afecte cómo se despliega o configura el backend.
---

# Deploy Documentation (DEPLOY.md)

Regla de documentación de despliegue del **Cali Mobility / App Ciudadana Backend**.

## Objetivo

Mantener `DEPLOY.md` como **la fuente única de verdad** de cómo se despliega y configura
el backend. Es UN documento vivo, **separado por capítulos temáticos**, que se va
documentando de forma incremental a medida que el proyecto evoluciona.

## Cuándo ACTUALIZAR DEPLOY.md

Debes actualizar `DEPLOY.md` **siempre que**:

- Se despliegue un cambio a Firebase Cloud Functions o se cambie la config de deploy.
- Se agregue / renombre / elimine una **variable de entorno** usada en el código.
- Se cree o roten **service account keys** o secretos.
- Se cambie la **configuración de Firebase** (`firebase.json`, `.firebaserc`, `functions.js`).
- Se agregue / modifique un **Dockerfile** o el flujo de despliegue por contenedores.
- Se tome una **decisión de despliegue** (Secret Manager, consolidación de config, etc.).
- Se detecte **duplicación** o **config huérfana** (ej. `.env.*` sin cargar).

## Reglas para editar DEPLOY.md

1. **Capítulos temáticos, NO un diario cronológico.** Cada capítulo cubre un tema y
   evoluciona en el tiempo. NO apiles entradas por fecha adentro de un capítulo.
2. **Siempre registrar en el Changelog** al final, con fecha en formato `YYYY-MM-DD`,
   un resumen de qué se agregó o cambió y por qué.
3. **Documentar la realidad, no la intención.** Si algo está pendiente, marcarlo con
   `[ ]` (checklist) o `🔲 PENDIENTE`. Si está hecho, describir el estado real.
4. **Incluir la tabla de decisión** de config según ambiente (local vs Cloud Functions)
   cuando se documenten variables o secretos. Recordar la regla de oro:
   > En Firebase Cloud Functions, `firebase.json` ignora `.env`, `**/config.json`,
   > `**/*_key.json` y `**/secrets.json`. **El único mecanismo que funciona en prod
   > es `process.env` (Secret Manager / env vars).**
5. **Antes de agregar un capítulo nuevo**, verificar si el tema ya existe y debe
   extenderse (evitar duplicar secciones sobre el mismo tema).
6. **Estructura de capítulo**:
   - Título `## Capítulo N — Título descriptivo`
   - Contexto breve (por qué existe este capítulo)
   - Tablas donde aplique (variables, decisión, checklists)
   - Pasos / comandos reproducibles
   - Referencias a archivos reales (`archivo:línea`)

## Cómo verificar la realidad antes de documentar

Antes de escribir, confirmar en el código (sin asumir):

- Listar variables de entorno reales:
  ```bash
  grep -rhoE "process\.env\.[A-Z_]+" src --include="*.js" --exclude-dir=node_modules | sort -u
  ```
- Revisar `firebase.json` para ver qué se excluye del bundle de deploy.
- Revisar `.env*` existentes y cuáles se cargan realmente (dotenv).
- Revisar Dockerfiles y `DEPLOYMENT_GUIDE.md` para el flujo por contenedores.

## Archivos relacionados

- `DEPLOY.md` — documento principal de despliegue (editar aquí).
- `firebase.json` — exclusions y config de deploy.
- `DEPLOYMENT_GUIDE.md` — guía antigua de despliegue con Secret Manager + workspace (contiene pasos de bajo nivel).
- `.gitignore` — qué secretos NO deben commitearse.
