'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfilePageTemplate } from '@/components/profile/profile-page-template'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

interface PageProps {
    params: {
        slug: string
        rotaNumber: string
    }
}

export default function UserProfilePage({ params }: PageProps) {
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<CompleteProfileData | null>(null)
    const [nextRank, setNextRank] = useState<RankData | null>(null)
    const [notFoundState, setNotFoundState] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            try {
                const supabase = createClient()

                // Buscar perfil por rota_number
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id, slug, rota_number')
                    .eq('rota_number', params.rotaNumber)
                    .single()

                if (error || !profile) {
                    setNotFoundState(true)
                    setLoading(false)
                    return
                }

                // Verificar se o slug no URL corresponde ao slug do perfil
                // Se o slug não existir no perfil, usar o nome formatado
                const expectedSlug = profile.slug || ''
                const urlSlug = decodeURIComponent(params.slug).toLowerCase().replace(/ /g, '-')

                // Buscar dados completos via API
                const response = await fetch(`/api/profile/${profile.id}`)
                if (!response.ok) {
                    setNotFoundState(true)
                    setLoading(false)
                    return
                }

                const data = await response.json()
                setProfileData(data.profileData)
                setNextRank(data.nextRank)
            } catch (err) {
                console.error('Erro ao carregar perfil:', err)
                setNotFoundState(true)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [params.slug, params.rotaNumber])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure pt-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-primary text-lg font-semibold">Carregando perfil...</p>
                </div>
            </div>
        )
    }

    if (notFoundState || !profileData) {
        notFound()
    }

    return (
        <ProfilePageTemplate
            profileData={profileData}
            nextRank={nextRank}
            backUrl="/professionals"
        />
    )
}
