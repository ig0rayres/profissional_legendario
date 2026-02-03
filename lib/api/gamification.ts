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

        // 🔥 ANTI-FARMING BI-LATERAL
        // Verificar AMBAS as direções do par de usuários
        // Se A→B já foi pontuado, B→A também não pode pontuar

        const { data: direction1, error: error1 } = await supabase
            .from('points_history')
            .select('id')
            .eq('user_id', userId)
            .eq('action_type', actionType)
            .eq('metadata->>target_user_id', targetUserId)
            .limit(1)

        const { data: direction2, error: error2 } = await supabase
            .from('points_history')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('action_type', actionType)
            .eq('metadata->>target_user_id', userId)
            .limit(1)

        if (error1 || error2) {
            console.error('[Gamification] Erro ao verificar duplicação:', error1 || error2)
            return false // Em caso de erro, permitir (fail-open)
        }

        const alreadyAwarded = (direction1 && direction1.length > 0) || (direction2 && direction2.length > 0)

        if (alreadyAwarded) {
            console.log(`[Gamification] ⚠️ Anti-farming BI-LATERAL: Par ${userId} ↔ ${targetUserId} já foi pontuado em ${actionType}`)
            if (direction1 && direction1.length > 0) {
                console.log(`  → Direção ${userId} → ${targetUserId} já creditada`)
            }
            if (direction2 && direction2.length > 0) {
                console.log(`  → Direção ${targetUserId} → ${userId} já creditada (inversa)`)
            }
        }

        return alreadyAwarded
    } catch (error) {
        console.error('[Gamification] Exceção ao verificar duplicação:', error)
        return false
    }
}

/**
 * Award points to a user for completing an action
 * Uses server-side API to bypass RLS
 */
export async function awardPoints(
    userId: string,
    baseAmount: number,
    actionType: string,
    description?: string,
    metadata?: Record<string, any>,
    skipMultiplier: boolean = false
): Promise<{ success: boolean; xpAwarded: number; error?: string }> {
    try {
        console.log('[Gamification] Calling API to award', baseAmount, 'points to user', userId, 'for', actionType)

        // Chamar API server-side que usa service_role_key
        const response = await fetch('/api/gamification/award-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                points: baseAmount,
                actionType,
                description,
                metadata,
                skipMultiplier
            })
        })

        const result = await response.json()

        if (!result.success) {
            console.error('[Gamification] API error:', result.error)
            return { success: false, xpAwarded: 0, error: result.error }
        }

        console.log('[Gamification] API success:', result)
        return {
            success: true,
            xpAwarded: result.xpAwarded
        }
    } catch (error: any) {
        console.error('[Gamification] Exception calling award API:', error)
        return {
            success: false,
            xpAwarded: 0,
            error: error.message
        }
    }
}

/**
 * Award a medal to a user
 * USA API SERVER-SIDE para garantir que funcione sempre (bypassa RLS)
 * Medalhas são configuradas no painel admin (tabela medals)
 */
export async function awardBadge(
    userId: string,
    medalId: string
): Promise<{ success: boolean; alreadyOwned: boolean; error?: string }> {
    try {
        console.log(`[awardBadge] Chamando API para conceder medalha ${medalId} ao usuário ${userId}`)

        const response = await fetch('/api/gamification/award-medal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, medalId })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[awardBadge] Erro da API:', data.error)
            return { success: false, alreadyOwned: false, error: data.error }
        }

        console.log(`[awardBadge] ✅ Resultado:`, data)
        return {
            success: data.success,
            alreadyOwned: data.alreadyOwned || false,
            error: data.error
        }
    } catch (error: any) {
        console.error('[awardBadge] Exception:', error)
        return { success: false, alreadyOwned: false, error: error.message }
    }
}

/**
 * Grant an ACHIEVEMENT to a user (Server-side API)
 */
export async function awardAchievement(
    userId: string,
    achievementId: string
): Promise<{ success: boolean; alreadyOwned: boolean; error?: string }> {
    try {
        console.log(`[awardAchievement] Granting ${achievementId} to ${userId}`)

        const response = await fetch('/api/gamification/award-achievement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, achievementId })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[awardAchievement] API Error:', data.error)
            return { success: false, alreadyOwned: false, error: data.error }
        }

        return {
            success: data.success,
            alreadyOwned: data.alreadyOwned,
            error: data.error
        }
    } catch (error: any) {
        console.error('[awardAchievement] Exception:', error)
        return { success: false, alreadyOwned: false, error: error.message }
    }
}

/**
 * Get user's gamification stats
 * USA TABELA: user_gamification (fonte centralizada - ÚNICA)
 */
export async function getUserGamificationStats(
    userId: string
): Promise<GamificationStats | null> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            console.error('Error fetching gamification stats:', error)
            return null
        }

        // Mapear campos para interface existente
        return {
            user_id: data.user_id,
            total_xp: data.total_points,
            current_rank_id: data.current_rank_id,
            season_xp: data.monthly_points || 0,
            daily_xp_count: 0,
            last_xp_date: data.last_activity_at,
            updated_at: data.updated_at
        }
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
 * USA TABELA: points_history (histórico centralizado - ÚNICO)
 */
export async function getUserRecentActions(
    userId: string,
    limit: number = 10
): Promise<XPLogEntry[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('points_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching recent actions:', error)
            return []
        }

        // Mapear campos para interface existente
        return (data || []).map(item => ({
            id: item.id,
            user_id: item.user_id,
            amount: item.points,
            base_amount: item.points,
            action_type: item.action_type,
            description: item.description,
            metadata: item.metadata,
            created_at: item.created_at
        }))
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

    // Get medal criteria
    const { data: medal } = await supabase
        .from('medals')
        .select('criteria_type')
        .eq('medal_id', badgeId)
        .single()

    if (!medal) {
        return { shouldAward: false, reason: 'Medal not found' }
    }

    // Check if user already has medal
    const { data: existing } = await supabase
        .from('user_medals')
        .select('medal_id')
        .eq('user_id', userId)
        .eq('medal_id', badgeId)
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
 * USA TABELA: user_gamification (fonte centralizada - ÚNICA)
 */
export async function initializeUserGamification(userId: string): Promise<boolean> {
    try {
        const supabase = createClient()

        const { error } = await supabase
            .from('user_gamification')
            .insert({
                user_id: userId,
                total_points: 0,
                current_rank_id: 'novato',
                monthly_points: 0,
                total_medals: 0,
                streak_days: 0
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
