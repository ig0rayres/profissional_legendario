#!/usr/bin/env node

/**
 * Script para executar SQL no Supabase via API REST
 * Uso: node scripts/run-sql.js <arquivo.sql>
 */

const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas!');
    console.error('   Certifique-se que .env.local contém:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

async function executeSql(sqlContent) {
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

    console.log('🔄 Executando SQL no Supabase...');
    console.log(`📡 URL: ${SUPABASE_URL}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ query: sqlContent })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const result = await response.json();
        console.log('✅ SQL executado com sucesso!');
        return result;
    } catch (error) {
        console.error('❌ Erro ao executar SQL:', error.message);
        throw error;
    }
}

async function executeSqlDirect(sqlContent) {
    // Alternativa: usar a API de query direta
    const url = `${SUPABASE_URL}/rest/v1/`;

    console.log('🔄 Tentando executar SQL diretamente...');

    // Dividir SQL em statements individuais
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 ${statements.length} statements encontrados`);

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length < 10) continue; // Skip very short statements

        console.log(`\n[${i + 1}/${statements.length}] Executando...`);
        console.log(statement.substring(0, 100) + '...');

        try {
            // Usar fetch para executar via REST API
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ sql: statement + ';' })
            });

            if (response.ok) {
                console.log('✅ OK');
            } else {
                const error = await response.text();
                console.log(`⚠️  Warning: ${error.substring(0, 200)}`);
            }
        } catch (error) {
            console.log(`⚠️  Warning: ${error.message}`);
        }
    }
}

async function main() {
    const sqlFile = process.argv[2] || 'supabase/migrations/20260125_na_rota_feed.sql';

    console.log('🚀 Supabase SQL Executor');
    console.log('========================\n');
    console.log(`📄 Arquivo: ${sqlFile}`);

    if (!fs.existsSync(sqlFile)) {
        console.error(`❌ Arquivo não encontrado: ${sqlFile}`);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log(`📏 Tamanho: ${sqlContent.length} caracteres\n`);

    // Tentar executar
    try {
        await executeSqlDirect(sqlContent);
        console.log('\n✅ Processo concluído!');
        console.log('\n💡 Dica: Verifique no Supabase Dashboard se tudo foi criado corretamente.');
    } catch (error) {
        console.error('\n❌ Falha na execução:', error.message);
        console.log('\n📋 SOLUÇÃO ALTERNATIVA:');
        console.log('1. Acesse: https://supabase.com/dashboard');
        console.log('2. Vá em SQL Editor');
        console.log(`3. Copie o conteúdo de: ${sqlFile}`);
        console.log('4. Cole e execute manualmente');
        process.exit(1);
    }
}

main();
