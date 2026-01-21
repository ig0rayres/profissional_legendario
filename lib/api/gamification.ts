import { createClient } from '@/lib/supabase/client'

/**
 * Gamification Service
 * Handles XP, badges, and rank progression
 */

// ID fixo do usuário sistema para mensagens de notificação no chat
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

// Flag para habilitar verificação anti-duplicação de pontos de elo
// Em homologação: false (permite testar várias vezes)
// Em produção: true (cada elo é único por par de usuários)
const ENABLE_ELO_DEDUP = process.env.NEXT_PUBLIC_ENABLE_ELO_DEDUP === 'true'

/**
 * Envia uma mensagem do sistema para o usuário no chat
 * Usa API server-side para bypassar RLS
 */
export async function sendSystemChatMessage(
    userId: string,
    message: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/system-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, message })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[sendSystemChatMessage] Erro da API:', data.error)
            return { success: false, error: data.error }
        }

        console.log('[sendSystemChatMessage] ✅ Mensagem enviada para', userId)
        return { success: true }
    } catch (error: any) {
        console.error('[sendSystemChatMessage] Exception:', error)
        return { success: false, error: error.message }
    }
}

export interface GamificationStats {
    user_id: string
    total_xp: number
    current_rank_id: string
    season_xp: number
    daily_xp_count: number
    last_xp_date: string
    updated_at: string
}

export interface UserBadge {
    user_id: string
    badge_id: string
    earned_at: string
}

export interface XPLogEntry {
    id: string
    user_id: string
    amount: number
    base_amount: number
    action_type: string
    description: string | null
    metadata: Record<string, any> | null
    created_at: string
}

/**
 * Verifica se os pontos de elo já foram creditados para este par de usuários.
 * Isso previne que usuários acumulem pontos desconectando/reconectando.
 * 
 * @param userId - ID do usuário que receberá os pontos
 * @param targetUserId - ID do outro usuário do elo
 * @param actionType - 'elo_sent' ou 'elo_accepted'
 * @returns true se já foi creditado (deve bloquear), false se pode creditar
 */
export async function checkEloPointsAlreadyAwarded(
    userId: string,
    targetUserId: string,
    actionType: 'elo_sent' | 'elo_accepted'
): Promise<boolean> {
    // Se verificação desabilitada (homologação), sempre permitir
    if (!ENABLE_ELO_DEDUP) {
        console.log('[Gamification] Verificação anti-duplicação DESABILITADA (homologação)')
        return false
    }

    try {
        const supabase = createClient()

        // Buscar no histórico se já existe pontos para este par de usuários
        const { data, error } = await supabase
            .from('points_history')
            .select('id')
            .eq('user_id', userId)
            .eq('action_type', actionType)
            .contains('metadata', { target_user_id: targetUserId })
            .limit(1)

        if (error) {
            console.error('[Gamification] Erro ao verificar duplicação:', error)
            return false // Em caso de erro, permitir (fail-open)
        }

        const alreadyAwarded = data && data.length > 0

        if (alreadyAwarded) {
            console.log(`[Gamification] ⚠️ Pontos de ${actionType} já creditados para par ${userId} <-> ${targetUserId}`)
        }

        return alreadyAwarded
    } catch (error) {
        console.error('[Gamification] Exceção ao verificar duplicação:', error)
        return false
    }
}

/**
 * Award points to a user for completing an action
 * Updates user_gamification directly
 */
