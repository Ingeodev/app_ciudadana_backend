#!/bin/bash
# deploy.sh — Crea/actualiza secrets en Secret Manager y deploya a Firebase
# Lee variables desde src/.env.production

set -e

PROJECT="mov-cali-app-ciudadana"
ENV_FILE="src/.env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE no existe"
  exit 1
fi

echo "=== Leyendo variables desde $ENV_FILE ==="

# Parsear variables del .env (ignora comentarios y líneas vacías)
parse_env() {
  grep -E "^[A-Z_]+=" "$ENV_FILE" | sed 's/#.*//' | while IFS='=' read -r key value; do
    # Remove surrounding quotes if any
    value=$(echo "$value" | sed 's/^["'"'"']//;s/["'"'"']$//')
    echo "$key=$value"
  done
}

# Evaluar las variables
while IFS='=' read -r key value; do
  export "$key"="$value"
done < <(parse_env)

# Secrets que se deben crear/actualizar
SECRETS=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD" "FIREBASE_STORAGE_BUCKET")
OPTIONAL_SECRETS=("SENDGRID_API_KEY" "SENDGRID_EMAIL" "SIGMA_ACCOUNT_KEY" "FCM_TOPIC_NAME_MOBILE")

echo "=== Creando/actualizando secrets en Secret Manager ==="

create_or_update_secret() {
  local name="$1"
  local value="$2"

  if [ -z "$value" ]; then
    echo "  SKIP: $name (vacío)"
    return
  fi

  if gcloud secrets describe "$name" --project="$PROJECT" &>/dev/null; then
    echo "  UPDATE: $name"
    echo "$value" | gcloud secrets versions add "$name" --data-file=- --project="$PROJECT"
  else
    echo "  CREATE: $name"
    echo "$value" | gcloud secrets create "$name" --data-file=- --project="$PROJECT"
  fi
}

for secret in "${SECRETS[@]}"; do
  create_or_update_secret "$secret" "${!secret}"
done

echo ""
echo "=== Secrets opcionales ==="
for secret in "${OPTIONAL_SECRETS[@]}"; do
  create_or_update_secret "$secret" "${!secret}"
done

echo ""
echo "=== Deploying to Firebase ==="
firebase deploy --only functions --project "$PROJECT"

echo ""
echo "=== Deploy completo ==="
