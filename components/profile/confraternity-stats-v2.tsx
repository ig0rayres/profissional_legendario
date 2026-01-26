'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Swords, Calendar, MapPin, Users, Clock, ChevronRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'

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

interface ConfraternityStatsV2Props {
    userId: string
    isOwnProfile?: boolean
}

export function ConfraternityStatsV2({ userId, isOwnProfile = false }: ConfraternityStatsV2Props) {
    const [confraternities, setConfraternities] = useState<UpcomingConfraternity[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadConfraternities()
    }, [userId])

    async function loadConfraternities() {
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('confraternity_invites')
                .select('id, proposed_date, location, status, sender_id, receiver_id')
                .eq('status', 'accepted')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .gte('proposed_date', new Date().toISOString())
                .order('proposed_date', { ascending: true })
                .limit(3)

            if (error || !data || data.length === 0) {
                setConfraternities([])
                setLoading(false)
                return
            }

            const partnerIds = data.map(item =>
                item.sender_id === userId ? item.receiver_id : item.sender_id
            )

            const { data: partners } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', partnerIds)

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
            console.error('[ConfraternityStatsV2] Exception:', err)
        }

        setLoading(false)
    }

    const getFirstName = (fullName: string) => fullName.split(' ')[0]

    const getTimeUntil = (dateStr: string) => {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR })
    }

    const isToday = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isTomorrow = (dateStr: string) => {
        const date = new Date(dateStr)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return date.toDateString() === tomorrow.toDateString()
    }

    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F1B1A] via-[#1A2421] to-[#0F1B1A] shadow-2xl">
            {/* Borda luminosa */}
            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-br from-[#D2691E]/30 via-transparent to-purple-500/20" />

            {/* Decoração */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-[#D2691E]/5 rounded-full blur-2xl" />

            <CardContent className="relative p-5">
                {/* Header Premium */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center shadow-lg shadow-[#D2691E]/20">
                                <Swords className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute inset-0 w-10 h-10 rounded-xl bg-[#D2691E]/20 blur-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-[#F2F4F3]">
                                CONFRARIAS
                            </h3>
                            <p className="text-[10px] text-[#8B9A8B] uppercase tracking-wide">
                                Próximos Encontros
                            </p>
                        </div>
                    </div>

                    {/* Contador */}
                    <div className="flex items-center gap-1.5 bg-[#D2691E]/10 px-3 py-1.5 rounded-full border border-[#D2691E]/20">
                        <Calendar className="w-3.5 h-3.5 text-[#D2691E]" />
                        <span className="text-sm font-bold text-[#D2691E]">{confraternities.length}</span>
                    </div>
                </div>

                {/* Lista de Confrarias */}
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="relative">
                            <div className="w-10 h-10 border-2 border-[#D2691E]/20 rounded-full" />
                            <div className="absolute top-0 left-0 w-10 h-10 border-2 border-[#D2691E] border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                ) : confraternities.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="relative inline-block">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D2691E]/10 to-[#D2691E]/5 flex items-center justify-center mx-auto mb-3">
                                <Swords className="w-8 h-8 text-[#D2691E]/30" />
                            </div>
                            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-[#D2691E]/40 animate-pulse" />
                        </div>
                        <p className="text-sm font-bold text-[#8B9A8B] uppercase tracking-wide">
                            Nenhuma agendada
                        </p>
                        <p className="text-xs text-[#6B7A6B] mt-1 mb-4">
                            Agende encontros com sua rede
                        </p>
                        {isOwnProfile && (
                            <Link
                                href="/elo-da-rota/confraria/solicitar"
                                className={cn(
                                    "inline-flex items-center gap-2",
                                    "px-4 py-2 rounded-lg",
                                    "bg-gradient-to-r from-[#D2691E]/10 to-[#D2691E]/5",
                                    "border border-[#D2691E]/20",
                                    "text-xs font-bold text-[#D2691E] uppercase tracking-wide",
                                    "hover:from-[#D2691E]/15 hover:to-[#D2691E]/10",
                                    "transition-all duration-300"
                                )}
                            >
                                Agendar Confraria
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.map((conf, idx) => {
                            const urgent = isToday(conf.proposed_date)
                            const soon = isTomorrow(conf.proposed_date)

                            return (
                                <div
                                    key={conf.id}
                                    className={cn(
                                        "relative p-4 rounded-xl",
                                        "bg-gradient-to-br from-[#1A2421]/80 to-[#0F1B1A]/60",
                                        "border",
                                        urgent
                                            ? "border-[#D2691E]/50 shadow-lg shadow-[#D2691E]/10"
                                            : soon
                                                ? "border-yellow-500/30"
                                                : "border-[#2D3B2D]/50",
                                        "hover:border-[#D2691E]/40 hover:shadow-md hover:shadow-[#D2691E]/5",
                                        "transition-all duration-300 group"
                                    )}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Urgency Badge */}
                                    {urgent && (
                                        <div className="absolute -top-2 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D2691E] to-[#E07530] text-[9px] font-black text-white uppercase shadow-lg animate-pulse">
                                            <Clock className="w-3 h-3" />
                                            HOJE
                                        </div>
                                    )}
                                    {soon && !urgent && (
                                        <div className="absolute -top-2 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-[9px] font-black text-black uppercase shadow-lg">
                                            AMANHÃ
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#2D3B2D] group-hover:border-[#D2691E]/50 transition-colors">
                                                {conf.partner?.avatar_url ? (
                                                    <Image
                                                        src={conf.partner.avatar_url}
                                                        alt={conf.partner.full_name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-[#1E4D40]/20 to-[#1E4D40]/10 flex items-center justify-center">
                                                        <span className="text-base font-bold text-[#1E4D40]">
                                                            {conf.partner?.full_name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1">
                                                <RankInsignia
                                                    rankId={conf.partner?.rank_id || 'novato'}
                                                    size="xs"
                                                    variant="avatar"
                                                />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-[#F2F4F3] truncate group-hover:text-[#D2691E] transition-colors">
                                                {getFirstName(conf.partner?.full_name || 'Usuário')}
                                            </p>

                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-xs text-[#8B9A8B]">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>
                                                        {format(new Date(conf.proposed_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                    </span>
                                                </div>
                                            </div>

                                            {conf.location && (
                                                <div className="flex items-center gap-1 text-[11px] text-[#6B7A6B] mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{conf.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Time until */}
                                        <div className="text-right flex-shrink-0">
                                            <p className={cn(
                                                "text-[10px] font-medium uppercase tracking-wide",
                                                urgent ? "text-[#D2691E]" : soon ? "text-yellow-500" : "text-[#6B7A6B]"
                                            )}>
                                                {getTimeUntil(conf.proposed_date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Ver Todas */}
                        <Link
                            href="/elo-da-rota/confraria"
                            className={cn(
                                "flex items-center justify-center gap-2",
                                "py-2.5 rounded-lg",
                                "bg-gradient-to-r from-[#D2691E]/5 to-[#D2691E]/10",
                                "border border-[#D2691E]/20",
                                "text-xs font-bold text-[#D2691E] uppercase tracking-wide",
                                "hover:from-[#D2691E]/10 hover:to-[#D2691E]/15",
                                "hover:border-[#D2691E]/30",
                                "transition-all duration-300 group"
                            )}
                        >
                            Ver todas as confrarias
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
