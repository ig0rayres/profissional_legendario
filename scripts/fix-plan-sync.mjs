// 🔄 Verificar e Corrigir Plano do Usuário
// Problema: Contratou ELITE mas aparece RECRUTA

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

async function fixPlanSync() {
    console.log('🔍 Verificando sincronização de planos...\n')

    try {
        // 1. Buscar subscription do Igor
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', 'igor@rotabusinessclub.com.br')
            .single()

        if (!profile) {
            console.log('❌ Perfil não encontrado')
            return
        }

        console.log(`📧 Usuário: ${profile.email}`)
        console.log(`🆔 ID: ${profile.id}\n`)

        // 2. Verificar subscription atual
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (subscription) {
            console.log('📊 Subscription encontrada:')
            console.log(`   Plan ID: ${subscription.plan_id}`)
            console.log(`   Status: ${subscription.status}`)
            console.log(`   Criada em: ${subscription.created_at}\n`)

            if (subscription.plan_id === 'elite' && subscription.status === 'active') {
                console.log('✅ Plano ELITE já está ativo!')
                console.log('✅ Frontend deveria mostrar corretamente.')
                console.log('\n💡 Se ainda aparece RECRUTA, pode ser cache do browser.')
                return
            }
        } else {
            console.log('⚠️  Nenhuma subscription encontrada!\n')
        }

        // 3. Perguntar se quer criar/atualizar
        console.log('🔧 Deseja criar/atualizar para plano ELITE?')
        console.log('   Execute com flag --fix para aplicar\n')

        // Se rodar com --fix
        if (process.argv.includes('--fix')) {
            console.log('🔄 Atualizando plano para ELITE...\n')

            if (subscription) {
                // Atualizar existente
                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        plan_id: 'elite',
                        status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', subscription.id)

                if (error) {
                    console.error('❌ Erro ao atualizar:', error)
                } else {
                    console.log('✅ Subscription atualizada para ELITE!')
                }
            } else {
                // Criar nova
                const { error } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: profile.id,
                        plan_id: 'elite',
                        status: 'active',
                        started_at: new Date().toISOString()
                    })

                if (error) {
                    console.error('❌ Erro ao criar:', error)
                } else {
                    console.log('✅ Subscription ELITE criada!')
                }
            }

            // Verificar resultado
            const { data: updated } = await supabase
                .from('subscriptions')
                .select('plan_id, status')
                .eq('user_id', profile.id)
                .single()

            console.log('\n=====================================')
            console.log('✅ CORREÇÃO CONCLUÍDA!')
            console.log('=====================================')
            console.log(`Plan ID: ${updated?.plan_id}`)
            console.log(`Status: ${updated?.status}`)
            console.log('\n💡 Atualize a página do perfil (Ctrl+Shift+R)')
            console.log('=====================================\n')
        }

    } catch (error) {
        console.error('❌ Erro:', error)
        process.exit(1)
    }
}

fixPlanSync()
