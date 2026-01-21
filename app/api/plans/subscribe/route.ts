import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { planId } = await request.json()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!planId) {
        return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // 2. Check if plan exists
    const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

    if (planError || !plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // 3. MOCK SUBSCRIPTION LOGIC
    // In a real scenario, we would create a Checkout Session (Stripe) here.
    // For now, we just create/update the subscription directly.

    // Check if user already has a subscription
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    let error
    const now = new Date()
    const nextMonth = new Date(now.setMonth(now.getMonth() + 1))

    if (existingSub) {
        // Update existing
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                plan_id: planId,
                status: 'active',
                current_period_end: nextMonth.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', existingSub.id)
        error = updateError
    } else {
        // Create new
        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_id: planId,
                status: 'active',
                current_period_end: nextMonth.toISOString()
            })
        error = insertError
    }

    if (error) {
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: plan.name })
}
