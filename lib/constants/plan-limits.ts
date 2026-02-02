/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║   FONTE ÚNICA DE VERDADE - LIMITES DE PLANOS                  ║
 * ║                                                               ║
 * ║   NUNCA mais buscar plan_config/plan_tiers!                   ║
 * ║   SEMPRE importar deste arquivo!                              ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

export type PlanTier = 'recruta' | 'soldado' | 'especialista' | 'elite'

export interface PlanLimits {
    // Categorias de Serviço
    max_categories: number

    // Marketplace
    max_marketplace_ads: number

    // Confraternities
    confraternities_per_month: number

    // Elos/Conexões
    can_send_elo: boolean
    max_elos: number

    // Gamificação
    xp_multiplier: number

    // Pricing
    price_monthly: number
    price_annually: number
}

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║   DEFINIÇÃO DOS LIMITES - ÚLTIMA ATUALIZAÇÃO: 02/02/2026      ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    recruta: {
        max_categories: 1,
        max_marketplace_ads: 0,
        confraternities_per_month: 1,
        can_send_elo: false,
        max_elos: 10,
        xp_multiplier: 1.0,
        price_monthly: 0,
        price_annually: 0
    },

    soldado: {
        max_categories: 3,
        max_marketplace_ads: 1,
        confraternities_per_month: 2,
        can_send_elo: true,
        max_elos: 50,
        xp_multiplier: 1.0,
        price_monthly: 97,
        price_annually: 970
    },

    especialista: {
        max_categories: 5,
        max_marketplace_ads: 2,
        confraternities_per_month: 3,
        can_send_elo: true,
        max_elos: 100,
        xp_multiplier: 1.5,
        price_monthly: 147,
        price_annually: 1470
    },

    elite: {
        max_categories: 10,
        max_marketplace_ads: 3,
        confraternities_per_month: 999, // Ilimitado
        can_send_elo: true,
        max_elos: 999, // Ilimitado
        xp_multiplier: 2.0,
        price_monthly: 197,
        price_annually: 1970
    }
}

/**
 * Obter limites de um plano específico
 */
export function getPlanLimits(planTier: string | null | undefined): PlanLimits {
    const tier = (planTier?.toLowerCase() || 'recruta') as PlanTier
    return PLAN_LIMITS[tier] || PLAN_LIMITS.recruta
}

/**
 * Validar se pode adicionar categorias
 */
export function canAddCategories(
    currentCount: number,
    planTier: string | null | undefined
): { allowed: boolean; limit: number; remaining: number } {
    const limits = getPlanLimits(planTier)
    const remaining = limits.max_categories - currentCount

    return {
        allowed: remaining > 0,
        limit: limits.max_categories,
        remaining: Math.max(0, remaining)
    }
}

/**
 * Validar se pode criar anúncio
 */
export function canCreateMarketplaceAd(
    currentCount: number,
    planTier: string | null | undefined
): { allowed: boolean; limit: number; remaining: number } {
    const limits = getPlanLimits(planTier)
    const remaining = limits.max_marketplace_ads - currentCount

    return {
        allowed: remaining > 0,
        limit: limits.max_marketplace_ads,
        remaining: Math.max(0, remaining)
    }
}

/**
 * Validar se pode criar confraternidade
 */
export function canCreateConfraternity(
    currentCount: number,
    planTier: string | null | undefined
): { allowed: boolean; limit: number; remaining: number } {
    const limits = getPlanLimits(planTier)
    const remaining = limits.confraternities_per_month - currentCount

    return {
        allowed: remaining > 0,
        limit: limits.confraternities_per_month,
        remaining: Math.max(0, remaining)
    }
}