export async function awardPoints(
    userId: string,
    baseAmount: number,
    actionType: string,
    description?: string,
    metadata?: Record<string, any>
): Promise<{ success: boolean; xpAwarded: number; error?: string }> {
    try {
        const supabase = createClient()

        console.log('[Gamification] Awarding', baseAmount, 'points to user', userId, 'for', actionType)

        // 1. Buscar plano do usuário para aplicar multiplicador
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        // Multiplicadores: Recruta x1, Veterano x1.5, Elite x3
        const planId = subscription?.plan_id || 'recruta'
        const multiplier = planId === 'elite' ? 3 : planId === 'veterano' ? 1.5 : 1
        const finalAmount = Math.round(baseAmount * multiplier) // Arredondar para inteiro

        console.log('[Gamification] Plan:', planId, 'Multiplier:', multiplier, 'Final:', finalAmount)

        // 2. Obter pontos atuais (ou criar registro se não existir)
        let { data: currentStats, error: fetchError } = await supabase
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .maybeSingle()

        // Se não existe registro, criar um novo
        if (!currentStats) {
            console.log('[Gamification] Creating new gamification record for user:', userId)
            const { error: insertError } = await supabase
                .from('user_gamification')
                .insert({
                    user_id: userId,
                    total_points: 0,
                    current_rank_id: 'novato',
                    monthly_vigor: 0,
                    last_activity_at: new Date().toISOString()
                })

            if (insertError) {
                console.error('[Gamification] Error creating gamification record:', insertError)
                return { success: false, xpAwarded: 0, error: insertError.message }
            }
            currentStats = { total_points: 0 }
        }

        if (fetchError) {
            console.error('[Gamification] Error fetching current stats:', fetchError)
            return { success: false, xpAwarded: 0, error: fetchError.message }
        }

        const currentPoints = currentStats?.total_points || 0
        const newPoints = currentPoints + finalAmount

        // 3. Atualizar pontos
        const { error: updateError } = await supabase
            .from('user_gamification')
            .update({
                total_points: newPoints,
                last_activity_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        if (updateError) {
            console.error('[Gamification] Error updating points:', updateError)
            return { success: false, xpAwarded: 0, error: updateError.message }
        }

        console.log('[Gamification] Points updated:', currentPoints, '->', newPoints)

        // 4. Registrar no histórico de pontos
        try {
            await supabase
                .from('points_history')
                .insert({
                    user_id: userId,
                    points: finalAmount,
                    action_type: actionType,
                    description: description || null,
                    metadata: {
                        base_amount: baseAmount,
                        multiplier: multiplier,
                        plan_id: planId,
                        previous_total: currentPoints,
                        new_total: newPoints,
                        ...metadata
                    }
                })
            console.log('[Gamification] Points history recorded')
        } catch (historyError) {
            console.error('[Gamification] Error recording history (non-critical):', historyError)
        }

        // 5. Verificar e atualizar rank se necessário
        try {
            const { data: ranks } = await supabase
                .from('ranks')
                .select('id, points_required')
                .order('points_required', { ascending: false })

            if (ranks) {
                for (const rank of ranks) {
                    if (newPoints >= rank.points_required) {
                        await supabase
                            .from('user_gamification')
                            .update({ current_rank_id: rank.id })
                            .eq('user_id', userId)
                        console.log('[Gamification] Rank updated to:', rank.id)
                        break
                    }
                }
            }
        } catch (rankError) {
            console.error('[Gamification] Error updating rank:', rankError)
        }

        return {
            success: true,
            xpAwarded: finalAmount
        }
    } catch (error: any) {
        console.error('[Gamification] Exception awarding points:', error)
        return {
            success: false,
            xpAwarded: 0,
            error: error.message
        }
    }
}

/**
 * Award a medal to a user
 * Automatically checks if user already has the medal
 * USA TABELA: medals (definida pelo admin) e user_medals (medalhas do usuário)
 */
export async function awardBadge(
    userId: string,
    medalId: string
): Promise<{ success: boolean; alreadyOwned: boolean; error?: string }> {
    try {
        const supabase = createClient()

        // Check if user already has the medal (usa user_medals)
        const { data: existing } = await supabase
            .from('user_medals')
            .select('medal_id')
            .eq('user_id', userId)
            .eq('medal_id', medalId)
            .single()

        if (existing) {
            console.log(`[awardBadge] Usuário ${userId} já possui medalha ${medalId}`)
            return { success: true, alreadyOwned: true }
        }

        // Award the medal (insere em user_medals)
        const { error } = await supabase
            .from('user_medals')
            .insert({
                user_id: userId,
                medal_id: medalId
            })

        if (error) {
            console.error('[awardBadge] Error:', error)
            return { success: false, alreadyOwned: false, error: error.message }
        }

        // Get medal details from medals table (fonte do admin)
        const { data: medal } = await supabase
            .from('medals')
            .select('points_reward, name')
            .eq('id', medalId)
            .single()

        if (medal) {
            // Buscar plano do usuário para calcular multiplicador
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('plan_id')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single()

            // Multiplicadores: Recruta x1, Veterano x1.5, Elite x3
            const planId = subscription?.plan_id || 'recruta'
            const multiplier = planId === 'elite' ? 3 : planId === 'veterano' ? 1.5 : 1
            const basePoints = medal.points_reward || 0
            const finalPoints = Math.round(basePoints * multiplier)

            // Award XP for earning the medal
            await awardPoints(
                userId,
                basePoints,
                'medal_reward',
                `Conquistou medalha: ${medal.name}`
            )

            // Criar notificação para o usuário COM VALOR MULTIPLICADO
            await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'badge_earned',
                    title: '🏅 Nova Medalha!',
                    body: `Você conquistou a medalha "${medal.name}"! +${finalPoints} Vigor`,
                    priority: 'high',
                    metadata: { badge_id: medalId, badge_name: medal.name, xp: finalPoints }
                })

            // Enviar mensagem no chat (conversa com sistema)
            await sendSystemChatMessage(
                userId,
                `🏅 **Nova Medalha Conquistada!**\n\n` +
                `Parabéns, Valente! Você desbloqueou a medalha **"${medal.name}"**!\n\n` +
                `💪 +${finalPoints} Vigor creditados na sua conta.\n\n` +
                `Continue conquistando! 🔥`
            )

            console.log(`✅ [awardBadge] Medalha concedida: ${medal.name} para usuário ${userId} (+${finalPoints} Vigor, ${multiplier}x)`)
        } else {
            console.warn(`⚠️ [awardBadge] Medalha ${medalId} não encontrada na tabela medals`)
        }

        return { success: true, alreadyOwned: false }
    } catch (error: any) {
        console.error('[awardBadge] Exception:', error)
        return { success: false, alreadyOwned: false, error: error.message }
    }
}

