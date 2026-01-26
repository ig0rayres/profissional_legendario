#!/bin/bash

# Script para executar SQL no Supabase via curl
# Uso: ./scripts/deploy-na-rota.sh

set -e

echo "🚀 Deploy do Módulo NA ROTA"
echo "============================"
echo ""

# Carregar variáveis de ambiente
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ Arquivo .env.local não encontrado!"
    exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
SQL_FILE="supabase/migrations/20260125_na_rota_feed.sql"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
    echo "❌ Variáveis de ambiente não configuradas!"
    echo "   Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "📡 Supabase URL: $SUPABASE_URL"
echo "📄 SQL File: $SQL_FILE"
echo ""

# Ler o arquivo SQL
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Arquivo SQL não encontrado: $SQL_FILE"
    exit 1
fi

SQL_CONTENT=$(cat "$SQL_FILE")

echo "🔄 Executando SQL via Management API..."
echo ""

# Tentar via Management API (requer project ref)
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📦 Project Ref: $PROJECT_REF"
echo ""

# Criar arquivo temporário com o SQL
TMP_FILE=$(mktemp)
echo "$SQL_CONTENT" > "$TMP_FILE"

echo "💡 INSTRUÇÕES PARA EXECUÇÃO MANUAL:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "2. Copie o conteúdo do arquivo: $SQL_FILE"
echo "3. Cole no SQL Editor e clique em 'Run'"
echo ""
echo "📋 Ou execute este comando para copiar para clipboard:"
echo "   cat $SQL_FILE | xclip -selection clipboard"
echo ""

# Tentar executar via psql se disponível
if command -v psql &> /dev/null; then
    echo "🔍 psql encontrado! Tentando conectar..."
    echo ""
    echo "⚠️  Você precisa da DATABASE_URL do Supabase"
    echo "   Encontre em: Settings > Database > Connection String"
    echo ""
    read -p "Cole a DATABASE_URL (ou Enter para pular): " DATABASE_URL
    
    if [ ! -z "$DATABASE_URL" ]; then
        echo ""
        echo "🔄 Executando via psql..."
        psql "$DATABASE_URL" -f "$SQL_FILE"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ SQL executado com sucesso via psql!"
            rm "$TMP_FILE"
            exit 0
        fi
    fi
fi

echo ""
echo "📝 Arquivo SQL pronto em: $SQL_FILE"
echo "🔗 Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo ""

rm "$TMP_FILE"
