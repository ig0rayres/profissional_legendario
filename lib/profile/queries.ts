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
                ranks!current_rank_id(*)
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
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select(`
                *,
                plan_tiers(*)
            `)
            .eq('user_id', userId)
            .single()

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

        // Montar objeto completo
        return {
            profile: profile as ProfileData,
            gamification: gamification as GamificationData | null,
            subscription: subscription as SubscriptionData | null,
            allMedals: (allMedals || []) as MedalData[],
            earnedMedals: (userMedals || []) as any as UserMedalData[], // Fix type casting
            confraternityStats,
            portfolio: (portfolio || []) as PortfolioItem[],
            ratings: (ratings || []) as RatingData[],
            ratingStats
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
            ranks!current_rank_id(*),
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
