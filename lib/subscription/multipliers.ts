/**
 * Configuração de multiplicadores de Vigor por plano
 * 
 * PLANOS:
 * - Recruta: 1x (gratuito)
 * - Veterano: 1.5x
 * - Elite: 3x
 * - Lendário: 5x (novo!)
 */

export const PLAN_MULTIPLIERS: Record<string, number> = {
    recruta: 1,
    veterano: 1.5,
    elite: 3,
    lendario: 5, // Novo plano!
}

/**
 * Retorna o multiplicador de vigor baseado no plano
 * @param planId - ID do plano (recruta, veterano, elite, lendario)
 * @returns Multiplicador (1, 1.5, 3 ou 5)
 */
export function getMultiplier(planId: string | null | undefined): number {
    if (!planId) return 1
    return PLAN_MULTIPLIERS[planId.toLowerCase()] || 1
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
 * Lista de todos os planos disponíveis
 * CORES: Conforme Manual da Marca
 */
export const ALL_PLANS = [
    { id: 'recruta', name: 'Recruta', multiplier: 1, color: 'gray' },
    { id: 'veterano', name: 'Veterano', multiplier: 1.5, color: '#214C3B' }, // Verde Trilha
    { id: 'elite', name: 'Elite', multiplier: 3, color: '#CC5500' }, // Laranja Cume
    { id: 'lendario', name: 'Lendário', multiplier: 5, color: '#FFD700' }, // Dourado
]
