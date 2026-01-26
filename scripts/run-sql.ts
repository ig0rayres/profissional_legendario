import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Carregar .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function executeSql(sqlContent: string) {
    console.log('🚀 Executando SQL no Supabase...\n')

    // Dividir em statements
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10 && !s.startsWith('--'))

    console.log(`📝 ${statements.length} statements encontrados\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        const preview = statement.substring(0, 80).replace(/\n/g, ' ')

        console.log(`[${i + 1}/${statements.length}] ${preview}...`)

        try {
            const { data, error } = await supabase.rpc('exec', { sql: statement })

            if (error) {
                // Alguns erros são esperados (ex: DROP IF EXISTS)
                if (error.message.includes('does not exist') ||
                    error.message.includes('already exists')) {
                    console.log('  ⚠️  Warning (ignorado):', error.message.substring(0, 100))
                } else {
                    console.log('  ❌ Erro:', error.message.substring(0, 100))
                    errorCount++
                }
            } else {
                console.log('  ✅ OK')
                successCount++
            }
        } catch (error: any) {
            console.log('  ❌ Exception:', error.message.substring(0, 100))
            errorCount++
        }
    }

    console.log(`\n📊 Resultado:`)
    console.log(`   ✅ Sucesso: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)

    return errorCount === 0
}

async function main() {
    const sqlFile = process.argv[2] || 'supabase/migrations/20260125_na_rota_feed.sql'

    console.log('🚀 Supabase SQL Executor (TypeScript)')
    console.log('=====================================\n')
    console.log(`📄 Arquivo: ${sqlFile}`)

    const sqlContent = readFileSync(sqlFile, 'utf8')
    console.log(`📏 Tamanho: ${sqlContent.length} caracteres\n`)

    const success = await executeSql(sqlContent)

    if (success) {
        console.log('\n✅ Deploy concluído com sucesso!')
    } else {
        console.log('\n⚠️  Deploy concluído com alguns erros')
        console.log('💡 Verifique no Supabase Dashboard se tudo foi criado')
    }
}

main().catch(console.error)
