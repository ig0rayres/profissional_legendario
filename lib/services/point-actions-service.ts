/**
 * Serviço de Ações de Pontos
 * Busca pontos configuráveis do banco (tabela point_actions)
 */

import { createClient } from '@/lib/supabase/client'

// Cache em memória para evitar múltiplas chamadas ao banco
let pointActionsCache: Map<string, number> | null = null
let cacheExpiry = 0

/**
 * Carrega todas as ações de pontos do banco
 */
export async function loadPointActions(): Promise<Map<string, number>> {
    // Retorna cache se ainda válido (5 minutos)
    if (pointActionsCache && Date.now() < cacheExpiry) {
        return pointActionsCache
    }

    const supabase = createClient()
    const { data, error } = await supabase
        .from('point_actions')
        .select('id, points_base')
        .eq('is_active', true)

    if (error) {
        console.error('[PointActions] Erro ao carregar:', error)
        return getDefaultPoints()
    }

    pointActionsCache = new Map()
    data?.forEach(action => {
        pointActionsCache!.set(action.id, action.points_base)
    })

    cacheExpiry = Date.now() + 5 * 60 * 1000 // 5 minutos
    console.log('[PointActions] Cache atualizado com', pointActionsCache.size, 'ações')

    return pointActionsCache
}

/**
 * Busca pontos de uma ação específica
 */
export async function getActionPoints(actionId: string): Promise<number> {
    const actions = await loadPointActions()
    return actions.get(actionId) || getDefaultPoints().get(actionId) || 0
}

/**
 * Busca múltiplas ações de uma vez
 */
export async function getMultipleActionPoints(actionIds: string[]): Promise<Record<string, number>> {
    const actions = await loadPointActions()
    const result: Record<string, number> = {}

    actionIds.forEach(id => {
        result[id] = actions.get(id) || getDefaultPoints().get(id) || 0
    })

    return result
}

/**
 * Limpa o cache (chamar após atualizar pontos no admin)
 */
export function clearPointActionsCache(): void {
    pointActionsCache = null
    cacheExpiry = 0
    console.log('[PointActions] Cache limpo')
}

/**
 * Valores padrão caso banco não responda
 */
function getDefaultPoints(): Map<string, number> {
    return new Map([
        // Confrarias
        ['confraternity_invite', 5],
        ['confraternity_accepted', 15],
        ['confraternity_created', 40],
        ['confraternity_host', 80],
        ['confraternity_guest', 50],
        ['confraternity_photo', 10],
        // Elos
        ['elo_sent', 20],
        ['elo_accepted', 30],
        // Feed
        ['feed_post', 15],
        ['post_comment_sent', 5],
        ['post_like_received', 2],
        // Outros
        ['portfolio_upload', 20],
        ['rating_given', 10],
        ['daily_login', 5],
    ])
}
