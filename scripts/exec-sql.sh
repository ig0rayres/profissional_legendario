#!/bin/bash

# Script para executar SQL no Supabase via psql
# Uso: ./scripts/exec-sql.sh

echo "🚀 Executar SQL no Supabase via psql"
echo "====================================="
echo ""

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado!"
    echo "   Instale com: sudo apt install postgresql-client"
    exit 1
fi

# Pedir connection string
echo "📋 Cole a DATABASE_URL do Supabase:"
echo "   (Encontre em: Settings > Database > Connection String)"
echo ""
read -sp "DATABASE_URL: " DATABASE_URL
echo ""
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não fornecida!"
    exit 1
fi

SQL_FILE="supabase/migrations/20260125_na_rota_feed.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Arquivo SQL não encontrado: $SQL_FILE"
    exit 1
fi

echo "🔄 Executando SQL..."
echo ""

psql "$DATABASE_URL" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SQL executado com sucesso!"
    echo ""
    echo "🎉 Módulo NA ROTA instalado!"
else
    echo ""
    echo "❌ Erro ao executar SQL"
    exit 1
fi
