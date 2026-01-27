import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getMultiplier } from '@/lib/subscription/multipliers'

export const dynamic = 'force-dynamic'

/**
 * API para creditar pontos de forma segura (server-side)
 * Usa service_role_key para bypassar RLS
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, points, actionType, description, metadata } = body

        if (!userId || !points || !actionType) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: userId, points, actionType' },
                { status: 400 }
            )
        }

        // Usar service_role_key para bypassar RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        console.log('[AwardPoints API] Crediting', points, 'to user', userId, 'for', actionType)

        // 1. Buscar plano do usuário para multiplicador
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()

        const planId = subscription?.plan_id || 'recruta'
        const multiplier = getMultiplier(planId)
        const finalAmount = Math.round(points * multiplier)

        console.log('[AwardPoints API] Plan:', planId, 'Multiplier:', multiplier, 'Final:', finalAmount)

        // 2. Buscar ou criar registro de gamification
        let { data: currentStats } = await supabaseAdmin
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .maybeSingle()

        if (!currentStats) {
            console.log('[AwardPoints API] Creating gamification record for user:', userId)
            await supabaseAdmin
                .from('user_gamification')
                .insert({
                    user_id: userId,
                    total_points: 0,
                    current_rank_id: 'novato',
                    last_activity_at: new Date().toISOString()
                })
            currentStats = { total_points: 0 }
        }

        const currentPoints = currentStats?.total_points || 0
        const newPoints = currentPoints + finalAmount

        // 3. Atualizar pontos totais
        const { error: updateError } = await supabaseAdmin
            .from('user_gamification')
            .update({
                total_points: newPoints,
                last_activity_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        if (updateError) {
            console.error('[AwardPoints API] Update error:', updateError)
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            )
        }

        // 4. Registrar no histórico
        const { error: historyError } = await supabaseAdmin
            .from('points_history')
            .insert({
                user_id: userId,
                points: finalAmount,
                action_type: actionType,
                description: description || null,
                metadata: {
                    base_amount: points,
                    multiplier: multiplier,
                    plan_id: planId,
                    previous_total: currentPoints,
                    new_total: newPoints,
                    ...metadata
                }
            })

        if (historyError) {
            console.error('[AwardPoints API] History error:', historyError)
            // Non-critical, continue
        }

        console.log('[AwardPoints API] SUCCESS:', currentPoints, '->', newPoints)

        return NextResponse.json({
            success: true,
            xpAwarded: finalAmount,
            previousTotal: currentPoints,
            newTotal: newPoints,
            multiplier,
            planId
        })

    } catch (error) {
        console.error('[AwardPoints API] Exception:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
