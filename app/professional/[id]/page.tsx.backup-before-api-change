import { notFound } from 'next/navigation'
import { getUserProfileData } from '@/lib/profile/queries'
import { ProfilePageTemplate } from '@/components/profile/profile-page-template'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
    params: {
        id: string
    }
}

export default async function ProfessionalProfile({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Tentar buscar por slug primeiro, senão por UUID
    let userId: string | null = null

    // Verificar se é UUID ou slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)

    if (isUUID) {
        // É UUID, usar direto
        userId = params.id
    } else {
        // É slug, buscar o UUID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug', params.id)
            .single()

        userId = profile?.id || null
    }

    if (!userId) {
        notFound()
    }

    // Buscar TODOS os dados do perfil
    const profileData = await getUserProfileData(userId)

    if (!profileData) {
        notFound()
    }

    // Calcular próxima patente
    const currentRankLevel = profileData.gamification?.rank?.rank_level || 1
    const { data: nextRank } = await supabase
        .from('ranks')
        .select('*')
        .eq('rank_level', currentRankLevel + 1)
        .single()

    // Renderizar template centralizado
    return (
        <ProfilePageTemplate
            profileData={profileData}
            nextRank={nextRank}
            backUrl="/professionals"
        />
    )
}
