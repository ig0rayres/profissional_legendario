import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const supabase = await createClient()
        const userId = params.id

        // 1. Profile básico
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        // 2. Gamificação completa
        const { data: gamification } = await supabase
            .from('user_gamification')
            .select(`
                *,
                ranks:current_rank_id(*)
            `)
            .eq('user_id', userId)
            .single()

        // Renomear ranks para rank (singular) para manter compatibilidade
        const gamificationFormatted = gamification ? {
            ...gamification,
            rank: gamification.ranks,
            ranks: undefined
        } : null

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
        const { data: confraternityStats } = await supabase
            .rpc('get_user_confraternity_stats', { p_user_id: userId })

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
        const { data: ratingStats } = await supabase
            .rpc('get_rating_stats', { p_professional_id: userId })

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

        // 11. Próxima patente
        const currentRankLevel = gamificationFormatted?.rank?.rank_level || 1
        const { data: nextRank } = await supabase
            .from('ranks')
            .select('*')
            .eq('rank_level', currentRankLevel + 1)
            .single()

        // Montar objeto completo
        const profileData = {
            profile,
            gamification: gamificationFormatted,
            subscription,
            allMedals: allMedals || [],
            earnedMedals: userMedals || [],
            confraternityStats: confraternityStats || null,
            portfolio: portfolio || [],
            ratings: ratings || [],
            ratingStats: ratingStats || null,
            projectsCompleted: projectsCompleted || 0,
            projectsInProgress: projectsInProgress || 0
        }

        return NextResponse.json({
            profileData,
            nextRank
        })
    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
