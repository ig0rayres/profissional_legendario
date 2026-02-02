// 🔍 Verificar Limites de Categorias dos Planos
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erzprkocwzgdjrsictps.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function checkCategoryLimits() {
    console.log('🔍 Verificando limites de categorias...\n')

    // 1. Ver configuração atual
    const { data: plans } = await supabase
        .from('plan_config')
        .select('plan_id, tier, name, max_categories')
        .order('display_order')

    console.log('📊 Limites Atuais:')
    console.table(plans)

    // 2. Ver plano do Igor
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', 'igor@rotabusinessclub.com.br')
        .single()

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    console.log(`\n✅ Plano do Igor: ${sub?.plan_id || 'NÃO ENCONTRADO'}`)

    const planConfig = plans?.find(p => p.plan_id === sub?.plan_id)

    if (!planConfig) {
        console.log('❌ Configuração do plano não encontrada!')
        console.log('\n💡 Criando configuração para plano ELITE...')

        // Verificar se elite existe
        const eliteExists = plans?.some(p => p.plan_id === 'elite' || p.tier === 'elite')

        if (!eliteExists) {
            console.log('⚠️  Plano ELITE não existe em plan_config!')
            console.log('Execute: sql/seeds/CRIAR_PLAN_CONFIG.sql')
        } else {
            console.log('✅ Plano ELITE existe mas sem max_categories')
            console.log('Execute UPDATE para adicionar max_categories')
        }
    } else {
        console.log(`📋 Limite de categorias: ${planConfig.max_categories || 'NÃO DEFINIDO'}`)

        if (!planConfig.max_categories) {
            console.log('\n⚠️  Problema encontrado: max_categories está NULL/undefined')
            console.log('💡 Solução: Adicionar coluna e preencher valor')
        }
    }

    console.log('\n=====================================')
    console.log('💡 Limites recomendados:')
    console.log('   Recruta: 3 categorias')
    console.log('   Veterano: 10 categorias')
    console.log('   Elite: 20 categorias (ou ilimitado)')
    console.log('=====================================\n')
}

checkCategoryLimits()
