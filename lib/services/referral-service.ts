/**
 * Serviço centralizado para Sistema de Indicação
 * 
 * FONTE ÚNICA DE VERDADE: Tabela `referral_config` no Supabase
 * 
 * Configurações são gerenciadas via painel Admin e
 * propagam automaticamente para toda a plataforma.
 */

import { createClient } from '@/lib/supabase/client'

export interface ReferralConfig {
    id: string
    commission_percentage: number
    commission_type: 'first_payment' | 'recurring' | 'fixed'
    fixed_commission_amount: number | null
    release_days: number
    require_referred_active: boolean
    min_withdrawal_amount: number
    payment_day: number
    is_active: boolean
}

export interface Referral {
    id: string
    referrer_id: string
    referred_id: string
    status: 'pending' | 'active' | 'cancelled'
    referral_code: string | null
    created_at: string
    activated_at: string | null
}

export interface ReferralCommission {
    id: string
    referral_id: string
    referrer_id: string
    referred_id: string
    payment_amount: number
    commission_amount: number
    commission_percentage: number
    status: 'pending' | 'awaiting_verification' | 'available' | 'withdrawn' | 'cancelled'
    payment_date: string
    release_date: string | null
    available_at: string | null
    withdrawn_at: string | null
}

export interface WithdrawalRequest {
    id: string
    user_id: string
    amount: number
    pix_key: string | null
    pix_key_type: 'cpf' | 'email' | 'phone' | 'random' | null
    bank_name: string | null
    status: 'pending' | 'approved' | 'paid' | 'rejected'
    created_at: string
}

export interface UserReferralBalance {
    user_id: string
    available_balance: number
    pending_balance: number
    total_earned: number
    total_withdrawn: number
    total_referrals: number
}

// Cache local
let cachedConfig: ReferralConfig | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Busca configuração do sistema de indicação
 */
export async function getReferralConfig(forceRefresh = false): Promise<ReferralConfig | null> {
    const now = Date.now()

    if (!forceRefresh && cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedConfig
    }

    const supabase = createClient()

    const { data, error } = await supabase
        .from('referral_config')
        .select('*')
        .eq('is_active', true)
        .single()

    if (error) {
        console.error('[ReferralService] Erro ao buscar config:', error)
        return cachedConfig // Retorna cache antigo se existir
    }

    cachedConfig = data
    cacheTimestamp = now

    return cachedConfig
}

/**
 * Limpa cache (chamar após alterações no admin)
 */
export function clearReferralConfigCache(): void {
    cachedConfig = null
    cacheTimestamp = 0
}

/**
 * Gera link de indicação para um usuário
 */
export function generateReferralLink(slug: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rotabusinessclub.com.br'
    return `${baseUrl}/r/${slug}`
}

/**
 * Registra uma nova indicação
 */
export async function registerReferral(
    referrerSlug: string,
    referredUserId: string,
    utmParams?: { source?: string, medium?: string, campaign?: string }
): Promise<{ success: boolean, error?: string }> {
    const supabase = createClient()

    // Buscar referrer pelo slug
    const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', referrerSlug)
        .single()

    if (!referrer) {
        return { success: false, error: 'Código de indicação inválido' }
    }

    // Não pode se auto-indicar
    if (referrer.id === referredUserId) {
        return { success: false, error: 'Você não pode usar seu próprio código' }
    }

    // Verificar se já tem indicador
    const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', referredUserId)
        .maybeSingle()

    if (existing) {
        return { success: false, error: 'Usuário já possui um indicador' }
    }

    // Criar indicação
    const { error } = await supabase
        .from('referrals')
        .insert({
            referrer_id: referrer.id,
            referred_id: referredUserId,
            referral_code: referrerSlug,
            status: 'pending',
            utm_source: utmParams?.source,
            utm_medium: utmParams?.medium,
            utm_campaign: utmParams?.campaign
        })

    if (error) {
        console.error('[ReferralService] Erro ao registrar indicação:', error)
        return { success: false, error: 'Erro ao registrar indicação' }
    }

    return { success: true }
}

/**
 * Registra comissão quando indicado faz pagamento
 */
