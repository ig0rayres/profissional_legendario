import { NextResponse } from 'next/server'
import { getUserProfileData } from '@/lib/profile/queries'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const supabase = await createClient()
        const { userId } = params

        // Tentar resolver slug para UUID se necessário
        let finalUserId = userId
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

        if (!isUUID) {
            // É slug, buscar UUID
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('slug', userId)
                .single()

            console.log('[API] Slug lookup:', { userId, profile, error: error?.message })

            if (!profile) {
                return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
            }
            finalUserId = profile.id
        }

        // Buscar dados usando getUserProfileData
        const profileData = await getUserProfileData(finalUserId)

        if (!profileData) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        // ★ CORREÇÃO: Se subscription vier NULL, buscar direto com SERVICE ROLE (ignora RLS)
        if (!profileData.subscription) {
            // Criar admin client para ignorar RLS policies
            const { createClient: createAdminClient } = await import('@supabase/supabase-js')
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { persistSession: false } }
            )

            const { data: subscriptionDirect, error: subError } = await supabaseAdmin
                .from('subscriptions')
                .select('*')
                .eq('user_id', finalUserId)
                .maybeSingle()

            console.log('[API Service Role] Subscription:', { subscriptionDirect, subError: subError?.message })

            if (subscriptionDirect) {
                const PLAN_MAP = {
                    'recruta': { id: 'recruta', name: 'Recruta', description: 'Plano Gratuito', price_monthly: 0, price_annually: 0 },
                    'veterano': { id: 'veterano', name: 'Veterano', description: 'Plano Veterano', price_monthly: 97, price_annually: 970 },
                    'elite': { id: 'elite', name: 'Elite', description: 'Plano Elite', price_monthly: 197, price_annually: 1970 },
                    'lendario': { id: 'lendario', name: 'Lendário', description: 'Plano Lendário', price_monthly: 297, price_annually: 2970 }
                }
                profileData.subscription = {
                    ...subscriptionDirect,
                    plan_tiers: PLAN_MAP[subscriptionDirect.plan_id as keyof typeof PLAN_MAP] || PLAN_MAP['recruta']
                }
            }
        }

        // Calcular próxima patente
        const currentRankLevel = profileData.gamification?.rank?.rank_level || 1
        const { data: nextRank } = await supabase
            .from('ranks')
            .select('*')
            .eq('rank_level', currentRankLevel + 1)
            .single()

        console.log('[API /profile/userId] Subscription:', {
            plan_id: profileData.subscription?.plan_id,
            plan_name: profileData.subscription?.plan_tiers?.name
        })

        return NextResponse.json({
            profileData,
            nextRank
        })
    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
