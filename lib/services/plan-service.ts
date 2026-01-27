/**
 * Serviço centralizado para dados de planos
 * 
 * FONTE ÚNICA DE VERDADE: Tabela `plan_config` no Supabase
 * 
 * Uso: Todos os componentes e funções devem buscar dados de planos
 * através deste serviço, NUNCA hardcoded.
 */

import { createClient } from '@/lib/supabase/client'

export interface PlanConfig {
    id: string
    tier: string
    name: string
    price: number
    features: string[]
    xp_multiplier: number
    max_elos: number | null // null = ilimitado
    max_confraternities_month: number | null // null = ilimitado
    can_send_confraternity: boolean
    max_marketplace_ads: number | null // null = ilimitado
    can_send_elo: boolean
    is_active: boolean
    display_order: number
    stripe_product_id?: string | null
    stripe_price_id?: string | null
}

// Cache local para evitar múltiplas requisições
let cachedPlans: PlanConfig[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Busca todos os planos ativos do banco de dados
 * @param forceRefresh - Força busca no banco ignorando cache
 */
export async function getAllPlans(forceRefresh = false): Promise<PlanConfig[]> {
    const now = Date.now()

    // Retorna cache se válido
    if (!forceRefresh && cachedPlans && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedPlans
    }

    const supabase = createClient()

    const { data, error } = await supabase
        .from('plan_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

    if (error) {
        console.error('[PlanService] Erro ao buscar planos:', error)
        // Retorna cache antigo se existir
        return cachedPlans || []
    }

    cachedPlans = data || []
    cacheTimestamp = now

    return cachedPlans
}

/**
 * Busca um plano específico por tier
 * @param tier - ID do plano (recruta, veterano, elite, lendario)
 */
export async function getPlanByTier(tier: string): Promise<PlanConfig | null> {
    const plans = await getAllPlans()
    return plans.find(p => p.tier.toLowerCase() === tier.toLowerCase()) || null
}

/**
 * Retorna o multiplicador XP de um plano
 * @param tier - ID do plano
 * @returns Multiplicador (1 se não encontrado)
 */
export async function getMultiplierByTier(tier: string | null | undefined): Promise<number> {
    if (!tier) return 1
    const plan = await getPlanByTier(tier)
    return plan?.xp_multiplier || 1
}

/**
 * Retorna limite de confrarias por mês
 * @param tier - ID do plano
 * @returns Limite (null = ilimitado, 0 = não pode)
 */
export async function getConfraternityLimit(tier: string | null | undefined): Promise<number | null> {
    if (!tier) return 0
    const plan = await getPlanByTier(tier)
    if (!plan) return 0
    return plan.max_confraternities_month
}

/**
 * Retorna limite de elos
 * @param tier - ID do plano
 * @returns Limite (null = ilimitado)
 */
export async function getElosLimit(tier: string | null | undefined): Promise<number | null> {
    if (!tier) return 10 // Default para não autenticado
    const plan = await getPlanByTier(tier)
    if (!plan) return 10
    return plan.max_elos
}

/**
 * Retorna limite de anúncios no marketplace
 * @param tier - ID do plano
 * @returns Limite (null = ilimitado)
 */
export async function getMarketplaceAdsLimit(tier: string | null | undefined): Promise<number | null> {
    if (!tier) return 0
    const plan = await getPlanByTier(tier)
    if (!plan) return 0
    return plan.max_marketplace_ads
}

/**
 * Verifica se um valor é ilimitado
 * @param value - Valor a verificar
 * @returns true se ilimitado (null ou >= 9999)
 */
export function isUnlimited(value: number | null): boolean {
    return value === null || value >= 9999
}

/**
 * Formata limite para exibição
 * @param value - Valor do limite
 * @returns String formatada
 */
export function formatLimit(value: number | null): string {
    if (isUnlimited(value)) return '∞ Ilimitado'
    return String(value)
}

/**
 * Limpa o cache (útil após alterações no admin)
 */
export function clearPlanCache(): void {
    cachedPlans = null
    cacheTimestamp = 0
}

/**
 * Hook-friendly: Busca multiplicador de forma síncrona do cache
 * ATENÇÃO: Só funciona se getAllPlans já foi chamado antes
 */
export function getMultiplierSync(tier: string | null | undefined): number {
    if (!tier || !cachedPlans) return 1
    const plan = cachedPlans.find(p => p.tier.toLowerCase() === tier.toLowerCase())
    return plan?.xp_multiplier || 1
}

/**
 * Hook-friendly: Busca limite de confrarias de forma síncrona
 */
export function getConfraternityLimitSync(tier: string | null | undefined): number | null {
    if (!tier || !cachedPlans) return 0
    const plan = cachedPlans.find(p => p.tier.toLowerCase() === tier.toLowerCase())
    if (!plan) return 0
    return plan.max_confraternities_month
}
