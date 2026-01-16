// ============================================
// FINANCIAL API - Utility Functions
// Funções auxiliares para gestão financeira
// ============================================

import { createClient } from '@/lib/supabase/client'

// ====================================
// TYPES
// ====================================

export interface SubscriptionStats {
    totalActive: number
    byPlan: {
        recruta: number
        veterano: number
        elite: number
    }
    mrr: number
}

export interface TransactionData {
    id: string
    user_id: string
    amount: number
    plan_tier: 'recruta' | 'veterano' | 'elite'
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    payment_method?: string
    notes?: string
    created_at: string
    processed_at?: string
}

export interface CouponData {
    id: string
    code: string
    name: string
    description?: string
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    applicable_plans?: string[]
    min_purchase_amount?: number
    max_discount_amount?: number
    usage_limit?: number
    usage_limit_per_user: number
    current_usage_count: number
    valid_from?: string
    valid_until?: string
    is_active: boolean
    created_at: string
}

export interface CampaignData {
    id: string
    name: string
    description?: string
    campaign_type: 'seasonal' | 'launch' | 'retention' | 'win_back'
    discount_type?: 'percentage' | 'fixed_amount' | 'trial_period'
    discount_value?: number
    trial_days?: number
    target_audience: string[]
    target_plans: string[]
    auto_apply: boolean
    goal_conversions?: number
    current_conversions: number
    total_revenue_generated: number
    start_date: string
    end_date: string
    is_active: boolean
}

// ====================================
// MÉTRICAS FINANCEIRAS
// ====================================

/**
 * Calcula MRR (Monthly Recurring Revenue)
 */
export async function calculateMRR(): Promise<number> {
    const supabase = createClient()

    // Contar usuários ativos por plano
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('subscription_status', 'active')

    if (error || !profiles) {
        console.error('Error calculating MRR:', error)
        return 0
    }

    // Preços por plano
    const prices = {
        recruta: 0,
        veterano: 47,
        elite: 147
    }

    const mrr = profiles.reduce((total, profile) => {
        const tier = profile.subscription_tier as keyof typeof prices
        return total + (prices[tier] || 0)
    }, 0)

    return mrr
}

/**
 * Obtém estatísticas de assinaturas
 */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
    const supabase = createClient()

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('subscription_status', 'active')

    if (error || !profiles) {
        return {
            totalActive: 0,
            byPlan: { recruta: 0, veterano: 0, elite: 0 },
            mrr: 0
        }
    }

    const byPlan = profiles.reduce((acc, profile) => {
        const tier = profile.subscription_tier || 'recruta'
        acc[tier as keyof typeof acc] = (acc[tier as keyof typeof acc] || 0) + 1
        return acc
    }, { recruta: 0, veterano: 0, elite: 0 })

    const mrr = await calculateMRR()

    return {
        totalActive: profiles.length,
        byPlan,
        mrr
    }
}

/**
 * Calcula taxa de conversão entre planos
 */
export async function getConversionRate(fromTier: string, toTier: string): Promise<number> {
    const supabase = createClient()

    const { count: totalFrom } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', fromTier)

    const { count: conversions } = await supabase
        .from('subscription_history')
        .select('*', { count: 'exact', head: true })
        .eq('from_tier', fromTier)
        .eq('to_tier', toTier)

    if (!totalFrom || totalFrom === 0) return 0

    return ((conversions || 0) / totalFrom) * 100
}

/**
 * Calcula taxa de churn (cancelamento)
 */
export async function getChurnRate(period: 'month' | 'quarter' | 'year' = 'month'): Promise<number> {
    const supabase = createClient()

    // Calcular data de início baseado no período
    const now = new Date()
    const startDate = new Date()

    switch (period) {
        case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
    }

    const { count: cancelations } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'cancelled')
        .gte('updated_at', startDate.toISOString())

    const { count: totalActive } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')

    if (!totalActive || totalActive === 0) return 0

    return ((cancelations || 0) / totalActive) * 100
}

/**
 * Obtém distribuição de usuários por plano
 */
export async function getPlanDistribution() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')

    if (error || !data) {
        return { recruta: 0, veterano: 0, elite: 0 }
    }

    return data.reduce((acc, profile) => {
        const tier = profile.subscription_tier || 'recruta'
        acc[tier as keyof typeof acc] = (acc[tier as keyof typeof acc] || 0) + 1
        return acc
    }, { recruta: 0, veterano: 0, elite: 0 })
}

/**
 * Formata valor em moeda brasileira
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

// ====================================
// CUPONS E DESCONTOS
// ====================================

/**
 * Valida código de cupom
 */
