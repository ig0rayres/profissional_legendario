import { createClient } from '@/lib/supabase/client'

/**
 * Sistema de Gamificação do Marketplace
 * Gerencia medalhas e proezas relacionadas a vendas
 */

const MARKETPLACE_MEDALS = {
    PRIMEIRA_VENDA: 'primeira_venda_mkt',      // 1 venda
    VENDEDOR_ATIVO: 'vendedor_ativo',          // 5 vendas
    COMERCIANTE: 'comerciante',                // 10 vendas
    MESTRE_MARKETPLACE: 'mestre_marketplace',  // 20 vendas
    PRIMEIRO_SANGUE: 'primeiro_sangue',        // Primeira venda geral
} as const

const MARKETPLACE_PROEZAS = {
    PRIMEIRO_SANGUE_MENSAL: 'primeiro_sangue', // Primeira venda do mês
} as const

/**
 * Verifica se é a primeira venda do mês
 */
async function isFirstSaleOfMonth(userId: string): Promise<boolean> {
    const supabase = createClient()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
        .from('marketplace_ads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'sold')
        .gte('sold_at', startOfMonth.toISOString())

    return count === 1
}

/**
 * Concede medalha ao usuário
 */
async function awardMedal(userId: string, medalId: string): Promise<void> {
    try {
        const response = await fetch('/api/gamification/award-medal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, medalId })
        })

        const result = await response.json()

        if (result.success && !result.alreadyOwned) {
            console.log(`✅ Medalha concedida: ${medalId} (+${result.points} Vigor, ${result.multiplier}x)`)
        }
    } catch (error) {
        console.error(`❌ Erro ao conceder medalha ${medalId}:`, error)
    }
}

/**
 * Concede proeza ao usuário
 */
async function awardProeza(userId: string, proezaId: string): Promise<void> {
    try {
        const response = await fetch('/api/gamification/award-proeza', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, proezaId })
        })

        const result = await response.json()

        if (result.success && !result.alreadyOwned) {
            console.log(`✅ Proeza concedida: ${proezaId} (+${result.points} Vigor, ${result.multiplier}x)`)
        }
    } catch (error) {
        console.error(`❌ Erro ao conceder proeza ${proezaId}:`, error)
    }
}

/**
 * Processa gamificação ao marcar anúncio como vendido
 * 
 * IMPORTANTE: Esta função aplica automaticamente o multiplicador do plano
 * através dos endpoints /api/gamification/award-medal e award-proeza
 */
export async function processMarketplaceSaleGamification(userId: string): Promise<void> {
    const supabase = createClient()

    try {
        // 1. Contar total de vendas do usuário
        const { count: totalSales } = await supabase
            .from('marketplace_ads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'sold')

        console.log(`📊 Usuário ${userId} tem ${totalSales} vendas no marketplace`)

        // 2. Conceder medalhas baseado em milestones
        if (totalSales === 1) {
            await awardMedal(userId, MARKETPLACE_MEDALS.PRIMEIRA_VENDA)
            await awardMedal(userId, MARKETPLACE_MEDALS.PRIMEIRO_SANGUE)
        }

        if (totalSales === 5) {
            await awardMedal(userId, MARKETPLACE_MEDALS.VENDEDOR_ATIVO)
        }

        if (totalSales === 10) {
            await awardMedal(userId, MARKETPLACE_MEDALS.COMERCIANTE)
        }

        if (totalSales === 20) {
            await awardMedal(userId, MARKETPLACE_MEDALS.MESTRE_MARKETPLACE)
        }

        // 3. Verificar proeza mensal (primeira venda do mês)
        const isFirstOfMonth = await isFirstSaleOfMonth(userId)
        if (isFirstOfMonth) {
            await awardProeza(userId, MARKETPLACE_PROEZAS.PRIMEIRO_SANGUE_MENSAL)
        }

        console.log(`✅ Gamificação do marketplace processada para usuário ${userId}`)

    } catch (error) {
        console.error('❌ Erro ao processar gamificação do marketplace:', error)
        throw error
    }
}

/**
 * Verifica quais medalhas o usuário pode conquistar próximo
 */
export async function getNextMarketplaceMilestone(userId: string): Promise<{
    nextMedal: string | null
    salesNeeded: number
    currentSales: number
}> {
    const supabase = createClient()

    const { count: currentSales } = await supabase
        .from('marketplace_ads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'sold')

    const milestones = [
        { sales: 1, medal: 'Primeira Venda MKT' },
        { sales: 5, medal: 'Vendedor Ativo' },
        { sales: 10, medal: 'Comerciante' },
        { sales: 20, medal: 'Mestre do Marketplace' },
    ]

    const nextMilestone = milestones.find(m => (currentSales || 0) < m.sales)

    if (!nextMilestone) {
        return {
            nextMedal: null,
            salesNeeded: 0,
            currentSales: currentSales || 0
        }
    }

    return {
        nextMedal: nextMilestone.medal,
        salesNeeded: nextMilestone.sales - (currentSales || 0),
        currentSales: currentSales || 0
    }
}
