import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMultiplier } from '@/lib/subscription/multipliers'

export const dynamic = 'force-dynamic'

/**
 * API centralizada para creditar pontos do Rota Valente
 * 
 * Busca configuração do banco (point_actions)
 * Aplica multiplicador do plano
 * Verifica limite diário
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, actionId, metadata } = body

        if (!userId || !actionId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: userId, actionId' },
                { status: 400 }
            )
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        const today = new Date().toISOString().split('T')[0]

        console.log(`[RotaValente API] Award: ${actionId} para ${userId}`)

        // 1. Buscar configuração da ação no banco
        const { data: action, error: actionError } = await supabaseAdmin
            .from('point_actions')
            .select('*')
            .eq('id', actionId)
            .eq('is_active', true)
            .maybeSingle()

        if (actionError || !action) {
            console.log(`[RotaValente API] Ação não encontrada: ${actionId}`)
            return NextResponse.json({
                success: false,
                error: 'Ação não configurada ou inativa',
                points: 0
            })
        }

        // 2. Verificar limite diário
        if (action.max_per_day) {
            const { count } = await supabaseAdmin
                .from('points_history')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('action_type', actionId)
                .gte('created_at', `${today}T00:00:00`)

            if (count && count >= action.max_per_day) {
                console.log(`[RotaValente API] Limite diário atingido: ${actionId} (${count}/${action.max_per_day})`)
                return NextResponse.json({
                    success: true,
                    points: 0,
                    limitReached: true,
                    message: `Limite diário atingido (${action.max_per_day}/dia)`
                })
            }
        }

        // 3. Buscar multiplicador do plano
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()

        const planId = subscription?.plan_id || 'recruta'
        const multiplier = getMultiplier(planId)
        const basePoints = action.points_base
        const finalPoints = Math.round(basePoints * multiplier)

        // 4. Buscar pontos atuais
        let { data: currentStats } = await supabaseAdmin
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .maybeSingle()

        if (!currentStats) {
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
        const newPoints = currentPoints + finalPoints

        // 5. Atualizar pontos
        await supabaseAdmin
            .from('user_gamification')
            .update({
                total_points: newPoints,
                last_activity_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        // 6. Registrar histórico
        await supabaseAdmin
            .from('points_history')
            .insert({
                user_id: userId,
                points: finalPoints,
                action_type: actionId,
                description: action.description,
                metadata: {
                    base_points: basePoints,
                    multiplier: multiplier,
                    plan_id: planId,
                    previous_total: currentPoints,
                    new_total: newPoints,
                    ...(metadata || {})
                }
            })

        console.log(`[RotaValente API] ✅ ${actionId}: +${finalPoints} pts (${basePoints} x ${multiplier})`)

        return NextResponse.json({
            success: true,
            points: finalPoints,
            basePoints,
            multiplier,
            planId,
            newTotal: newPoints
        })

    } catch (error) {
        console.error('[RotaValente API] Exception:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
