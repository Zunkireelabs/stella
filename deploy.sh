#!/bin/bash
set -e

ENV=${1:-dev}

if [ "$ENV" == "prod" ]; then
  COMPOSE_FILE="docker-compose.yml"
  CONTAINER_NAME="stella-web-prod"
  URL="stella-commerce.com"
  echo "WARNING: PRODUCTION DEPLOYMENT to $URL"
  read -p "Are you sure? (y/n): " confirm
  if [ "$confirm" != "y" ]; then exit 1; fi
else
  COMPOSE_FILE="docker-compose.dev.yml"
  CONTAINER_NAME="stella-web-dev"
  URL="dev-web.stella-commerce.com"
  echo "DEVELOPMENT DEPLOYMENT to $URL"
fi

echo "1. Installing dependencies..."
npm install

echo "2. Building site..."
npm run build

if [ ! -d "_site" ]; then
  echo "ERROR: Build failed. '_site' directory not found."
  exit 1
fi

echo "3. Building Docker image..."
docker compose -f "$COMPOSE_FILE" build --no-cache

echo "4. Restarting container..."
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" up -d

echo "Deployed: https://$URL"
