import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMultiplier } from '@/lib/subscription/multipliers'

export const dynamic = 'force-dynamic'

// Usar service role para bypassar RLS
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    })
}

/**
 * API para conceder conquista (achievement) com service role (bypassa RLS)
 * POST /api/gamification/award-achievement
 * Body: { userId, achievementId }
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, achievementId } = await request.json()

        if (!userId || !achievementId) {
            return NextResponse.json(
                { error: 'userId e achievementId são obrigatórios' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdmin()

        // 1. Verificar se já possui a conquista NESTA temporada (se for mensal)
        // Primeiro buscamos a definição da conquista
        const { data: achievement, error: achError } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', achievementId)
            .single()

        if (achError || !achievement) {
            return NextResponse.json({ error: 'Conquista não encontrada' }, { status: 404 })
        }

        // Definir filtro de data se for mensal
        let dateFilter = '1970-01-01' // Sempre
        if (achievement.is_monthly) {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            dateFilter = startOfMonth.toISOString()
        }

        // Verificar se já ganhou
        const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_id', achievementId)
            .gte('earned_at', dateFilter)
            .maybeSingle()

        if (existing) {
            console.log(`[API award-achievement] Usuário ${userId} já possui ${achievementId} neste ciclo`)
            return NextResponse.json({ success: true, alreadyOwned: true })
        }

        // 2. Buscar plano do usuário para multiplicador
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()

        const planId = subscription?.plan_id || 'recruta'
        const multiplier = getMultiplier(planId)
        const basePoints = achievement.points_reward || 0
        const finalPoints = Math.round(basePoints * multiplier)

        // 3. Inserir conquista
        const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
                user_id: userId,
                achievement_id: achievementId,
                earned_at: new Date().toISOString()
            })

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        // 4. Atualizar pontos do usuário
        const { data: gamification } = await supabase
            .from('user_gamification')
            .select('total_points, monthly_vigor')
            .eq('user_id', userId)
            .single()

        const currentPoints = gamification?.total_points || 0
        const currentMonthly = gamification?.monthly_vigor || 0

        await supabase
            .from('user_gamification')
            .update({
                total_points: currentPoints + finalPoints,
                monthly_vigor: currentMonthly + finalPoints,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        // 5. Registrar histórico
        await supabase
            .from('points_history')
            .insert({
                user_id: userId,
                points: finalPoints,
                action_type: 'achievement_reward',
                description: `Conquistou: ${achievement.name} (${multiplier}x)`
            })

        // 6. Notificação
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'achievement_earned',
                title: '🏆 Nova Conquista!',
                body: `Você desbloqueou "${achievement.name}"!\n+${finalPoints} Vigor`,
                priority: 'high',
                metadata: { achievement_id: achievementId, points: finalPoints }
            })

        return NextResponse.json({
            success: true,
            alreadyOwned: false,
            achievement: achievement.name,
            points: finalPoints
        })

    } catch (error: any) {
        console.error('[API award-achievement] Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
