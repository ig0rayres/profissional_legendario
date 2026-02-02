// 🛡️ BACKUP AUTOMÁTICO DE CONTAS CRÍTICAS
// Faz backup completo de contas admin e sistema

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erzprkocwzgdjrsictps.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function backupSystemAccounts() {
    console.log('🛡️  Backup de Contas Críticas do Sistema\n')

    try {
        // Criar diretório de backups
        const timestamp = new Date().toISOString().split('T')[0]
        const backupDir = path.join(__dirname, '..', 'backups', 'system-accounts', timestamp)
        fs.mkdirSync(backupDir, { recursive: true })

        // 1. Buscar contas do sistema
        console.log('📊 Buscando contas protegidas...')
        const { data: accounts, error: accountsError } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_system_account', true)

        if (accountsError) {
            console.error('❌ Erro ao buscar contas:', accountsError)
            return
        }

        console.log(`✅ Encontradas ${accounts.length} conta(s) protegida(s)\n`)

        // 2. Para cada conta, buscar dados relacionados
        const fullBackup = []

        for (const account of accounts) {
            console.log(`📦 Fazendo backup: ${account.email}`)

            // Buscar gamification_stats
            const { data: gamif } = await supabase
                .from('gamification_stats')
                .select('*')
                .eq('user_id', account.id)
                .maybeSingle()

            // Buscar subscriptions
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', account.id)

            // Buscar user_medals
            const { data: medals } = await supabase
                .from('user_medals')
                .select('*')
                .eq('user_id', account.id)

            fullBackup.push({
                profile: account,
                gamification: gamif,
                subscriptions: subs || [],
                medals: medals || [],
                backed_up_at: new Date().toISOString()
            })

            console.log(`   ✅ Backup completo de ${account.email}`)
        }

        // 3. Salvar backup
        const backupPath = path.join(backupDir, 'system_accounts_backup.json')
        fs.writeFileSync(
            backupPath,
            JSON.stringify(fullBackup, null, 2)
        )

        // 4. Salvar metadados
        const metadata = {
            backup_date: new Date().toISOString(),
            accounts_count: accounts.length,
            accounts: accounts.map(a => ({
                id: a.id,
                email: a.email,
                role: a.role,
                full_name: a.full_name
            }))
        }

        fs.writeFileSync(
            path.join(backupDir, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        )

        console.log('\n=====================================')
        console.log('✅ BACKUP CONCLUÍDO COM SUCESSO!')
        console.log('=====================================')
        console.log(`📁 Local: ${backupPath}`)
        console.log(`📊 Contas: ${accounts.length}`)
        console.log(`📅 Data: ${timestamp}`)
        console.log('=====================================\n')

        // 5. Limpar backups antigos (manter últimos 30 dias)
        cleanOldBackups()

    } catch (error) {
        console.error('❌ Erro no backup:', error)
        process.exit(1)
    }
}

function cleanOldBackups() {
    const backupsRoot = path.join(__dirname, '..', 'backups', 'system-accounts')

    if (!fs.existsSync(backupsRoot)) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const folders = fs.readdirSync(backupsRoot)
    let deletedCount = 0

    folders.forEach(folder => {
        const folderPath = path.join(backupsRoot, folder)
        const stats = fs.statSync(folderPath)

        if (stats.isDirectory() && stats.mtime < thirtyDaysAgo) {
            fs.rmSync(folderPath, { recursive: true, force: true })
            deletedCount++
        }
    })

    if (deletedCount > 0) {
        console.log(`🗑️  Removidos ${deletedCount} backup(s) antigo(s) (>30 dias)`)
    }
}

backupSystemAccounts()
