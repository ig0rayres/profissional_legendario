'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import Link from 'next/link'

interface SeasonBannerData {
    id: string
    name: string
    days_remaining: number
    banner_sidebar_url: string | null
}

interface SeasonBannerSimpleProps {
    showFullVersion?: boolean
}

/**
 * Componente simplificado que exibe APENAS a imagem do banner gerado no admin
 * Sem fallbacks complexos - se não tem imagem, não mostra nada
 */
export function SeasonBannerSimple({ showFullVersion = false }: SeasonBannerSimpleProps) {
    const [season, setSeason] = useState<SeasonBannerData | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadBanner()
    }, [])

    const loadBanner = async () => {
        try {
            // Busca direto da tabela seasons a temporada ativa
            const { data } = await supabase
                .from('seasons')
                .select('id, name, end_date, banner_sidebar_url')
                .eq('status', 'active')
                .single()

            if (data) {
                // Calcular dias restantes
                const endDate = new Date(data.end_date)
                const today = new Date()
                const diffTime = endDate.getTime() - today.getTime()
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                setSeason({
                    id: data.id,
                    name: data.name,
                    days_remaining: Math.max(0, daysRemaining),
                    banner_sidebar_url: data.banner_sidebar_url
                })
            }
        } catch (error) {
            console.error('[SeasonBannerSimple] Erro:', error)
        } finally {
            setLoading(false)
        }
    }

    // Se está carregando ou não tem temporada, não mostra nada
    if (loading || !season) {
        return null
    }

    // Se não tem banner gerado, não mostra nada
    if (!season.banner_sidebar_url) {
        return null
    }

    return (
        <Link href="/dashboard/rota-do-valente" className="block">
            <div className="relative rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Banner - apenas a imagem */}
                <img
                    src={season.banner_sidebar_url}
                    alt={`Temporada ${season.name}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ aspectRatio: '2.8' }}
                />

                {/* Badge de dias restantes */}
                <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-500 text-white border-0 text-xs px-2 py-1 shadow-lg">
                    <Clock className="w-3 h-3 mr-1" />
                    {season.days_remaining} dias
                </Badge>
            </div>
        </Link>
    )
}