export async function registerCommission(
    referredUserId: string,
    paymentAmount: number,
    stripePaymentIntentId?: string,
    stripeInvoiceId?: string
): Promise<{ success: boolean, commissionAmount?: number, error?: string }> {
    const supabase = createClient()

    // Buscar indicação
    const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', referredUserId)
        .maybeSingle()

    if (!referral) {
        return { success: false, error: 'Usuário não tem indicador' }
    }

    // Buscar configuração
    const config = await getReferralConfig()
    if (!config || !config.is_active) {
        return { success: false, error: 'Sistema de indicação desativado' }
    }

    // Verificar se já tem comissão (evitar duplicidade)
    if (config.commission_type === 'first_payment') {
        const { data: existingCommission } = await supabase
            .from('referral_commissions')
            .select('id')
            .eq('referred_id', referredUserId)
            .maybeSingle()

        if (existingCommission) {
            return { success: false, error: 'Comissão já registrada para este usuário' }
        }
    }

    // Calcular comissão
    let commissionAmount: number
    if (config.commission_type === 'fixed' && config.fixed_commission_amount) {
        commissionAmount = config.fixed_commission_amount
    } else {
        commissionAmount = paymentAmount * (config.commission_percentage / 100)
    }

    // Data de liberação
    const releaseDate = new Date()
    releaseDate.setDate(releaseDate.getDate() + config.release_days)

    // Registrar comissão
    const { error } = await supabase
        .from('referral_commissions')
        .insert({
            referral_id: referral.id,
            referrer_id: referral.referrer_id,
            referred_id: referredUserId,
            payment_amount: paymentAmount,
            commission_amount: commissionAmount,
            commission_percentage: config.commission_percentage,
            status: 'pending',
            payment_date: new Date().toISOString(),
            release_date: releaseDate.toISOString(),
            stripe_payment_intent_id: stripePaymentIntentId,
            stripe_invoice_id: stripeInvoiceId
        })

    if (error) {
        console.error('[ReferralService] Erro ao registrar comissão:', error)
        return { success: false, error: 'Erro ao registrar comissão' }
    }

    // Ativar indicação se ainda não estava
    if (referral.status === 'pending') {
        await supabase
            .from('referrals')
            .update({ status: 'active', activated_at: new Date().toISOString() })
            .eq('id', referral.id)
    }

    return { success: true, commissionAmount }
}

/**
 * Busca saldo de indicações do usuário
 */
export async function getUserReferralBalance(userId: string): Promise<UserReferralBalance | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('user_referral_balance')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        console.error('[ReferralService] Erro ao buscar saldo:', error)
        return null
    }

    // Se não tem dados, retorna zerado
    if (!data) {
        return {
            user_id: userId,
            available_balance: 0,
            pending_balance: 0,
            total_earned: 0,
            total_withdrawn: 0,
            total_referrals: 0
        }
    }

    return data
}

/**
 * Busca indicações do usuário
 */
export async function getUserReferrals(userId: string): Promise<{
    referral: Referral,
    referred: { full_name: string, avatar_url: string | null },
    commission?: ReferralCommission
}[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('referrals')
        .select(`
            *,
            referred:profiles!referred_id(full_name, avatar_url),
            commissions:referral_commissions(*)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[ReferralService] Erro ao buscar indicações:', error)
        return []
    }

    return (data || []).map(r => ({
        referral: r,
        referred: r.referred,
        commission: r.commissions?.[0]
    }))
}

/**
 * Solicita saque
 */
export async function requestWithdrawal(
    userId: string,
    amount: number,
    pixKey: string,
    pixKeyType: 'cpf' | 'email' | 'phone' | 'random'
): Promise<{ success: boolean, error?: string }> {
    const supabase = createClient()

    // Buscar configuração
    const config = await getReferralConfig()
    if (!config) {
        return { success: false, error: 'Sistema indisponível' }
    }

    // Verificar valor mínimo
    if (amount < config.min_withdrawal_amount) {
        return {
            success: false,
            error: `Valor mínimo para saque: R$ ${config.min_withdrawal_amount.toFixed(2).replace('.', ',')}`
        }
    }

    // Verificar saldo disponível
    const balance = await getUserReferralBalance(userId)
    if (!balance || balance.available_balance < amount) {
        return { success: false, error: 'Saldo disponível insuficiente' }
    }

    // Verificar se tem saque pendente
    const { data: pendingWithdrawal } = await supabase
        .from('withdrawal_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle()

    if (pendingWithdrawal) {
        return { success: false, error: 'Você já possui uma solicitação de saque pendente' }
    }

    // Criar solicitação
    const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
            user_id: userId,
            amount,
            pix_key: pixKey,
            pix_key_type: pixKeyType,
            status: 'pending'
        })

    if (error) {
        console.error('[ReferralService] Erro ao solicitar saque:', error)
        return { success: false, error: 'Erro ao solicitar saque' }
    }

    return { success: true }
}

/**
 * Verifica se pode sacar (usado no frontend)
 */
export async function canRequestWithdrawal(userId: string): Promise<{
    canWithdraw: boolean
    availableBalance: number
    minAmount: number
    hasPendingRequest: boolean
}> {
    const [config, balance] = await Promise.all([
        getReferralConfig(),
        getUserReferralBalance(userId)
    ])

    const supabase = createClient()
    const { data: pendingWithdrawal } = await supabase
        .from('withdrawal_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle()

    const minAmount = config?.min_withdrawal_amount || 250
    const availableBalance = balance?.available_balance || 0
    const hasPendingRequest = !!pendingWithdrawal

    return {
        canWithdraw: availableBalance >= minAmount && !hasPendingRequest,
        availableBalance,
        minAmount,
        hasPendingRequest
    }
}
