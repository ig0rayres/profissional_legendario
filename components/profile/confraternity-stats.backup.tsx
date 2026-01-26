'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, Calendar, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { RankInsignia } from '@/components/gamification/rank-insignia'

interface UpcomingConfraternity {
    id: string
    proposed_date: string
    location: string
    status: string
    partner: {
        id: string
        full_name: string
        avatar_url?: string | null
        rank_id?: string
    }
}

interface ConfraternityStatsProps {
    userId: string
    isOwnProfile?: boolean
}

export function ConfraternityStats({ userId, isOwnProfile = false }: ConfraternityStatsProps) {
    const [confraternities, setConfraternities] = useState<UpcomingConfraternity[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadConfraternities()
    }, [userId])

    async function loadConfraternities() {
        setLoading(true)

        try {
            // Buscar confrarias aceitas onde o usuário é sender ou receiver
            const { data, error } = await supabase
                .from('confraternity_invites')
                .select('id, proposed_date, location, status, sender_id, receiver_id')
                .eq('status', 'accepted')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .gte('proposed_date', new Date().toISOString())
                .order('proposed_date', { ascending: true })
                .limit(5)

            if (error) {
                console.error('[ConfraternityStats] Error loading confraternities:', error)
                setLoading(false)
                return
            }

            if (!data || data.length === 0) {
                setConfraternities([])
                setLoading(false)
                return
            }

            // Buscar os parceiros (profiles + gamification para rank)
            const partnerIds = data.map(item =>
                item.sender_id === userId ? item.receiver_id : item.sender_id
            )

            // Buscar profiles
            const { data: partners } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', partnerIds)

            // Buscar ranks dos parceiros
            const { data: gamificationData } = await supabase
                .from('user_gamification')
                .select('user_id, current_rank_id')
                .in('user_id', partnerIds)

            const partnersMap = new Map(partners?.map(p => [p.id, p]) || [])
            const ranksMap = new Map(gamificationData?.map(g => [g.user_id, g.current_rank_id]) || [])

            const formatted = data.map(item => {
                const partnerId = item.sender_id === userId ? item.receiver_id : item.sender_id
                const partner = partnersMap.get(partnerId)
                const rankId = ranksMap.get(partnerId)

                return {
                    id: item.id,
                    proposed_date: item.proposed_date,
                    location: item.location,
                    status: item.status,
                    partner: {
                        id: partnerId,
                        full_name: partner?.full_name || 'Usuário',
                        avatar_url: partner?.avatar_url,
                        rank_id: rankId || 'novato'
                    }
                }
            })

            setConfraternities(formatted)
        } catch (err) {
            console.error('[ConfraternityStats] Exception:', err)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Swords className="w-5 h-5" />
                        Próximas Confrarias
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-[#2D3B2D] bg-[#1A2421]/60 backdrop-blur-sm shadow-lg shadow-black/30 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#F2F4F3]">
                    <Swords className="w-5 h-5 text-[#1E4D40]" />
                    Próximas Confrarias
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {confraternities.length === 0 ? (
                    <div className="bg-[#0F1B1A]/50 p-4 rounded-lg border border-dashed border-[#2D3B2D] text-center">
                        <Swords className="w-6 h-6 text-[#D1D5DB] mx-auto mb-2" />
                        <p className="text-xs text-[#D1D5DB]">
                            Nenhuma confraria agendada
                        </p>
                        {isOwnProfile && (
                            <Link
                                href="/elo-da-rota/confraria/solicitar"
                                className="text-xs text-[#1E4D40] hover:underline mt-2 block"
                            >
                                Agendar uma confraria
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {confraternities.map(conf => (
                            <div
                                key={conf.id}
                                className="bg-[#0F1B1A]/50 p-3 rounded-lg border border-[#1E4D40]/10 hover:border-[#1E4D40]/30 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar com Patente */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full border-2 border-[#1E4D40]/20 bg-[#1E4D40]/10 flex items-center justify-center overflow-hidden">
                                            {conf.partner?.avatar_url ? (
                                                <Image
                                                    src={conf.partner.avatar_url}
                                                    alt={conf.partner.full_name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <span className="text-base font-bold text-[#1E4D40]">
                                                    {conf.partner?.full_name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Ícone da Patente - menor */}
                                        <div className="absolute -bottom-0.5 -right-0.5">
                                            <RankInsignia
                                                rankId={conf.partner?.rank_id || 'novato'}
                                                size="xs"
                                                variant="avatar"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate text-[#F2F4F3]">
                                            {conf.partner?.full_name || 'Usuário'}
                                        </p>

                                        <div className="flex items-center gap-1 text-xs text-[#D1D5DB] mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(conf.proposed_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                        </div>

                                        {conf.location && (
                                            <div className="flex items-center gap-1 text-xs text-[#D1D5DB] mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{conf.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {confraternities.length >= 5 && (
                            <Link
                                href="/elo-da-rota/confraria"
                                className="text-xs text-primary hover:underline text-center block pt-2"
                            >
                                Ver todas as confrarias
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
