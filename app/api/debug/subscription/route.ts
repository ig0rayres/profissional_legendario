/**
 * DEBUG: Verificar dados brutos de subscription
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Pegar user atual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Query 1: Subscription direto
        const { data: subRaw, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // Query 2: Plan tier direto
        let planTier = null
        if (subRaw) {
            const { data: pt } = await supabase
                .from('plan_tiers')
                .select('*')
                .eq('id', subRaw.plan_id)
                .single()
            planTier = pt
        }

        // Query 3: Com join (jeito que deveria funcionar)
        const { data: subWithJoin } = await supabase
            .from('subscriptions')
            .select('*, plan_tiers(*)')
            .eq('user_id', user.id)
            .single()

        return NextResponse.json({
            userId: user.id,
            email: user.email,
            subscription_raw: subRaw,
            subscription_error: subError?.message,
            plan_tier_manual: planTier,
            subscription_with_join: subWithJoin,
            banco_correto: planTier?.name === 'Elite',
            problema: subWithJoin?.plan_tiers ? 'Join funciona' : 'Join quebrado'
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