export async function validateCouponCode(
    code: string,
    userId: string,
    planTier: string,
    amount: number
): Promise<{ valid: boolean; discount?: number; error?: string; couponId?: string }> {
    const supabase = createClient()

    const { data, error } = await supabase
        .rpc('validate_coupon', {
            p_code: code,
            p_user_id: userId,
            p_plan_tier: planTier,
            p_amount: amount
        })

    if (error) {
        return { valid: false, error: 'Erro ao validar cupom' }
    }

    return data || { valid: false, error: 'Cupom inválido' }
}

/**
 * Calcula desconto aplicado
 */
export function calculateDiscount(
    coupon: CouponData,
    baseAmount: number
): number {
    if (coupon.discount_type === 'percentage') {
        let discount = baseAmount * (coupon.discount_value / 100)

        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
            discount = coupon.max_discount_amount
        }

        return Math.round(discount * 100) / 100
    } else {
        return Math.min(coupon.discount_value, baseAmount)
    }
}

/**
 * Obtém estatísticas de uso de cupom
 */
export async function getCouponStats(couponId: string) {
    const supabase = createClient()

    const { data: usage, error } = await supabase
        .from('coupon_usage')
        .select('discount_applied')
        .eq('coupon_id', couponId)

    if (error || !usage) {
        return {
            totalUses: 0,
            totalDiscountGiven: 0,
            averageDiscount: 0
        }
    }

    const totalDiscountGiven = usage.reduce((sum, u) => sum + u.discount_applied, 0)

    return {
        totalUses: usage.length,
        totalDiscountGiven,
        averageDiscount: usage.length > 0 ? totalDiscountGiven / usage.length : 0
    }
}

/**
 * Gera código de cupom aleatório
 */
export function generateCouponCode(prefix: string = '', length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = prefix.toUpperCase()

    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return code
}

/**
 * Verifica se cupom está expirado
 */
export function checkCouponExpiry(coupon: CouponData): boolean {
    if (!coupon.valid_until) return false

    return new Date(coupon.valid_until) < new Date()
}

// ====================================
// CAMPANHAS PROMOCIONAIS
// ====================================

/**
 * Obtém performance de campanha
 */
export async function getCampaignPerformance(campaignId: string) {
    const supabase = createClient()

    const { data: campaign } = await supabase
        .from('promotional_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

    if (!campaign) return null

    const { data: participants } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)

    const converted = participants?.filter(p => p.converted).length || 0
    const conversionRate = participants && participants.length > 0
        ? (converted / participants.length) * 100
        : 0

    const roi = campaign.total_revenue_generated > 0
        ? ((campaign.total_revenue_generated / 100) * 100) // Simplificado - ajustar conforme custo real
        : 0

    return {
        ...campaign,
        totalParticipants: participants?.length || 0,
        conversionRate,
        roi,
        progressPercentage: campaign.goal_conversions
            ? (campaign.current_conversions / campaign.goal_conversions) * 100
            : 0
    }
}

/**
 * Inscreve usuário em campanha
 */
export async function enrollUserInCampaign(userId: string, campaignId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
        .from('campaign_participants')
        .insert({
            campaign_id: campaignId,
            user_id: userId
        })

    return !error
}

/**
 * Registra conversão de campanha
 */
export async function trackCampaignConversion(
    userId: string,
    campaignId: string,
    revenue: number
): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
        .from('campaign_participants')
        .update({
            converted: true,
            converted_at: new Date().toISOString(),
            revenue_generated: revenue
        })
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)

    return !error
}

/**
 * Obtém campanhas elegíveis para usuário
 */
export async function getEligibleCampaigns(userId: string): Promise<CampaignData[]> {
    const supabase = createClient()

    // Obter perfil do usuário
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, created_at')
        .eq('id', userId)
        .single()

    if (!profile) return []

    // Buscar campanhas ativas
    const now = new Date().toISOString()
    const { data: campaigns } = await supabase
        .from('promotional_campaigns')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)

    if (!campaigns) return []

    // Filtrar por elegibilidade
    return campaigns.filter(campaign => {
        // Verificar se já está inscrito
        // (seria necessário uma query adicional - simplificado aqui)

        // Verificar público-alvo
        if (campaign.target_audience.includes('new_users')) {
            const accountAge = Date.now() - new Date(profile.created_at).getTime()
            const daysOld = accountAge / (1000 * 60 * 60 * 24)
            if (daysOld > 30) return false
        }

        // Verificar plano específico
        if (campaign.target_plans.length > 0) {
            if (!campaign.target_plans.includes(profile.subscription_tier)) {
                return false
            }
        }

        return true
    })
}

/**
 * Calcula ROI de campanha
 */
export function calculateCampaignROI(
    totalRevenue: number,
    estimatedCost: number
): number {
    if (estimatedCost === 0) return 0

    return ((totalRevenue - estimatedCost) / estimatedCost) * 100
}
