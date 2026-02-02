// Script Node.js para sincronizar dados do cadastro para perfil
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erzprkocwzgdjrsictps.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function syncRegisterDataToProfiles() {
    console.log('🔄 Sincronizando dados do cadastro para perfis...\n')

    try {
        // 1. Buscar usuários com raw_user_meta_data
        const { data: users, error: usersError } = await supabase
            .auth.admin.listUsers()

        if (usersError) {
            console.error('❌ Erro ao buscar usuários:', usersError)
            return
        }

        console.log(`📊 Encontrados ${users.users.length} usuários\n`)

        let updated = 0
        let errors = 0

        // 2. Para cada usuário, sincronizar dados
        for (const user of users.users) {
            const metadata = user.user_metadata || {}
            const userId = user.id
            const email = user.email

            // Se não tem metadados, pular
            if (!metadata.full_name && !metadata.cpf && !metadata.pista) {
                continue
            }

            console.log(`📝 Processando ${email}...`)

            // Preparar dados para atualização
            const updateData = {}

            if (metadata.full_name) updateData.full_name = metadata.full_name
            if (metadata.cpf) updateData.cpf = metadata.cpf
            if (metadata.pista) updateData.pista = metadata.pista
            if (metadata.rota_number) updateData.rota_number = metadata.rota_number
            if (metadata.role) updateData.role = metadata.role

            // Atualizar profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId)

            if (updateError) {
                console.error(`   ❌ Erro ao atualizar ${email}:`, updateError.message)
                errors++
            } else {
                console.log(`   ✅ Atualizado: ${Object.keys(updateData).join(', ')}`)
                updated++
            }
        }

        console.log('\n=====================================')
        console.log('✅ SINCRONIZAÇÃO CONCLUÍDA!')
        console.log('=====================================')
        console.log(`📊 Estatísticas:`)
        console.log(`   ✅ Atualizados: ${updated}`)
        console.log(`   ❌ Erros: ${errors}`)
        console.log(`   📋 Total processados: ${users.users.length}`)
        console.log('=====================================\n')

    } catch (error) {
        console.error('❌ Erro inesperado:', error)
        process.exit(1)
    }
}

syncRegisterDataToProfiles()
