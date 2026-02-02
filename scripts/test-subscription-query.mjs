#!/usr/bin/env node
/**
 * Testar query de subscription diretamente
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltam credenciais!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSubscriptionQuery() {
    console.log('🔍 Testando query de subscription...\n')

    // Buscar Igor
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', 'igor@rotabusinessclub.com.br')
        .single()

    if (!profile) {
        console.error('❌ Perfil não encontrado!')
        return
    }

    console.log('✅ Perfil encontrado:')
    console.log(`   ID: ${profile.id}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Nome: ${profile.full_name}\n`)

    // Testar query original (com join)
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
            *,
            plan_tiers(*)
        `)
        .eq('user_id', profile.id)
        .single()

    console.log('📊 Query com JOIN:')
    if (error) {
        console.error('❌ Erro:', error)
    } else if (!subscription) {
        console.log('⚠️  Subscription não encontrada')
    } else {
        console.log('✅ Subscription encontrada!')
        console.log('   Plan ID:', subscription.plan_id)
        console.log('   Status:', subscription.status)
        console.log('   Plan Tiers:', JSON.stringify(subscription.plan_tiers, null, 2))
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Testar query sem join (verificar se subscriptions existe)
    const { data: subOnly } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .single()

    console.log('📊 Query SEM JOIN:')
    console.log('   Plan ID:', subOnly?.plan_id)
    console.log('   Status:', subOnly?.status)

    // Buscarplan manual
    if (subOnly) {
        const { data: planTier } = await supabase
            .from('plan_tiers')
            .select('*')
            .eq('id', subOnly.plan_id)
            .single()

        console.log('\n📊 Plan Tier buscado manualmente:')
        console.log('   ', JSON.stringify(planTier, null, 2))
    }
}

testSubscriptionQuery().catch(console.error)
