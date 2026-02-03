import { createClient } from '@/lib/supabase/client'

async function checkReferralsData() {
    const supabase = createClient()

    console.log('=== VERIFICANDO DADOS DE INDICAÇÕES ===\n')

    // 1. TODAS as indicações
    const { data: allReferrals, error: refError } = await supabase
        .from('referrals')
        .select(`
            *,
            referrer:referrer_id(full_name),
            referred:referred_id(full_name)
        `)
        .order('created_at', { ascending: false })

    console.log('📊 TOTAL DE INDICAÇÕES:', allReferrals?.length || 0)
    if (refError) console.error('❌ Erro ao buscar indicações:', refError)

    allReferrals?.forEach((ref, i) => {
        console.log(`\n${i + 1}. Indicação ID: ${ref.id}`)
        console.log(`   Data: ${new Date(ref.created_at).toLocaleDateString('pt-BR')}`)
        console.log(`   Indicador: ${ref.referrer?.full_name || 'N/A'}`)
        console.log(`   Indicado: ${ref.referred?.full_name || 'N/A'}`)
    })

    // 2. TODAS as comissões
    const { data: allCommissions, error: commError } = await supabase
        .from('referral_commissions')
        .select('*')
        .order('created_at', { ascending: false })

    console.log('\n\n💰 TOTAL DE COMISSÕES:', allCommissions?.length || 0)
    if (commError) console.error('❌ Erro ao buscar comissões:', commError)

    allCommissions?.forEach((comm, i) => {
        console.log(`\n${i + 1}. Comissão ID: ${comm.id}`)
        console.log(`   Referral ID: ${comm.referral_id}`)
        console.log(`   Valor: R$ ${comm.payment_amount}`)
        console.log(`   Comissão: R$ ${comm.commission_amount}`)
        console.log(`   Status: ${comm.status}`)
    })

    // 3. TODAS as subscriptions ativas
    const { data: activeSubs, error: subError } = await supabase
        .from('subscriptions')
        .select(`
            *,
            user:user_id(full_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    console.log('\n\n📋 SUBSCRIPTIONS ATIVAS:', activeSubs?.length || 0)
    if (subError) console.error('❌ Erro ao buscar subscriptions:', subError)

    activeSubs?.forEach((sub, i) => {
        console.log(`\n${i + 1}. User: ${sub.user?.full_name}`)
        console.log(`   Plano: ${sub.plan_id}`)
        console.log(`   Data: ${new Date(sub.created_at).toLocaleDateString('pt-BR')}`)
    })
}

checkReferralsData()
