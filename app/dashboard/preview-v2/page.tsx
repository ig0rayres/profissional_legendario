'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { ProfilePageTemplateV2 } from '@/components/profile/profile-page-template-v2'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Eye, Code } from 'lucide-react'
import Link from 'next/link'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

export default function DashboardPreviewV2Page() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<CompleteProfileData | null>(null)
    const [nextRank, setNextRank] = useState<RankData | null>(null)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            router.push('/auth/login')
            return
        }

        const fetchProfileData = async () => {
            try {
                console.log('[PreviewV2] Buscando dados do perfil...')
                const response = await fetch('/api/profile/me')

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('[PreviewV2] Erro na resposta:', response.status, errorText)
                    if (response.status === 401) {
                        router.push('/auth/login')
                        return
                    }
                    throw new Error(`Erro ao buscar perfil: ${response.status}`)
                }

                const data = await response.json()
                console.log('[PreviewV2] Dados recebidos:', data)
                setProfileData(data.profileData)
                setNextRank(data.nextRank)
            } catch (error) {
                console.error('[PreviewV2] Erro ao buscar dados do perfil:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [user, router, authLoading])

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-[#0A0F0D] to-[#0F1B1A]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-primary text-lg font-semibold">Carregando preview V2...</p>
                </div>
            </div>
        )
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-[#0A0F0D] to-[#0F1B1A]">
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
        <>
            {/* Banner de Preview */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white py-2 px-4 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="font-bold uppercase tracking-wider text-sm">
                                🎨 Lucas UI/UX Preview V2
                            </span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            Versão de Teste
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button size="sm" variant="secondary" className="text-xs gap-1.5">
                                <Eye className="w-3.5 h-3.5" />
                                Ver Versão Atual
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Espaçador para o banner fixo */}
            <div className="h-10" />

            {/* Template V2 */}
            <ProfilePageTemplateV2
                profileData={profileData}
                nextRank={nextRank}
                backUrl="/dashboard"
                isOwner={true}
            />
        </>
    )
}
