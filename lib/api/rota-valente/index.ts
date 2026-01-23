/**
 * ROTA DO VALENTE v2.0 - API CENTRALIZADA
 * 
 * Este módulo centraliza toda a lógica de gamificação:
 * - Proezas (mensais)
 * - Medalhas (permanentes)
 * - Ações de pontos
 * - Missões diárias
 * - Multiplicadores
 */

import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface Proeza {
    id: string
    name: string
    description: string
    points_base: number
    category: string
    icon: string
    is_active: boolean
}

export interface Medal {
    id: string
    name: string
    description: string
    points_reward: number
    category: string
    icon: string
    is_permanent: boolean
}

export interface PointAction {
    id: string
    name: string
    description: string
    points_base: number
    category: string
    max_per_day: number | null
    is_active: boolean
}

export interface DailyMission {
    id: string
    name: string
    description: string
    points_base: number
    category: string
    icon: string
    is_active: boolean
}

export interface AwardResult {
    success: boolean
    points: number
    multiplier: number
    error?: string
    alreadyEarned?: boolean
    limitReached?: boolean
}

// ============================================
// CONSTANTES
// ============================================

export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

// Multiplicadores por plano
const PLAN_MULTIPLIERS: Record<string, number> = {
    'recruta': 1,
    'veterano': 1.5,
    'elite': 3
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém o mês atual no formato '2026-01'
 */
export function getCurrentSeasonMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Obtém a data de hoje no formato 'YYYY-MM-DD'
 */
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Busca o multiplicador do plano do usuário
 */
export async function getMultiplier(userId: string): Promise<number> {
    const supabase = createClient()

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

    const planId = subscription?.plan_id || 'recruta'
    const multiplier = PLAN_MULTIPLIERS[planId] || 1

    console.log(`[RotaValente] Usuário ${userId} - Plano: ${planId} - Multiplicador: ${multiplier}x`)

    return multiplier
}

// ============================================
// AÇÕES DE PONTOS (Dinâmico do banco)
// ============================================

/**
 * Concede pontos por uma ação específica
 * Busca configuração do banco, aplica multiplicador, verifica limites
 */
export async function awardPointsForAction(
    userId: string,
    actionId: string,
    metadata?: Record<string, any>
): Promise<AwardResult> {
    try {
        const supabase = createClient()
        const today = getTodayDate()
        const seasonMonth = getCurrentSeasonMonth()

        console.log(`[RotaValente] awardPointsForAction: ${actionId} para ${userId}`)

        // 1. Buscar configuração da ação
        const { data: action, error: actionError } = await supabase
            .from('point_actions')
            .select('*')
            .eq('id', actionId)
            .eq('is_active', true)
            .single()

        if (actionError || !action) {
            console.error(`[RotaValente] Ação não encontrada: ${actionId}`)
            return { success: false, points: 0, multiplier: 1, error: 'Ação não encontrada ou inativa' }
        }

        // 2. Verificar limite diário
        if (action.max_per_day) {
            const { count } = await supabase
                .from('points_history')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('action_type', actionId)
                .gte('created_at', `${today}T00:00:00`)

            if (count && count >= action.max_per_day) {
                console.log(`[RotaValente] Limite diário atingido: ${actionId} (${count}/${action.max_per_day})`)
                return {
                    success: false,
                    points: 0,
                    multiplier: 1,
                    limitReached: true,
                    error: `Limite diário atingido (${action.max_per_day}/dia)`
                }
            }
        }

        // 3. Obter multiplicador
        const multiplier = await getMultiplier(userId)
        const basePoints = action.points_base
        const finalPoints = Math.round(basePoints * multiplier)

        // 4. Buscar pontos atuais
        let { data: currentStats } = await supabase
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .maybeSingle()

        // Criar registro se não existir
        if (!currentStats) {
            await supabase
                .from('user_gamification')
                .insert({
                    user_id: userId,
                    total_points: 0,
                    current_rank_id: 'novato',
                    monthly_vigor: 0,
                    last_activity_at: new Date().toISOString()
                })
            currentStats = { total_points: 0 }
        }

        const currentPoints = currentStats?.total_points || 0
        const newPoints = currentPoints + finalPoints

        // 5. Atualizar pontos (XP total + Vigor mensal)
        await supabase
            .from('user_gamification')
            .update({
                total_points: newPoints,
                monthly_vigor: supabase.rpc ? undefined : 0, // Incrementar se possível
                last_activity_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        // 6. Registrar no histórico
        await supabase
            .from('points_history')
            .insert({
                user_id: userId,
                points: finalPoints,
                action_type: actionId,
                description: action.description,
                metadata: {
                    base_points: basePoints,
                    multiplier: multiplier,
                    season_month: seasonMonth,
                    ...metadata
                }
            })

        // 7. Atualizar stats da temporada
        await supabase
            .from('user_season_stats')
            .upsert({
                user_id: userId,
                season_month: seasonMonth,
                total_vigor: finalPoints, // Será incrementado via trigger/RPC
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,season_month' })

        console.log(`[RotaValente] ✅ Pontos concedidos: ${finalPoints} (${basePoints} x ${multiplier})`)

        return {
            success: true,
            points: finalPoints,
            multiplier: multiplier
        }

    } catch (error: any) {
        console.error('[RotaValente] Erro em awardPointsForAction:', error)
        return { success: false, points: 0, multiplier: 1, error: error.message }
    }
}

// ============================================
// PROEZAS (Mensais)
// ============================================

/**
 * Concede uma proeza ao usuário (mensal - pode reconquistar a cada mês)
 */
export async function awardProeza(
    userId: string,
    proezaId: string
): Promise<AwardResult> {
    try {
        const supabase = createClient()
        const seasonMonth = getCurrentSeasonMonth()

        console.log(`[RotaValente] awardProeza: ${proezaId} para ${userId}`)

        // 1. Verificar se já ganhou este mês
        const { data: existing } = await supabase
            .from('user_proezas')
            .select('id')
            .eq('user_id', userId)
            .eq('proeza_id', proezaId)
            .eq('season_month', seasonMonth)
            .maybeSingle()

        if (existing) {
            console.log(`[RotaValente] Proeza já conquistada este mês: ${proezaId}`)
            return { success: true, points: 0, multiplier: 1, alreadyEarned: true }
        }

        // 2. Buscar configuração da proeza
        const { data: proeza, error: proezaError } = await supabase
            .from('proezas')
            .select('*')
            .eq('id', proezaId)
            .eq('is_active', true)
            .single()

        if (proezaError || !proeza) {
            return { success: false, points: 0, multiplier: 1, error: 'Proeza não encontrada' }
        }

        // 3. Obter multiplicador
        const multiplier = await getMultiplier(userId)
        const basePoints = proeza.points_base
        const finalPoints = Math.round(basePoints * multiplier)

        // 4. Inserir proeza do usuário
        await supabase
            .from('user_proezas')
            .insert({
                user_id: userId,
                proeza_id: proezaId,
                season_month: seasonMonth,
                points_earned: finalPoints
            })

        // 5. Conceder pontos
        await awardPointsForAction(userId, 'proeza_earned', {
            proeza_id: proezaId,
            proeza_name: proeza.name,
            base_points: basePoints
        })

        // 6. Criar notificação
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'proeza_earned',
                title: `🔥 Proeza Conquistada!`,
                body: `Você desbloqueou "${proeza.name}"! +${finalPoints} Vigor`,
                priority: 'high',
                metadata: { proeza_id: proezaId, points: finalPoints }
            })

        console.log(`[RotaValente] ✅ Proeza concedida: ${proeza.name} (+${finalPoints} Vigor)`)

        return {
            success: true,
            points: finalPoints,
            multiplier: multiplier
        }

    } catch (error: any) {
        console.error('[RotaValente] Erro em awardProeza:', error)
        return { success: false, points: 0, multiplier: 1, error: error.message }
    }
}

// ============================================
// MEDALHAS (Permanentes)
// ============================================

/**
 * Concede uma medalha permanente ao usuário (1x na vida)
 */
export async function awardMedal(
    userId: string,
    medalId: string
): Promise<AwardResult> {
    try {
        const supabase = createClient()

        console.log(`[RotaValente] awardMedal: ${medalId} para ${userId}`)

        // 1. Verificar se já possui
        const { data: existing } = await supabase
            .from('user_medals')
            .select('id')
            .eq('user_id', userId)
            .eq('medal_id', medalId)
            .maybeSingle()

        if (existing) {
            console.log(`[RotaValente] Medalha já conquistada: ${medalId}`)
            return { success: true, points: 0, multiplier: 1, alreadyEarned: true }
        }

        // 2. Buscar configuração da medalha
        const { data: medal, error: medalError } = await supabase
            .from('medals')
            .select('*')
            .eq('id', medalId)
            .single()

        if (medalError || !medal) {
            return { success: false, points: 0, multiplier: 1, error: 'Medalha não encontrada' }
        }

        // 3. Obter multiplicador
        const multiplier = await getMultiplier(userId)
        const basePoints = medal.points_reward || 0
        const finalPoints = Math.round(basePoints * multiplier)

        // 4. Inserir medalha
        await supabase
            .from('user_medals')
            .insert({
                user_id: userId,
                medal_id: medalId
            })

        // 5. Conceder pontos
        if (finalPoints > 0) {
            // Atualizar diretamente para evitar loop
            const { data: currentStats } = await supabase
                .from('user_gamification')
                .select('total_points')
                .eq('user_id', userId)
                .maybeSingle()

            const currentPoints = currentStats?.total_points || 0

            await supabase
                .from('user_gamification')
                .upsert({
                    user_id: userId,
                    total_points: currentPoints + finalPoints,
                    last_activity_at: new Date().toISOString()
                }, { onConflict: 'user_id' })

            // Registrar histórico
            await supabase
                .from('points_history')
                .insert({
                    user_id: userId,
                    points: finalPoints,
                    action_type: 'medal_earned',
                    description: `Medalha conquistada: ${medal.name}`,
                    metadata: {
                        medal_id: medalId,
                        base_points: basePoints,
                        multiplier: multiplier
                    }
                })
        }

        // 6. Criar notificação
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'medal_earned',
                title: `🏅 Nova Medalha Permanente!`,
                body: `Você conquistou "${medal.name}"! +${finalPoints} Vigor`,
                priority: 'high',
                metadata: { medal_id: medalId, points: finalPoints }
            })

        console.log(`[RotaValente] ✅ Medalha concedida: ${medal.name} (+${finalPoints} Vigor)`)

        return {
            success: true,
            points: finalPoints,
            multiplier: multiplier
        }

    } catch (error: any) {
        console.error('[RotaValente] Erro em awardMedal:', error)
        return { success: false, points: 0, multiplier: 1, error: error.message }
    }
}

// ============================================
// MISSÕES DIÁRIAS
// ============================================

/**
 * Completa uma missão diária
 */
export async function completeDailyMission(
    userId: string,
    missionId: string
): Promise<AwardResult> {
    try {
        const supabase = createClient()
        const today = getTodayDate()

        console.log(`[RotaValente] completeDailyMission: ${missionId} para ${userId}`)

        // 1. Verificar se a missão foi atribuída hoje e não está completa
        const { data: userMission, error: missionError } = await supabase
            .from('user_daily_missions')
            .select('*, daily_missions(*)')
            .eq('user_id', userId)
            .eq('mission_id', missionId)
            .eq('mission_date', today)
            .is('completed_at', null)
            .maybeSingle()

        if (!userMission) {
            return {
                success: false,
                points: 0,
                multiplier: 1,
                error: 'Missão não encontrada ou já completada'
            }
        }

        // 2. Obter multiplicador
        const multiplier = await getMultiplier(userId)
        const basePoints = userMission.daily_missions?.points_base || 10
        const finalPoints = Math.round(basePoints * multiplier)

        // 3. Marcar como completa
        await supabase
            .from('user_daily_missions')
            .update({
                completed_at: new Date().toISOString(),
                points_earned: finalPoints
            })
            .eq('id', userMission.id)

        // 4. Conceder pontos
        await awardPointsForAction(userId, 'daily_mission_completed', {
            mission_id: missionId,
            mission_name: userMission.daily_missions?.name
        })

        console.log(`[RotaValente] ✅ Missão completada: ${userMission.daily_missions?.name}`)

        return {
            success: true,
            points: finalPoints,
            multiplier: multiplier
        }

    } catch (error: any) {
        console.error('[RotaValente] Erro em completeDailyMission:', error)
        return { success: false, points: 0, multiplier: 1, error: error.message }
    }
}

/**
 * Atribui missões diárias para o usuário
 */
export async function assignDailyMissions(
    userId: string,
    count: number = 3
): Promise<DailyMission[]> {
    try {
        const supabase = createClient()
        const today = getTodayDate()

        // Verificar se já tem missões hoje
        const { data: existing } = await supabase
            .from('user_daily_missions')
            .select('mission_id')
            .eq('user_id', userId)
            .eq('mission_date', today)

        if (existing && existing.length > 0) {
            // Já tem missões, retornar elas
            const { data: missions } = await supabase
                .from('user_daily_missions')
                .select('*, daily_missions(*)')
                .eq('user_id', userId)
                .eq('mission_date', today)

            return missions?.map(m => m.daily_missions) || []
        }

        // Buscar missões ativas
        const { data: allMissions } = await supabase
            .from('daily_missions')
            .select('*')
            .eq('is_active', true)

        if (!allMissions || allMissions.length === 0) {
            return []
        }

        // Sortear missões (com peso)
        const shuffled = allMissions
            .flatMap(m => Array(m.rotation_weight || 1).fill(m))
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)

        // Atribuir missões
        for (const mission of shuffled) {
            await supabase
                .from('user_daily_missions')
                .insert({
                    user_id: userId,
                    mission_id: mission.id,
                    mission_date: today
                })
        }

        return shuffled

    } catch (error) {
        console.error('[RotaValente] Erro em assignDailyMissions:', error)
        return []
    }
}

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * Obtém estatísticas do usuário na temporada atual
 */
export async function getSeasonStats(userId: string) {
    try {
        const supabase = createClient()
        const seasonMonth = getCurrentSeasonMonth()

        // Buscar stats
        const { data: stats } = await supabase
            .from('user_season_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('season_month', seasonMonth)
            .maybeSingle()

        // Buscar proezas do mês
        const { data: proezas } = await supabase
            .from('user_proezas')
            .select('*, proezas(*)')
            .eq('user_id', userId)
            .eq('season_month', seasonMonth)

        // Buscar medalhas
        const { data: medals } = await supabase
            .from('user_medals')
            .select('*, medals(*)')
            .eq('user_id', userId)

        return {
            seasonMonth,
            totalVigor: stats?.total_vigor || 0,
            proezasEarned: proezas?.length || 0,
            proezas: proezas || [],
            medals: medals || [],
            rankingPosition: stats?.ranking_position || null
        }

    } catch (error) {
        console.error('[RotaValente] Erro em getSeasonStats:', error)
        return null
    }
}

// ============================================
// EXPORTS PARA COMPATIBILIDADE
// ============================================

// Alias para código legado
export const awardPoints = awardPointsForAction
export const awardBadge = awardMedal