/**
 * Get user's gamification stats
 */
export async function getUserGamificationStats(
    userId: string
): Promise<GamificationStats | null> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('gamification_stats')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            console.error('Error fetching gamification stats:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Exception fetching gamification stats:', error)
        return null
    }
}

/**
 * Get user's earned medals
 * USA TABELA: user_medals (fonte centralizada)
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('user_medals')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })

        if (error) {
            console.error('[getUserBadges] Error:', error)
            return []
        }

        // Mapear medal_id para badge_id para compatibilidade
        return (data || []).map(item => ({
            ...item,
            badge_id: item.medal_id // Compatibilidade com código existente
        }))
    } catch (error) {
        console.error('[getUserBadges] Exception:', error)
        return []
    }
}

/**
 * Get user's recent XP activity
 */
export async function getUserRecentActions(
    userId: string,
    limit: number = 10
): Promise<XPLogEntry[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('xp_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching recent actions:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Exception fetching recent actions:', error)
        return []
    }
}

/**
 * Check if user should be awarded a specific badge based on criteria
 */
export async function checkBadgeCriteria(
    userId: string,
    badgeId: string
): Promise<{ shouldAward: boolean; reason?: string }> {
    const supabase = createClient()

    // Get badge criteria
    const { data: badge } = await supabase
        .from('badges')
        .select('criteria_type')
        .eq('id', badgeId)
        .single()

    if (!badge) {
        return { shouldAward: false, reason: 'Badge not found' }
    }

    // Check if user already has badge
    const { data: existing } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single()

    if (existing) {
        return { shouldAward: false, reason: 'Already owned' }
    }

    // Badge-specific criteria checks would go here
    // For now, return true (badges are awarded manually via awardBadge)
    return { shouldAward: true }
}

/**
 * Initialize gamification stats for a new user
 */
export async function initializeUserGamification(userId: string): Promise<boolean> {
    try {
        const supabase = createClient()

        const { error } = await supabase
            .from('gamification_stats')
            .insert({
                user_id: userId,
                total_xp: 0,
                current_rank_id: 'recruta',
                season_xp: 0,
                daily_xp_count: 0
            })

        if (error) {
            console.error('Error initializing gamification:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Exception initializing gamification:', error)
        return false
    }
}
