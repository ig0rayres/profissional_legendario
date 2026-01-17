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
    // Buscar TODOS os dados do perfil
    const profileData = await getUserProfileData(params.id)

    if (!profileData) {
        notFound()
    }

    // Calcular próxima patente
    const currentRankLevel = profileData.gamification?.rank?.rank_level || 1
    const supabase = await createClient()
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
