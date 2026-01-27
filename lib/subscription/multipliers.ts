/**
 * Configuração de multiplicadores de Vigor por plano
 * 
 * ⚠️ ATENÇÃO: Este arquivo fornece funções helper, mas a FONTE DA VERDADE
 * é a tabela `plan_config` no Supabase.
 * 
 * Para dados dinâmicos, use: @/lib/services/plan-service
 */

import { getMultiplierSync, getMultiplierByTier, getAllPlans } from '@/lib/services/plan-service'

// Re-exporta funções do plan-service para compatibilidade
export { getMultiplierByTier as getMultiplierAsync }
export { getAllPlans }

/**
 * @deprecated Use getMultiplierByTier do plan-service para dados atualizados
 * Retorna o multiplicador de vigor baseado no plano (versão síncrona com cache)
 */
export function getMultiplier(planId: string | null | undefined): number {
    // Usa cache do plan-service se disponível
    return getMultiplierSync(planId)
}

/**
 * Retorna o nome do plano formatado
 * @param planId - ID do plano
 * @returns Nome capitalizado do plano
 */
export function getPlanName(planId: string | null | undefined): string {
    if (!planId) return 'Recruta'

    const names: Record<string, string> = {
        recruta: 'Recruta',
        veterano: 'Veterano',
        elite: 'Elite',
        lendario: 'Lendário',
    }

    return names[planId.toLowerCase()] || 'Recruta'
}

/**
 * @deprecated Use getAllPlans() do plan-service para dados atualizados do banco
 * Lista de planos (fallback estático - preferir dados do banco)
 */
export const ALL_PLANS = [
    { id: 'recruta', name: 'Recruta', multiplier: 1, color: 'gray' },
    { id: 'veterano', name: 'Veterano', multiplier: 1.5, color: '#214C3B' },
    { id: 'elite', name: 'Elite', multiplier: 3, color: '#CC5500' },
    { id: 'lendario', name: 'Lendário', multiplier: 5, color: '#FFD700' },
]

// Fallback hardcoded - usado apenas se banco não disponível
export const PLAN_MULTIPLIERS: Record<string, number> = {
    recruta: 1,
    veterano: 1.5,
    elite: 3,
    lendario: 5,
}
