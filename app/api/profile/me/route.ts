import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        // Verificar usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        // 1. Profile básico
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        // 2. Gamificação completa
        const { data: gamification } = await supabase
            .from('user_gamification')
            .select(`
                *,
                rank:ranks!current_rank_id(*)
            `)
            .eq('user_id', user.id)
            .single()

        // 3. Medalhas conquistadas
        const { data: userMedals } = await supabase
            .from('user_medals')
            .select(`
                medal_id,
                earned_at,
                medals(*)
            `)
            .eq('user_id', user.id)
            .order('earned_at', { ascending: false })

        // 4. Todas as medalhas disponíveis
        const { data: allMedals } = await supabase
            .from('medals')
            .select('*')
            .order('id')

        // 5. Subscription & Plano
        const { data: subscriptionRaw } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // Buscar plan_tiers manualmente (VIEW, não tabela!)
        let subscription = null
        if (subscriptionRaw) {
            const { data: planTier, error: planTierError } = await supabase
                .from('plan_tiers')
                .select('*')
                .eq('id', subscriptionRaw.plan_id)
                .single()

            console.log('[API /me] Plan lookup:', {
                plan_id: subscriptionRaw.plan_id,
                planTier,
                planTierError: planTierError?.message
            })

            // Fallback HARDCODED se query falhar
            let finalPlanTier = planTier
            if (!planTier && subscriptionRaw.plan_id === 'elite') {
                console.warn('[API /me] FALLBACK: Usando plano Elite hardcoded')
                finalPlanTier = {
                    id: 'elite',
                    name: 'Elite',
                    description: 'Plano Elite',
                    price_monthly: 197,
                    price_annually: 1970
                }
            }

            subscription = {
                ...subscriptionRaw,
                plan_tiers: finalPlanTier
            }
        }

        // 6. Estatísticas de Confraria
        const { data: confraternityStats } = await supabase
            .rpc('get_user_confraternity_stats', { p_user_id: user.id })

        // 6.5. Categorias/Modalidades do usuário
        const { data: userCategories } = await supabase
            .from('user_categories')
            .select(`
                category_id,
                service_categories!inner(id, name, icon)
            `)
            .eq('user_id', user.id)

        // Mapear para formato simples
        const categories = (userCategories || []).map((uc: any) => ({
            id: uc.service_categories.id,
            name: uc.service_categories.name,
            icon: uc.service_categories.icon
        }))

        // 7. Portfolio
        const { data: portfolio } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', user.id)
            .order('display_order')

        // 8. Ratings (últimas 5)
        const { data: ratings } = await supabase
            .from('ratings')
            .select(`
                *,
                reviewer:profiles!ratings_reviewer_id_fkey(full_name, avatar_url)
            `)
            .eq('professional_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        // 9. Estatísticas de Rating
        const { data: ratingStats } = await supabase
            .rpc('get_rating_stats', { p_professional_id: user.id })

        // 10. Projetos entregues e em andamento
        const { count: projectsCompleted } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', user.id)
            .eq('status', 'completed')

        const { count: projectsInProgress } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', user.id)
            .eq('status', 'in_progress')

        // 11. Próxima patente
        const currentRankLevel = gamification?.rank?.rank_level || 1
        const { data: nextRank } = await supabase
            .from('ranks')
            .select('*')
            .eq('rank_level', currentRankLevel + 1)
            .single()

        // 12. Todas as proezas disponíveis
        const { data: allProezas } = await supabase
            .from('proezas')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        // 13. Proezas conquistadas pelo usuário (mês atual)
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        const { data: userProezas } = await supabase
            .from('user_proezas')
            .select('proeza_id, points_earned, earned_at, season_month')
            .eq('user_id', user.id)
            .eq('season_month', currentMonth)

        // Montar objeto completo
        const profileData = {
            profile,
            gamification,
            subscription,
            allMedals: allMedals || [],
            earnedMedals: userMedals || [],
            allProezas: allProezas || [],
            earnedProezas: userProezas || [],
            confraternityStats: confraternityStats || null,
            categories: categories || [],
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
