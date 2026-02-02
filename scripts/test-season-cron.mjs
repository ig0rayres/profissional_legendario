#!/usr/bin/env node
/**
 * SCRIPT DE TESTE: Validar cron de temporadas
 * 
 * Executa o endpoint /api/cron/manage-seasons manualmente
 * para testar o sistema de transição de temporadas
 */

const CRON_SECRET = process.env.CRON_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testSeasonCron() {
    console.log('🔍 Testando cron de temporadas...\n')

    if (!CRON_SECRET) {
        console.error('❌ CRON_SECRET não configurado no .env.local')
        process.exit(1)
    }

    try {
        const response = await fetch(`${APP_URL}/api/cron/manage-seasons`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`
            }
        })

        const data = await response.json()

        if (response.ok) {
            console.log('✅ Cron executado com sucesso!\n')
            console.log('📊 Resultado:')
            console.log(JSON.stringify(data, null, 2))
        } else {
            console.error('❌ Erro na execução:')
            console.error(JSON.stringify(data, null, 2))
            process.exit(1)
        }
    } catch (error) {
        console.error('❌ Erro ao chamar endpoint:', error)
        process.exit(1)
    }
}

testSeasonCron()
