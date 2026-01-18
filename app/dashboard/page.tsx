'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { ProfilePageTemplate } from '@/components/profile/profile-page-template'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

export default function DashboardPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<CompleteProfileData | null>(null)
    const [nextRank, setNextRank] = useState<RankData | null>(null)

    useEffect(() => {
        // Aguardar auth carregar antes de verificar usuário
        if (authLoading) return

        // Só redirecionar se auth já carregou e não tem usuário
        if (!user) {
            router.push('/auth/login')
            return
        }

        // Buscar dados do perfil do usuário logado via API
        const fetchProfileData = async () => {
            try {
                const response = await fetch('/api/profile/me')

                if (!response.ok) {
                    if (response.status === 401) {
                        router.push('/auth/login')
                        return
                    }
                    throw new Error('Erro ao buscar perfil')
                }

                const data = await response.json()
                setProfileData(data.profileData)
                setNextRank(data.nextRank)
            } catch (error) {
                console.error('Erro ao buscar dados do perfil:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [user, router, authLoading])

    // Mostrar loading se auth está carregando OU se dados do perfil estão carregando
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure pt-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-primary text-lg font-semibold">Carregando seu perfil...</p>
                </div>
            </div>
        )
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure pt-20">
                <div className="text-center">
                    <p className="text-destructive text-lg font-semibold mb-4">
                        Não foi possível carregar seu perfil
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        )
    }

    return (
        <ProfilePageTemplate
            profileData={profileData}
            nextRank={nextRank}
            backUrl="/"
            isOwner={true}
        />
    )
}
