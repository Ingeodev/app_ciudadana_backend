'use strict';

/**
 * Carga centralizada de variables de entorno según ambiente.
 *
 * En Firebase Cloud Functions, `firebase.json` NO sube los archivos `.env*`
 * (están en "ignore"). Por eso, en producción cloud las variables se inyectan
 * vía Secret Manager / env vars del host, y este módulo solo confirma que no
 * hay `.env` local que cargar (sin lanzar error).
 *
 * En desarrollo local carga `<src>/.env.[NODE_ENV|development]` o `<src>/.env`.
 * Los paths se resuelven relativos a la ubicación de ESTE módulo
 * (src/config/dotenv.js), por lo que funciona incluso si el proceso arranca
 * desde un CWD distinto (caso de los microservicios legacy). Todas las
 * apps comparten el MISMO archivo `.env` de src/.
 *
 * Prioridad de archivo (mayor a menor):
 *   1. .env.${NODE_ENV}     (ej. .env.production)
 *   2. .env                  (default de dotenv)
 */
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
const ENV_DIR = path.resolve(__dirname, ".."); // src/
const CANDIDATES = [`.env.${env}`, ".env"];

function loadEnvFile(filename) {
  // Let dotenv resolve relative to the src/ dir.
  const result = dotenv.config({ path: path.join(ENV_DIR, filename) });
  return result;
}

const primary = loadEnvFile(CANDIDATES[0]);
if (primary.error) {
  const fallback = loadEnvFile(CANDIDATES[1]);
  if (fallback.error) {
    // Sin .env local (caso Cloud Functions o emulador). No es error fatal:
    // las variables ya vienen del host/Secret Manager.
  }
}

module.exports = { env, envDir: ENV_DIR };
