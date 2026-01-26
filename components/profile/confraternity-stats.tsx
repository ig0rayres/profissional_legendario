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
            <Card className="bg-white border border-gray-200 shadow-md">
                <CardContent className="p-5">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#D2691E] border-t-transparent" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const formatDate = (date: string) => {
        const d = new Date(date)
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
            weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#D2691E]/30 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                        <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#2D3142]">
                            Confrarias
                        </h3>
                        <p className="text-xs text-gray-600">
                            Próximos encontros
                        </p>
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="text-center py-8 bg-[#D2691E]/5 rounded-xl border border-dashed border-[#D2691E]/20 hover:border-[#D2691E]/40 hover:bg-[#D2691E]/10 transition-all cursor-pointer">
                        <Calendar className="w-10 h-10 text-[#D2691E]/50 mx-auto mb-2" />
                        <p className="text-sm text-[#2D3142]">
                            Nenhuma confraria agendada
                        </p>
                        {isOwnProfile && (
                            <Link
                                href="/elo-da-rota/confraria/solicitar"
                                className="text-xs text-[#D2691E] hover:underline mt-2 block font-medium"
                            >
                                Agendar um encontro
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.map((conf) => {
                            const date = formatDate(conf.proposed_date)
                            return (
                                <div
                                    key={conf.id}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-[#D2691E]/30 hover:shadow-md transition-all transform hover:scale-102 duration-300 cursor-pointer group/conf"
                                >
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center shadow-sm transform group-hover/conf:scale-110 transition-transform">
                                        <span className="text-lg font-bold text-[#D2691E]">{date.day}</span>
                                        <span className="text-[10px] uppercase text-gray-600 font-medium">{date.month}</span>
                                    </div>

                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md transform group-hover/conf:rotate-6 transition-transform">
                                        {conf.partner?.avatar_url ? (
                                            <Image
                                                src={conf.partner.avatar_url}
                                                alt={conf.partner.full_name}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-white">
                                                {conf.partner?.full_name?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#2D3142] truncate">
                                            {conf.partner?.full_name}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-700 mt-0.5">
                                            <span className="capitalize">{date.weekday}</span>
                                            <span>•</span>
                                            <span>{date.time}</span>
                                        </div>
                                        {conf.location && (
                                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{conf.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {confraternities.length >= 5 && (
                            <Link
                                href="/elo-da-rota/confraria"
                                className="text-xs text-[#D2691E] hover:underline text-center block pt-2 font-medium"
                            >
                                Ver todas as confrarias
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
