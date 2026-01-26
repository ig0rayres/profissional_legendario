'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Briefcase, CheckCircle, Clock,
    Link2, Users, Bell, ChevronRight, ArrowUpRight,
    Swords, Calendar, MapPin,
    Star, Heart, MessageCircle, Share2, MoreHorizontal,
    Camera, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * V7 - PREMIUM DARK
 * Fundo escuro sofisticado com acentos dourados
 * Visual premium e exclusivo
 * Ideal para perfis de alto nível
 */

// ======== PROJECTS COUNTER V7 ========
interface ProjectsCounterV7Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    canShowButton?: boolean
    onRequestProject?: () => void
}

export function ProjectsCounterV7({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV7Props) {
    const totalProjects = completedCount + inProgressCount

    return (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#3a3a3a] shadow-xl">
            <CardContent className="p-5">
                {/* Header premium */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B8860B] to-[#D4AF37] flex items-center justify-center shadow-lg">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">
                                Projetos
                            </h3>
                            <p className="text-xs text-gray-400">
                                Portfólio executivo
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#B8860B] to-[#D4AF37] bg-clip-text text-transparent">{totalProjects}</span>
                        <p className="text-[10px] text-gray-500 uppercase">Total</p>
                    </div>
                </div>

                {/* Stats com brilho */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#1E4D40]/20 border border-[#1E4D40]/30 rounded-xl text-center backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-4 h-4 text-[#4ADE80]" />
                            <span className="text-lg font-bold text-white">{completedCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Concluídos</p>
                    </div>
                    <div className="p-3 bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-xl text-center backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-lg font-bold text-white">{inProgressCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Em Andamento</p>
                    </div>
                </div>

                {/* Botão premium */}
                {canShowButton && (
                    <Button
                        className="w-full h-11 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8860B] text-white font-semibold rounded-xl transition-all shadow-lg"
                        onClick={onRequestProject}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Solicitar Projeto
                    </Button>
                )}

                {showButton && !canShowButton && (
                    <div className="text-center py-2 px-3 bg-[#2d2d2d] rounded-xl border border-[#3a3a3a]">
                        <p className="text-xs text-gray-500">
                            Histórico profissional
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== ELOS DA ROTA V7 ========
interface ElosDaRotaV7Props {
    connections: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        rank_name?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV7({ connections, pendingCount = 0, userId }: ElosDaRotaV7Props) {
    return (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#3a3a3a] shadow-xl">
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-lg">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">
                                Elos da Rota
                            </h3>
                            <p className="text-xs text-gray-400">
                                {connections.length} conexões
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <button className="relative p-2 rounded-xl bg-[#B8860B]/20 hover:bg-[#B8860B]/30 transition-colors">
                            <Bell className="w-5 h-5 text-[#D4AF37]" />
                            <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
                                {pendingCount}
                            </span>
                        </button>
                    )}
                </div>

                {connections.length === 0 ? (
                    <div className="text-center py-8 bg-[#2d2d2d] rounded-xl border border-[#3a3a3a]">
                        <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                            Ainda não há conexões
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Expanda sua rede profissional
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Avatares com glow */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex -space-x-2">
                                {connections.slice(0, 5).map((conn, idx) => (
                                    <Link
                                        key={conn.id}
                                        href={`/profile/${conn.id}`}
                                        className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] ring-2 ring-[#2d2d2d] overflow-hidden hover:ring-[#B8860B] hover:z-10 transition-all shadow-lg"
                                        style={{ zIndex: 5 - idx }}
                                    >
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {conn.full_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                                {connections.length > 5 && (
                                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4AF37] ring-2 ring-[#2d2d2d] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                        +{connections.length - 5}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">
                                    {connections.slice(0, 2).map(c => c.full_name.split(' ')[0]).join(', ')}
                                    {connections.length > 2 && ` e mais ${connections.length - 2}`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Rede premium
                                </p>
                            </div>
                        </div>

                        {/* Lista */}
                        <div className="space-y-2 mb-3">
                            {connections.slice(0, 3).map((conn) => (
                                <Link
                                    key={conn.id}
                                    href={`/profile/${conn.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2d2d2d] transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                width={36}
                                                height={36}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-white">
                                                {conn.full_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {conn.full_name}
                                        </p>
                                        {conn.rank_name && (
                                            <p className="text-xs text-gray-400">{conn.rank_name}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>

                        {connections.length > 3 && (
                            <Link
                                href={`/profile/${userId}/connections`}
                                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-[#D4AF37] hover:text-[#B8860B] transition-colors"
                            >
                                Ver todas as conexões
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V7 ========
interface ConfraternityV7Props {
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

export function ConfraternityStatsV7({ confraternities }: ConfraternityV7Props) {
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
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#3a3a3a] shadow-xl">
            <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#FF8C42] flex items-center justify-center shadow-lg">
                        <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">
                            Confrarias
                        </h3>
                        <p className="text-xs text-gray-400">
                            Próximos encontros
                        </p>
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="text-center py-8 bg-[#2d2d2d] rounded-xl border border-[#3a3a3a]">
                        <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                            Nenhuma confraria agendada
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Agende encontros exclusivos
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.slice(0, 3).map((conf) => {
                            const date = formatDate(conf.proposed_date)
                            return (
                                <div
                                    key={conf.id}
                                    className="flex items-center gap-3 p-3 bg-[#2d2d2d] rounded-xl border border-[#3a3a3a] hover:border-[#D2691E]/50 transition-colors"
                                >
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#D2691E]/20 to-[#FF8C42]/20 border border-[#D2691E]/30 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-[#FF8C42]">{date.day}</span>
                                        <span className="text-[10px] uppercase text-gray-400 font-medium">{date.month}</span>
                                    </div>

                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#FF8C42] flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                        <p className="text-sm font-semibold text-white truncate">
                                            {conf.partner?.full_name}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                            <span className="capitalize">{date.weekday}</span>
                                            <span>•</span>
                                            <span>{date.time}</span>
                                        </div>
                                        {conf.location && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
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

// ======== NA ROTA FEED V7 ========
interface NaRotaFeedV7Props {
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
    posts?: Array<{
        id: string
        image_url: string
        caption?: string
        likes: number
        comments: number
        created_at: string
    }>
}

export function NaRotaFeedV7({ userId, userName, userAvatar, ratings, portfolio, posts = [] }: NaRotaFeedV7Props) {
    const allItems = [
        ...ratings.map(r => ({ type: 'rating' as const, date: r.created_at, data: r })),
        ...portfolio.map(p => ({ type: 'portfolio' as const, date: p.created_at, data: p })),
        ...posts.map(p => ({ type: 'post' as const, date: p.created_at, data: p }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const formatRelativeTime = (date: string) => {
        const now = new Date()
        const d = new Date(date)
        const diffMs = now.getTime() - d.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'agora'
        if (diffMins < 60) return `${diffMins}min`
        if (diffHours < 24) return `${diffHours}h`
        if (diffDays < 7) return `${diffDays}d`
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }

    const getFirstName = (name: string) => name.split(' ')[0]

    return (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#3a3a3a] shadow-xl">
            <div className="px-5 py-4 border-b border-[#3a3a3a]">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] via-[#B8860B] to-[#D2691E] flex items-center justify-center shadow-lg">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">
                            Na Rota
                        </h3>
                        <p className="text-xs text-gray-400">
                            {allItems.length} publicações
                        </p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-[#3a3a3a]">
                {allItems.length === 0 ? (
                    <div className="text-center py-12 px-5">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                            <Camera className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">
                            Nenhuma publicação ainda
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Compartilhe suas conquistas
                        </p>
                    </div>
                ) : (
                    allItems.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center overflow-hidden">
                                        {userAvatar ? (
                                            <Image
                                                src={userAvatar}
                                                alt={userName}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-white">
                                                {userName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {getFirstName(userName)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatRelativeTime(item.date)}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-1 rounded-full hover:bg-[#2d2d2d] transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {item.type === 'rating' && (
                                <div className="mb-3">
                                    <div className="p-4 bg-[#2d2d2d] rounded-xl border border-[#3a3a3a]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                                            <span className="text-sm text-gray-300">
                                                Avaliação de <strong className="text-white">{item.data.reviewer?.full_name || 'Alguém'}</strong>
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-5 h-5",
                                                        i < item.data.rating
                                                            ? "text-[#D4AF37] fill-[#D4AF37]"
                                                            : "text-gray-700"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        {item.data.comment && (
                                            <p className="text-sm text-gray-400 italic">
                                                "{item.data.comment}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.type === 'portfolio' && item.data.image_url && (
                                <div className="mb-3">
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#2d2d2d]">
                                        <Image
                                            src={item.data.image_url}
                                            alt={item.data.title || 'Projeto'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {item.data.title && (
                                        <p className="text-sm text-white mt-2 font-medium">
                                            {item.data.title}
                                        </p>
                                    )}
                                    {item.data.description && (
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                            {item.data.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-sm font-medium">Curtir</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Comentar</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Compartilhar</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}
