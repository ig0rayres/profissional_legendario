#!/bin/bash

# Script helper para executar SQL no Supabase
# Uso: ./scripts/run-migration.sh [arquivo.sql]

set -e

# Carregar DATABASE_URL do .env.local
if [ -f .env.local ]; then
    export $(grep DATABASE_URL .env.local | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrada no .env.local"
    exit 1
fi

SQL_FILE="${1:-supabase/migrations/20260125_na_rota_feed.sql}"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Arquivo não encontrado: $SQL_FILE"
    exit 1
fi

echo "🚀 Executando: $SQL_FILE"
psql "$DATABASE_URL" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Sucesso!"
else
    echo "❌ Erro ao executar SQL"
    exit 1
fi
