'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Briefcase, CheckCircle, Clock,
    Link2, Users, Bell, ChevronRight, ArrowUpRight,
    Swords, Calendar, MapPin,
    Star, Heart, MessageCircle, Send, Bookmark,
    Camera, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * V5 - ELEGANTE FLORESTA
 * Design minimalista e sofisticado
 * Verde predominante com toques sutis de dourado/âmbar
 * Feed de rede social com interações visuais
 */

// ======== PROJECTS COUNTER V5 ========
interface ProjectsCounterV5Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    canShowButton?: boolean
    onRequestProject?: () => void
}

export function ProjectsCounterV5({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV5Props) {
    return (
        <Card className="bg-[#FAFCFA] border-0 shadow-sm ring-1 ring-[#1E4D40]/10">
            <CardContent className="p-6">
                {/* Header minimalista */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E4D40] flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[#1E4D40]">
                            Projetos
                        </h3>
                        <p className="text-sm text-[#6B8068]">
                            Entregas realizadas
                        </p>
                    </div>
                </div>

                {/* Stats elegantes */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 text-center p-4 bg-white rounded-xl shadow-sm">
                        <span className="text-3xl font-light text-[#1E4D40]">{completedCount}</span>
                        <p className="text-xs text-[#6B8068] mt-1 font-medium">Concluídos</p>
                    </div>
                    <div className="flex-1 text-center p-4 bg-white rounded-xl shadow-sm">
                        <span className="text-3xl font-light text-[#B8860B]">{inProgressCount}</span>
                        <p className="text-xs text-[#6B8068] mt-1 font-medium">Em Andamento</p>
                    </div>
                </div>

                {/* Botão suave */}
                {canShowButton && (
                    <Button
                        className="w-full h-12 bg-[#1E4D40] hover:bg-[#163D33] text-white font-medium rounded-xl"
                        onClick={onRequestProject}
                    >
                        Solicitar Projeto
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {showButton && !canShowButton && (
                    <div className="text-center py-3 text-sm text-[#6B8068]">
                        Seu portfólio profissional
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== ELOS DA ROTA V5 ========
interface ElosDaRotaV5Props {
    connections: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        rank_name?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV5({ connections, pendingCount = 0, userId }: ElosDaRotaV5Props) {
    return (
        <Card className="bg-[#FAFCFA] border-0 shadow-sm ring-1 ring-[#1E4D40]/10">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1E4D40] flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-[#1E4D40]">
                                Elos da Rota
                            </h3>
                            <p className="text-sm text-[#6B8068]">
                                {connections.length} conexões
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <button className="relative p-2.5 rounded-xl bg-[#B8860B]/10 text-[#B8860B]">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B8860B] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                {pendingCount}
                            </span>
                        </button>
                    )}
                </div>

                {/* Avatares em círculos sobrepostos */}
                {connections.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#E8F0E8] flex items-center justify-center">
                            <Users className="w-8 h-8 text-[#1E4D40]/30" />
                        </div>
                        <p className="text-sm text-[#6B8068]">
                            Nenhuma conexão ainda
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Avatares sobrepostos */}
                        <div className="flex -space-x-3 mb-4">
                            {connections.slice(0, 6).map((conn, idx) => (
                                <Link
                                    key={conn.id}
                                    href={`/profile/${conn.id}`}
                                    className="relative w-12 h-12 rounded-full bg-white ring-3 ring-[#FAFCFA] overflow-hidden hover:ring-[#1E4D40]/20 hover:z-10 transition-all"
                                    style={{ zIndex: 6 - idx }}
                                >
                                    {conn.avatar_url ? (
                                        <Image
                                            src={conn.avatar_url}
                                            alt={conn.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {conn.full_name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                            {connections.length > 6 && (
                                <Link
                                    href={`/profile/${userId}/connections`}
                                    className="relative w-12 h-12 rounded-full bg-[#1E4D40] ring-3 ring-[#FAFCFA] flex items-center justify-center text-white text-sm font-bold"
                                >
                                    +{connections.length - 6}
                                </Link>
                            )}
                        </div>

                        {/* Link para ver todos */}
                        <Link
                            href={`/profile/${userId}/connections`}
                            className="flex items-center justify-center gap-2 text-sm font-medium text-[#1E4D40] hover:text-[#B8860B] transition-colors"
                        >
                            Ver todas
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V5 ========
interface ConfraternityV5Props {
    confraternities: Array<{
        id: string
        proposed_date: string
        location: string
        partner: {
            full_name: string
            avatar_url?: string | null
        }
    }>
}

export function ConfraternityStatsV5({ confraternities }: ConfraternityV5Props) {
    const formatDate = (date: string) => {
        const d = new Date(date)
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    return (
        <Card className="bg-[#FAFCFA] border-0 shadow-sm ring-1 ring-[#B8860B]/20">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#B8860B] flex items-center justify-center">
                        <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[#1E4D40]">
                            Confrarias
                        </h3>
                        <p className="text-sm text-[#6B8068]">
                            Próximos encontros
                        </p>
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#FDF8F0] flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-[#B8860B]/30" />
                        </div>
                        <p className="text-sm text-[#6B8068]">
                            Nenhum encontro agendado
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.slice(0, 3).map((conf) => {
                            const date = formatDate(conf.proposed_date)
                            return (
                                <div
                                    key={conf.id}
                                    className="flex items-center gap-4 p-3 bg-white rounded-xl"
                                >
                                    {/* Calendário visual */}
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-[#FDF8F0] flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-[#B8860B]">{date.day}</span>
                                        <span className="text-[10px] uppercase text-[#6B8068]">{date.month}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1E4D40] truncate">
                                            {conf.partner?.full_name}
                                        </p>
                                        <p className="text-xs text-[#6B8068]">{date.time}</p>
                                        {conf.location && (
                                            <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{conf.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== NA ROTA FEED V5 - ESTILO INSTAGRAM ========
interface NaRotaFeedV5Props {
    userId: string
    userName: string
    userAvatar?: string | null
    ratings: Array<{
        id: string
        rating: number
        comment?: string
        created_at: string
        reviewer?: { full_name: string; avatar_url?: string }
    }>
    portfolio: any[]
}

export function NaRotaFeedV5({ userId, userName, userAvatar, ratings, portfolio }: NaRotaFeedV5Props) {
    const allItems = [
        ...ratings.map(r => ({ type: 'rating' as const, date: r.created_at, data: r })),
        ...portfolio.map(p => ({ type: 'portfolio' as const, date: p.created_at, data: p }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const timeAgo = (date: string) => {
        const now = new Date()
        const d = new Date(date)
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
        if (diff < 60) return 'agora'
        if (diff < 3600) return `${Math.floor(diff / 60)}min`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }

    return (
        <Card className="bg-white border-0 shadow-sm overflow-hidden">
            {/* Header do feed */}
            <div className="px-6 py-4 border-b border-[#E8EDE8] bg-[#FAFCFA]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E4D40] to-[#B8860B] flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[#1E4D40]">
                            Na Rota
                        </h3>
                        <p className="text-sm text-[#6B8068]">
                            Publicações recentes
                        </p>
                    </div>
                </div>
            </div>

            {/* Posts */}
            {allItems.length === 0 ? (
                <div className="text-center py-16 px-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F0F5F0] flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-[#1E4D40]/20" />
                    </div>
                    <p className="text-base font-medium text-[#6B8068]">
                        Ainda não há publicações
                    </p>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        As fotos e atividades aparecerão aqui
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[#E8EDE8]">
                    {allItems.slice(0, 5).map((item, idx) => (
                        <article key={idx} className="pb-4">
                            {/* Header do post */}
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A]">
                                        {userAvatar ? (
                                            <Image
                                                src={userAvatar}
                                                alt={userName}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-sm font-bold text-white">
                                                    {userName.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#1E4D40]">
                                            {userName.split(' ')[0]}
                                        </p>
                                        <p className="text-xs text-[#9CA3AF]">
                                            {timeAgo(item.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            {item.type === 'rating' && (
                                <div className="px-4 pb-3">
                                    <div className="p-4 bg-gradient-to-br from-[#FDF8F0] to-[#FFFBF5] rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-[#1E4D40]">
                                                Avaliação de <strong>{item.data.reviewer?.full_name?.split(' ')[0]}</strong>
                                            </span>
                                        </div>
                                        <div className="flex gap-1 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-5 h-5",
                                                        i < item.data.rating
                                                            ? "text-[#B8860B] fill-[#B8860B]"
                                                            : "text-[#E8EDE8]"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        {item.data.comment && (
                                            <p className="text-sm text-[#4B5563]">
                                                {item.data.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.type === 'portfolio' && item.data.image_url && (
                                <div className="relative aspect-square bg-[#F0F5F0]">
                                    <Image
                                        src={item.data.image_url}
                                        alt={item.data.title || 'Projeto'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Ações estilo Instagram */}
                            <div className="px-4 pt-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button className="hover:scale-110 transition-transform">
                                            <Heart className="w-6 h-6 text-[#1E4D40]" />
                                        </button>
                                        <button className="hover:scale-110 transition-transform">
                                            <MessageCircle className="w-6 h-6 text-[#1E4D40]" />
                                        </button>
                                        <button className="hover:scale-110 transition-transform">
                                            <Send className="w-6 h-6 text-[#1E4D40]" />
                                        </button>
                                    </div>
                                    <button className="hover:scale-110 transition-transform">
                                        <Bookmark className="w-6 h-6 text-[#1E4D40]" />
                                    </button>
                                </div>

                                {/* Descrição */}
                                {item.type === 'portfolio' && item.data.title && (
                                    <p className="text-sm text-[#1E4D40] mt-3">
                                        <strong>{userName.split(' ')[0]}</strong>{' '}
                                        <span className="text-[#4B5563]">{item.data.title}</span>
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </Card>
    )
}
