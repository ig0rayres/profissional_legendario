/**
 * FONTE CENTRALIZADA DE DADOS DE TEMPORADA
 * Todos os componentes que precisam de dados de ranking/participantes
 * devem usar estas funções para garantir consistência.
 */

import { createClient } from '@/lib/supabase/client'

export interface SeasonData {
    id: string
    month: number
    year: number
    status: 'active' | 'completed' | 'pending'
    name?: string
}

export interface SeasonPrize {
    position: number
    title: string
    image_url?: string
}

export interface SeasonParticipant {
    user_id: string
    full_name: string
    avatar_url?: string
    total_xp: number
    ranking_position: number
}

export interface SeasonStats {
    season: SeasonData | null
    prizes: SeasonPrize[]
    participants: SeasonParticipant[]
    participantCount: number
    leaderXP: number
    daysRemaining: number
}

/**
 * Busca a temporada ativa e seus dados
 * ESTA É A ÚNICA FONTE DE DADOS DE TEMPORADA
 */
export async function getActiveSeasonData(): Promise<SeasonStats> {
    const supabase = createClient()

    // 1. Buscar temporada ativa
    const { data: seasonData } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .single()

    if (!seasonData) {
        return {
            season: null,
            prizes: [],
            participants: [],
            participantCount: 0,
            leaderXP: 0,
            daysRemaining: 0
        }
    }

    // 2. Buscar prêmios da temporada
    const { data: prizesData } = await supabase
        .from('season_prizes')
        .select('position, title, image_url')
        .eq('season_id', seasonData.id)
        .order('position')
        .limit(3)

    // 3. Buscar participantes do user_season_stats (TABELA CENTRALIZADA)
    const { data: participantsData, count } = await supabase
        .from('user_season_stats')
        .select(`
            user_id,
            total_xp,
            ranking_position,
            user:profiles!user_id(full_name, avatar_url)
        `, { count: 'exact' })
        .eq('season_id', seasonData.id)
        .gt('total_xp', 0)
        .order('total_xp', { ascending: false })
        .limit(50)

    const participants = (participantsData || []).map((p: any, idx: number) => ({
        user_id: p.user_id,
        full_name: p.user?.full_name || 'Usuário',
        avatar_url: p.user?.avatar_url,
        total_xp: p.total_xp,
        ranking_position: p.ranking_position || idx + 1
    }))

    // 4. Calcular dias restantes
    const endDate = new Date(seasonData.year, seasonData.month, 0)
    const today = new Date()
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

    return {
        season: seasonData,
        prizes: prizesData || [],
        participants,
        participantCount: count || 0,
        leaderXP: participants[0]?.total_xp || 0,
        daysRemaining
    }
}

/**
 * Busca dados de uma temporada específica por ID
 */
export async function getSeasonDataById(seasonId: string): Promise<SeasonStats> {
    const supabase = createClient()

    const { data: seasonData } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single()

    if (!seasonData) {
        return {
            season: null,
            prizes: [],
            participants: [],
            participantCount: 0,
            leaderXP: 0,
            daysRemaining: 0
        }
    }

    const { data: prizesData } = await supabase
        .from('season_prizes')
        .select('position, title, image_url')
        .eq('season_id', seasonId)
        .order('position')
        .limit(3)

    const { data: participantsData, count } = await supabase
        .from('user_season_stats')
        .select(`
            user_id,
            total_xp,
            ranking_position,
            user:profiles!user_id(full_name, avatar_url)
        `, { count: 'exact' })
        .eq('season_id', seasonId)
        .gt('total_xp', 0)
        .order('total_xp', { ascending: false })
        .limit(50)

    const participants = (participantsData || []).map((p: any, idx: number) => ({
        user_id: p.user_id,
        full_name: p.user?.full_name || 'Usuário',
        avatar_url: p.user?.avatar_url,
        total_xp: p.total_xp,
        ranking_position: p.ranking_position || idx + 1
    }))

    const endDate = new Date(seasonData.year, seasonData.month, 0)
    const today = new Date()
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

    return {
        season: seasonData,
        prizes: prizesData || [],
        participants,
        participantCount: count || 0,
        leaderXP: participants[0]?.total_xp || 0,
        daysRemaining
    }
}
