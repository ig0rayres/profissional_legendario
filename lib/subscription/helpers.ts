/**
 * Funções utilitárias para gerenciamento de subscriptions/planos
 * 
 * IMPORTANTE: A tabela de subscriptions é 'subscriptions' (não 'user_subscriptions')
 * 
 * Estrutura da tabela:
 * - user_id: UUID (FK para profiles)
 * - plan_id: 'recruta' | 'veterano' | 'elite' | 'lendario'
 * - status: 'active' | 'canceled' | etc
 * - started_at, current_period_end, cancel_at, created_at, updated_at
 * 
 * FONTE DE VERDADE: plan_config (painel admin)
 */

import { createClient } from '@/lib/supabase/client'

export type PlanId = 'recruta' | 'veterano' | 'elite' | 'lendario'

export interface UserSubscription {
    user_id: string
    plan_id: PlanId
    status: string
    started_at: string
    current_period_end: string | null
}

export interface PlanLimits {
    confraternities_per_month: number
    can_send_elo: boolean
    xp_multiplier: number
    max_elos: number | null
    max_marketplace_ads: number
    max_categories: number
}

/**
 * Busca os limites do plano do usuário
 * @param userId ID do usuário
 * @returns Limites do plano
 */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
    const supabase = createClient()

    // Buscar subscription ativa
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

    const planTier = subscription?.plan_id || 'recruta'

    // FONTE ÚNICA DE VERDADE - plan_config (painel admin)
    const { data: planConfig } = await supabase
        .from('plan_config')
        .select('*')
        .eq('tier', planTier)
        .single()

    if (!planConfig) {
        // Fallback para recruta
        return {
            max_categories: 2,
            max_marketplace_ads: 0,
            max_elos: 10,
            confraternities_per_month: 0,
            can_send_elo: false,
            xp_multiplier: 1.0
        }
    }

    // -1 = ilimitado
    const limits: PlanLimits = {
        max_categories: planConfig.max_categories === -1 ? 999 : planConfig.max_categories,
        max_marketplace_ads: planConfig.max_marketplace_ads === -1 ? 999 : planConfig.max_marketplace_ads,
        max_elos: planConfig.max_elos === -1 ? 999 : planConfig.max_elos,
        confraternities_per_month: planConfig.max_confraternities_month === -1 ? 999 : planConfig.max_confraternities_month,
        can_send_elo: planConfig.can_send_elo,
        xp_multiplier: Number(planConfig.xp_multiplier)
    }

    console.log(`[getUserPlanLimits] User ${userId} | Plan: ${planTier} | Categories: ${limits.max_categories}`)

    return limits
}

/**
 * Obter multiplicador de XP do plano
 * @param plan ID do plano
 * @returns Multiplicador
 */
export async function getXpMultiplier(userId: string): Promise<number> {
    const limits = await getUserPlanLimits(userId)
    return limits.xp_multiplier || 1
}

/**
 * Busca o plano ativo do usuário
 * @param userId ID do usuário
 * @returns plan_id do usuário ou 'recruta' como padrão
 */
export async function getUserPlan(userId: string): Promise<PlanId> {
    const supabase = createClient()

    const { data } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

    return (data?.plan_id as PlanId) || 'recruta'
}

/**
 * Verifica se o usuário pode enviar convite de confraria
 * LÓGICA: max_confraternities_month > 0 ou -1 = pode enviar
 * @param userId ID do usuário
 * @returns true se pode enviar
 */
export async function canSendConfraternity(userId: string): Promise<{ can: boolean, used: number, max: number, plan: PlanId }> {
    const supabase = createClient()
    const plan = await getUserPlan(userId)
    const limits = await getUserPlanLimits(userId)

    const maxConfraternities = limits.confraternities_per_month

    // Se for 0, não pode enviar
    if (maxConfraternities === 0) {
        return { can: false, used: 0, max: 0, plan }
    }

    // Se for -1, é ilimitado
    if (maxConfraternities === -1) {
        return { can: true, used: 0, max: -1, plan }
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
    const can = used < maxConfraternities

    return { can, used, max: maxConfraternities, plan }
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
