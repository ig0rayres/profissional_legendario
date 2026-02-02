'use server'

import { createClient } from '@/lib/supabase/server'
import type {
    CompleteProfileData,
    ProfileData,
    GamificationData,
    SubscriptionData,
    MedalData,
    UserMedalData,
    ConfraternityStat,
    PortfolioItem,
    RatingData,
    RatingStats
} from './types'

/**
 * Buscar TODOS os dados do perfil de um usuário
 * Query master unificada para a página de perfil
 */
export async function getUserProfileData(userId: string): Promise<CompleteProfileData | null> {
    try {
        const supabase = await createClient()

        // 1. Profile básico
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            console.error('Erro ao buscar profile:', profileError)
            return null
        }

        // 2. Gamificação completa
        const { data: gamification } = await supabase
            .from('user_gamification')
            .select(`
                *,
                rank:ranks!current_rank_id(*)
            `)
            .eq('user_id', userId)
            .single()

        // 3. Medalhas conquistadas
        const { data: userMedals } = await supabase
            .from('user_medals')
            .select(`
                medal_id,
                earned_at,
                medals(*)
            `)
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })

        // 4. Todas as medalhas disponíveis
        const { data: allMedals } = await supabase
            .from('medals')
            .select('*')
            .order('id')

        // 5. Subscription & Plano
        // NOTA: plan_tiers é uma VIEW, não tabela! JOIN automático do Supabase falha
        // Solução: Buscar separadamente e fazer merge manual
        const { data: subscriptionRaw } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        let subscription = null
        if (subscriptionRaw) {
            // Buscar plan_tiers manualmente
            const { data: planTier } = await supabase
                .from('plan_tiers')
                .select('*')
                .eq('id', subscriptionRaw.plan_id)
                .single()

            // Merge manual
            subscription = {
                ...subscriptionRaw,
                plan_tiers: planTier
            }
        }

        // 6. Estatísticas de Confraria
        const { data: confraternityStatsRaw } = await supabase
            .rpc('get_user_confraternity_stats', { p_user_id: userId })

        const confraternityStats: ConfraternityStat | null = confraternityStatsRaw || null

        // 7. Portfolio
        const { data: portfolio } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', userId)
            .order('display_order')

        // 8. Ratings (últimas 5)
        const { data: ratings } = await supabase
            .from('ratings')
            .select(`
                *,
                reviewer:profiles!ratings_reviewer_id_fkey(full_name, avatar_url)
            `)
            .eq('professional_id', userId)
            .order('created_at', { ascending: false })
            .limit(5)

        // 9. Estatísticas de Rating
        const { data: ratingStatsRaw } = await supabase
            .rpc('get_rating_stats', { p_professional_id: userId })

        const ratingStats: RatingStats | null = ratingStatsRaw || null

        // 10. Projetos entregues e em andamento
        const { count: projectsCompleted } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', userId)
            .eq('status', 'completed')

        const { count: projectsInProgress } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', userId)
            .eq('status', 'in_progress')

        // 11. Todas as proezas disponíveis
        const { data: allProezas } = await supabase
            .from('proezas')
            .select('*')
            .eq('is_active', true)
            .order('category', { ascending: true })

        // 12. Proezas conquistadas pelo usuário
        const { data: earnedProezas } = await supabase
            .from('user_proezas')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })

        // 13. Posição no ranking (usando serviço centralizado)
        // EXCLUI admin/rotabusiness automaticamente
        const { getUserRankingPositionServer } = await import('@/lib/services/ranking')
        const rankingPosition = await getUserRankingPositionServer(supabase, userId)

        // Montar objeto completo
        return {
            profile: profile as ProfileData,
            gamification: gamification ? {
                ...gamification,
                ranking_position: rankingPosition // Adicionar posição no ranking
            } as GamificationData : null,
            subscription: subscription as SubscriptionData | null,
            allMedals: (allMedals || []) as MedalData[],
            earnedMedals: (userMedals || []) as any as UserMedalData[], // Fix type casting
            allProezas: (allProezas || []) as any,
            earnedProezas: (earnedProezas || []) as any,
            confraternityStats,
            portfolio: (portfolio || []) as PortfolioItem[],
            ratings: (ratings || []) as RatingData[],
            ratingStats,
            projectsCompleted: projectsCompleted || 0,
            projectsInProgress: projectsInProgress || 0
        }
    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error)
        return null
    }
}

/**
 * Buscar apenas dados básicos do perfil (mais rápido)
 */
export async function getBasicProfileData(userId: string) {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    return profile as ProfileData | null
}

/**
 * Buscar apenas gamificação
 */
export async function getUserGamification(userId: string) {
    const supabase = await createClient()

    const { data: gamification } = await supabase
        .from('user_gamification')
        .select(`
            *,
            rank:ranks!current_rank_id(*),
            user_medals(
                medal_id,
                earned_at,
                medals(*)
            )
        `)
        .eq('user_id', userId)
        .single()

    return gamification as GamificationData | null
}
