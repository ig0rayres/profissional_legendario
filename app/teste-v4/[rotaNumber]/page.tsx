'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfilePageTemplateV4 } from '@/components/profile/profile-page-template-v4'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

interface PageProps {
    params: {
        rotaNumber: string
    }
}

/**
 * ROTA DE TESTE V4
 * Acesso: /teste-v4/141018 (ou qualquer rota_number)
 * Renderiza com o layout EXATO do demo V4
 */
export default function TestV4ProfilePage({ params }: PageProps) {
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
    }, [params.rotaNumber])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#1E4D40] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#F2F4F3] text-lg font-semibold">Carregando perfil V4...</p>
                </div>
            </div>
        )
    }

    if (notFoundState || !profileData) {
        notFound()
    }

    return (
        <ProfilePageTemplateV4
            profileData={profileData}
            nextRank={nextRank}
            backUrl="/professionals"
        />
    )
}
