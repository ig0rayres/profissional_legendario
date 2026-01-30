/**
 * Marketplace - Tipos e Utilitários
 * 
 * Estrutura do banco:
 * - marketplace_categories: Categorias (veículos, imóveis, etc) com duração padrão
 * - marketplace_ad_tiers: Modalidades (básico, elite, lendário) com preços e features
 * - marketplace_ads: Anúncios em si
 */

// ============================================
// TIPOS
// ============================================

export interface MarketplaceCategory {
    id: string
    name: string
    slug: string
    icon: string
    description: string | null
    duration_days: number
    is_active: boolean
    display_order: number
    requires_tier?: boolean
    max_photos?: number // Limite de fotos para categorias sem modalidade
}


export interface MarketplaceAdTier {
    id: string
    category_id: string
    name: string
    tier_level: 'basico' | 'elite' | 'lendario'
    price: number
    duration_days: number
    max_photos: number
    highlight_color: string | null
    highlight_badge: string | null
    position_boost: number
    features: string[]
    stripe_product_id: string | null
    stripe_price_id: string | null
    is_active: boolean
}

export interface MarketplaceAd {
    id: string
    user_id: string
    category_id: string
    ad_tier_id: string | null

    // Dados do anúncio
    title: string
    description: string | null
    price: number
    condition: 'new' | 'used_like_new' | 'used_good' | 'used_fair' | null
    location: string | null
    images: string[]

    // Detalhes específicos
    vehicle_details: VehicleDetails | null
    property_details: PropertyDetails | null

    // Status
    status: 'draft' | 'pending_payment' | 'active' | 'expired' | 'sold' | 'deleted'
    payment_status: 'pending' | 'paid' | 'free'
    expires_at: string | null
    published_at: string | null

    // Venda
    sold_at: string | null
    sold_price: number | null

    // Contadores
    views_count: number
    contacts_count: number

    // Datas
    created_at: string
    updated_at: string

    // Relacionamentos (quando usando select com join)
    category?: MarketplaceCategory
    ad_tier?: MarketplaceAdTier
    user?: {
        id: string
        full_name: string
        avatar_url: string | null
        pista: string | null
    }
}

export interface VehicleDetails {
    year: number
    make: string
    model: string
    km: number
    color: string
    plate_final?: string
    fuel?: string
    transmission?: string
}

export interface PropertyDetails {
    type: 'venda' | 'locacao'
    area: number
    bedrooms?: number
    bathrooms?: number
    garage?: number
    features?: string[]
}

// ============================================
// CONSTANTES
// ============================================

export const AD_CONDITIONS = [
    { value: 'new', label: 'Novo', description: 'Nunca usado' },
    { value: 'used_like_new', label: 'Seminovo', description: 'Usado, como novo' },
    { value: 'used_good', label: 'Usado - Bom', description: 'Sinais normais de uso' },
    { value: 'used_fair', label: 'Usado - Aceitável', description: 'Com desgaste visível' }
] as const

export const AD_STATUS_LABELS: Record<string, { label: string, color: string }> = {
    draft: { label: 'Rascunho', color: 'gray' },
    pending_payment: { label: 'Aguardando Pagamento', color: 'yellow' },
    active: { label: 'Ativo', color: 'green' },
    expired: { label: 'Expirado', color: 'red' },
    sold: { label: 'Vendido', color: 'blue' },
    deleted: { label: 'Removido', color: 'gray' }
}

export const TIER_LEVEL_LABELS: Record<string, { label: string, color: string }> = {
    basico: { label: 'Básico', color: 'gray' },
    elite: { label: 'Elite', color: 'green' },
    lendario: { label: 'Lendário', color: 'amber' }
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Calcula a data de expiração baseado na duração do tier ou categoria
 */
export function calculateExpirationDate(durationDays: number): Date {
    const expiration = new Date()
    expiration.setDate(expiration.getDate() + durationDays)
    return expiration
}

/**
 * Formata dias restantes do anúncio
 */
export function formatDaysRemaining(expiresAt: string | null): string {
    if (!expiresAt) return 'Sem expiração'

    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Expirado'
    if (diffDays === 0) return 'Expira hoje'
    if (diffDays === 1) return 'Expira amanhã'
    return `${diffDays} dias restantes`
}

/**
 * Verifica se usuário pode criar mais anúncios baseado no plano
 */
export function canCreateAd(
    currentAdsCount: number,
    maxAds: number | null
): { allowed: boolean, message: string } {
    // null = ilimitado (plano lendário)
    if (maxAds === null) {
        return { allowed: true, message: 'Anúncios ilimitados' }
    }

    if (maxAds === 0) {
        return { allowed: false, message: 'Seu plano não permite anúncios no Marketplace' }
    }

    if (currentAdsCount >= maxAds) {
        return {
            allowed: false,
            message: `Limite de ${maxAds} anúncios atingido. Faça upgrade do plano para mais.`
        }
    }

    return {
        allowed: true,
        message: `${currentAdsCount}/${maxAds} anúncios utilizados`
    }
}
