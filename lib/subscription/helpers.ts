/**
 * Funções utilitárias para gerenciamento de subscriptions/planos
 * 
 * IMPORTANTE: A tabela de subscriptions é 'subscriptions' (não 'user_subscriptions')
 * 
 * Estrutura da tabela:
 * - user_id: UUID (FK para profiles)
 * - plan_id: 'recruta' | 'veterano' | 'elite'
 * - status: 'active' | 'canceled' | etc
 * - started_at, current_period_end, cancel_at, created_at, updated_at
 * 
 * Limites por plano:
 * - Recruta: 0 convites de confraria (só recebe)
 * - Veterano: 4 convites de confraria por mês
 * - Elite: 10 convites de confraria por mês
 */

import { createClient } from '@/lib/supabase/client'

export type PlanId = 'recruta' | 'veterano' | 'elite'

export interface UserSubscription {
    user_id: string
    plan_id: PlanId
    status: string
    started_at: string
    current_period_end: string | null
}

export interface PlanLimits {
    confraternities_per_month: number
    can_send_confraternity: boolean
    can_send_elo: boolean
    xp_multiplier: number // Multiplicador de XP
}

// Limites e benefícios de cada plano - CENTRALIZADOS
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
    recruta: {
        confraternities_per_month: 0,
        can_send_confraternity: false,
        can_send_elo: true,
        xp_multiplier: 1 // XP normal
    },
    veterano: {
        confraternities_per_month: 4,
        can_send_confraternity: true,
        can_send_elo: true,
        xp_multiplier: 1.5 // XP x1.5
    },
    elite: {
        confraternities_per_month: 10,
        can_send_confraternity: true,
        can_send_elo: true,
        xp_multiplier: 3 // XP x3
    }
}

/**
 * Obter multiplicador de XP do plano
 * @param plan ID do plano
 * @returns Multiplicador (1, 2 ou 3)
 */
export function getXpMultiplier(plan: PlanId): number {
    return PLAN_LIMITS[plan]?.xp_multiplier || 1
}

/**
 * Busca o plano ativo do usuário
 * @param userId ID do usuário
 * @returns plan_id do usuário ou 'recruta' como padrão
 */
export async function getUserPlan(userId: string): Promise<PlanId> {
    const supabase = createClient()

    const { data } = await supabase
        .from('subscriptions')  // TABELA CORRETA
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

    return (data?.plan_id as PlanId) || 'recruta'
}

/**
 * Busca os limites do plano do usuário
 * @param userId ID do usuário
 * @returns Limites do plano
 */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
    const plan = await getUserPlan(userId)
    return PLAN_LIMITS[plan]
}

/**
 * Verifica se o usuário pode enviar convite de confraria
 * @param userId ID do usuário
 * @returns true se pode enviar
 */
export async function canSendConfraternity(userId: string): Promise<{ can: boolean, used: number, max: number, plan: PlanId }> {
    const supabase = createClient()
    const plan = await getUserPlan(userId)
    const limits = PLAN_LIMITS[plan]

    if (!limits.can_send_confraternity) {
        return { can: false, used: 0, max: 0, plan }
    }

    // Contar convites enviados este mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
        .from('confraternity_invites')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .gte('created_at', startOfMonth.toISOString())

    const used = count || 0
    const max = limits.confraternities_per_month
    const can = used < max

    return { can, used, max, plan }
}

/**
 * Verifica se dois usuários são Elos (conexão aceita)
 * @param userId1 ID do primeiro usuário
 * @param userId2 ID do segundo usuário
 * @returns true se são elos
 */
export async function areElos(userId1: string, userId2: string): Promise<boolean> {
    const supabase = createClient()

    const { data } = await supabase
        .from('user_connections')
        .select('id')
        .eq('status', 'accepted')
        .or(`and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`)
        .single()

    return !!data
}
