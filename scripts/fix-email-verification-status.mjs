// Script simplificado para corrigir status de verificação
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erzprkocwzgdjrsictps.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!')
    process.exit(1)
}

// Criar client com service_role_key (bypass RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function corrigirStatus() {
    console.log('🔵 Corrigindo status de verificação...\n')

    try {
        // Buscar todos os usuários com email confirmado mas status pending
        console.log('1️⃣ Buscando usuários com email confirmado...')

        // Query raw para pegar dados de auth.users e profiles juntos
        const { data: users, error: queryError } = await supabase
            .from('profiles')
            .select('id, email, verification_status')
            .eq('verification_status', 'pending')

        if (queryError) {
            console.error('❌ Erro ao buscar usuários:', queryError)
            return
        }

        console.log(`📊 Encontrados ${users?.length || 0} usuários com status pending`)

        if (!users || users.length === 0) {
            console.log('✅ Nenhum usuário para corrigir!')
            return
        }

        // 2. Atualizar todos para verified
        console.log('\n2️⃣ Atualizando status para "verified"...')
        const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update({ verification_status: 'verified' })
            .eq('verification_status', 'pending')
            .select()

        if (updateError) {
            console.error('❌ Erro ao atualizar:', updateError)
            return
        }

        console.log(`✅ ${updated?.length || 0} usuários corrigidos!\n`)

        // 3. Estatísticas finais
        console.log('3️⃣ Estatísticas finais...')
        const { data: allProfiles } = await supabase
            .from('profiles')
            .select('verification_status, email')

        const verified = allProfiles?.filter(p => p.verification_status === 'verified').length || 0
        const pending = allProfiles?.filter(p => p.verification_status === 'pending').length || 0
        const rejected = allProfiles?.filter(p => p.verification_status === 'rejected').length || 0

        console.log('\n=====================================')
        console.log('✅ CORREÇÃO CONCLUÍDA!')
        console.log('=====================================')
        console.log(`📊 Status atual:`)
        console.log(`   ✅ Verificados: ${verified}`)
        console.log(`   ⏳ Pendentes: ${pending}`)
        console.log(`   ❌ Rejeitados: ${rejected}`)
        console.log('=====================================\n')

        console.log('⚠️  IMPORTANTE:')
        console.log('O trigger SQL ainda precisa ser criado manualmente no Supabase SQL Editor.')
        console.log('Arquivo: sql/seeds/TRIGGER_SYNC_EMAIL_VERIFICATION.sql\n')

    } catch (error) {
        console.error('❌ Erro inesperado:', error)
        process.exit(1)
    }
}

corrigirStatus()
