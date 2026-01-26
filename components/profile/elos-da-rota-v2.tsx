'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Link2, Users, Bell, ChevronRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { getProfileUrl } from '@/lib/profile/utils'
import { cn } from '@/lib/utils'

interface Connection {
    id: string
    full_name: string
    avatar_url: string | null
    slug: string | null
    rota_number: string | null
    rank_id: string
    rank_name: string
}

interface ElosDaRotaV2Props {
    userId: string
}

export function ElosDaRotaV2({ userId }: ElosDaRotaV2Props) {
    const [connections, setConnections] = useState<Connection[]>([])
    const [pendingCount, setPendingCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadConnections()
        loadPendingRequests()

        const channel = supabase
            .channel('elos-updates-v2')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_connections',
                filter: `requester_id=eq.${userId}`
            }, () => loadConnections())
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_connections',
                filter: `addressee_id=eq.${userId}`
            }, () => loadConnections())
            .subscribe()

        return () => { channel.unsubscribe() }
    }, [userId])

    async function loadConnections() {
        setLoading(true)

        const { data: connectionsData } = await supabase
            .from('user_connections')
            .select('requester_id, addressee_id')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

        if (!connectionsData || connectionsData.length === 0) {
            setConnections([])
            setLoading(false)
            return
        }

        const friendIds = connectionsData.map(conn =>
            conn.requester_id === userId ? conn.addressee_id : conn.requester_id
        )

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, slug, rota_number, avatar_url')
            .in('id', friendIds)

        if (!profiles || profiles.length === 0) {
            setConnections([])
            setLoading(false)
            return
        }

        const { data: gamificationData } = await supabase
            .from('user_gamification')
            .select('user_id, current_rank_id, ranks:current_rank_id(name)')
            .in('user_id', friendIds)

        const rankMap = new Map<string, { rank_id: string, name: string }>()
        gamificationData?.forEach((g: any) => {
            rankMap.set(g.user_id, {
                rank_id: g.current_rank_id || 'novato',
                name: g.ranks?.name || 'Novato'
            })
        })

        setConnections(profiles.map(p => ({
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            slug: p.slug,
            rota_number: p.rota_number,
            rank_id: rankMap.get(p.id)?.rank_id || 'novato',
            rank_name: rankMap.get(p.id)?.name || 'Novato'
        })))

        setLoading(false)
    }

    async function loadPendingRequests() {
        const { count } = await supabase
            .from('user_connections')
            .select('*', { count: 'exact', head: true })
            .eq('addressee_id', userId)
            .eq('status', 'pending')

        setPendingCount(count || 0)
    }

    const openNotifications = () => {
        const bellButton = document.querySelector('[data-notification-trigger]') as HTMLButtonElement
        if (bellButton) bellButton.click()
    }

    const getDisplayName = (fullName: string) => {
        const parts = fullName.split(' ')
        if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1]}`
        return fullName
    }

    const getFirstName = (fullName: string) => fullName.split(' ')[0]

    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F1B1A] via-[#1A2421] to-[#0F1B1A] shadow-2xl">
            {/* Borda luminosa */}
            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-br from-blue-500/30 via-transparent to-[#1E4D40]/30" />

            {/* Decoração */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl" />

            <CardContent className="relative p-5">
                {/* Header Premium */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute inset-0 w-10 h-10 rounded-xl bg-blue-500/20 blur-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-[#F2F4F3]">
                                ELOS DA ROTA
                            </h3>
                            <p className="text-[10px] text-[#8B9A8B] uppercase tracking-wide">
                                Sua Rede de Contatos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Contador */}
                        <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-sm font-bold text-blue-400">{connections.length}</span>
                        </div>

                        {/* Notificação */}
                        {pendingCount > 0 && (
                            <button
                                onClick={openNotifications}
                                className="relative p-2 rounded-full bg-[#D2691E]/10 hover:bg-[#D2691E]/20 transition-all duration-300 group"
                            >
                                <Bell className="w-5 h-5 text-[#D2691E] group-hover:animate-swing" />
                                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#D2691E] to-[#B85715] text-[10px] font-black text-white shadow-lg shadow-[#D2691E]/40 animate-pulse">
                                    {pendingCount}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid de Conexões */}
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="relative">
                            <div className="w-10 h-10 border-2 border-blue-500/20 rounded-full" />
                            <div className="absolute top-0 left-0 w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="relative inline-block">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-blue-500/30" />
                            </div>
                            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-blue-500/40 animate-pulse" />
                        </div>
                        <p className="text-sm font-bold text-[#8B9A8B] uppercase tracking-wide">
                            Nenhum elo ainda
                        </p>
                        <p className="text-xs text-[#6B7A6B] mt-1">
                            Conecte-se com outros profissionais
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            {connections.slice(0, 6).map((connection, idx) => (
                                <Link
                                    key={connection.id}
                                    href={getProfileUrl({ full_name: connection.full_name, slug: connection.slug, rota_number: connection.rota_number })}
                                    className={cn(
                                        "group flex flex-col items-center text-center",
                                        "p-3 rounded-xl",
                                        "bg-gradient-to-br from-[#1A2421]/80 to-[#0F1B1A]/60",
                                        "border border-[#2D3B2D]/50",
                                        "hover:border-blue-500/30 hover:from-blue-500/5 hover:to-blue-500/10",
                                        "transition-all duration-300 ease-out",
                                        "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
                                    )}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {/* Avatar */}
                                    <div className="relative mb-2">
                                        <div className="relative">
                                            {connection.avatar_url ? (
                                                <Image
                                                    src={connection.avatar_url}
                                                    alt={connection.full_name}
                                                    width={52}
                                                    height={52}
                                                    className="rounded-full border-2 border-[#2D3B2D] group-hover:border-blue-500/50 transition-colors object-cover"
                                                />
                                            ) : (
                                                <div className="w-[52px] h-[52px] rounded-full border-2 border-[#2D3B2D] bg-gradient-to-br from-[#1E4D40]/20 to-[#1E4D40]/10 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                                                    <span className="text-lg font-bold text-[#1E4D40]">
                                                        {connection.full_name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Glow on hover */}
                                            <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors blur-md" />
                                        </div>

                                        {/* Rank Badge */}
                                        <div className="absolute -bottom-1 -right-1 transform group-hover:scale-110 transition-transform">
                                            <RankInsignia
                                                rankId={connection.rank_id}
                                                size="sm"
                                                variant="avatar"
                                            />
                                        </div>
                                    </div>

                                    {/* Nome */}
                                    <p className="text-[11px] font-semibold text-[#F2F4F3] truncate w-full group-hover:text-blue-300 transition-colors leading-tight">
                                        {getFirstName(connection.full_name)}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* Ver Todos */}
                        {connections.length > 6 && (
                            <Link
                                href={`/profile/${userId}/connections`}
                                className={cn(
                                    "flex items-center justify-center gap-2",
                                    "mt-4 py-2.5 rounded-lg",
                                    "bg-gradient-to-r from-blue-500/5 to-blue-500/10",
                                    "border border-blue-500/20",
                                    "text-xs font-bold text-blue-400 uppercase tracking-wide",
                                    "hover:from-blue-500/10 hover:to-blue-500/15",
                                    "hover:border-blue-500/30",
                                    "transition-all duration-300 group"
                                )}
                            >
                                Ver todos os elos
                                <span className="bg-blue-500/20 px-2 py-0.5 rounded-full text-[10px]">
                                    {connections.length}
                                </span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
