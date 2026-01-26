'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Briefcase, CheckCircle, Clock, TrendingUp,
    Link2, Users, Bell, ChevronRight,
    Swords, Calendar, MapPin,
    Star, Heart, MessageCircle, Share2,
    Camera, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * V8 - GLASS EMERALD
 * Glass morphism com tons de verde esmeralda
 * Backdrop blur e profundidade
 * Gamificação elegante com badges
 */

// ======== PROJECTS COUNTER V8 ========
interface ProjectsCounterV8Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    canShowButton?: boolean
    onRequestProject?: () => void
}

export function ProjectsCounterV8({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV8Props) {
    const totalProjects = completedCount + inProgressCount
    const progress = totalProjects > 0 ? (completedCount / totalProjects) * 100 : 0

    return (
        <Card className="h-[320px] bg-white/30 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col">
                {/* Header com glass effect */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/80 to-teal-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Projetos
                            </h3>
                            <p className="text-xs text-gray-600">
                                Portfólio profissional
                            </p>
                        </div>
                    </div>
                    {/* Badge de total */}
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                        <span className="text-lg font-bold text-emerald-700">{totalProjects}</span>
                    </div>
                </div>

                {/* Barra de progresso visual */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Taxa de conclusão</span>
                        <span className="text-xs font-bold text-emerald-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Stats com 30% opacidade */}
                <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                    <div className="p-4 bg-emerald-500/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-700" />
                            <span className="text-xs font-medium text-gray-700">Concluídos</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-900">{completedCount}</p>
                    </div>
                    <div className="p-4 bg-amber-500/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-amber-700" />
                            <span className="text-xs font-medium text-gray-700">Em Andamento</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">{inProgressCount}</p>
                    </div>
                </div>

                {/* Botão com glass */}
                {canShowButton && (
                    <Button
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg backdrop-blur-sm"
                        onClick={onRequestProject}
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Solicitar Projeto
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

// ======== ELOS DA ROTA V8 ========
interface ElosDaRotaV8Props {
    connections: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        rank_name?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV8({ connections, pendingCount = 0, userId }: ElosDaRotaV8Props) {
    return (
        <Card className="h-[320px] bg-white/30 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/80 to-indigo-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Elos da Rota
                            </h3>
                            <p className="text-xs text-gray-600">
                                {connections.length} conexões
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <button className="relative p-2.5 rounded-xl bg-amber-500/30 backdrop-blur-md hover:bg-amber-500/40 transition-colors">
                            <Bell className="w-5 h-5 text-amber-700" />
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
                                {pendingCount}
                            </span>
                        </button>
                    )}
                </div>

                {connections.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center py-8 px-4 bg-gray-100/50 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 font-medium">
                                Nenhuma conexão ainda
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Comece a expandir sua rede
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Avatares sobrepostos com glass */}
                        <div className="mb-6 p-4 bg-blue-500/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {connections.slice(0, 6).map((conn, idx) => (
                                        <Link
                                            key={conn.id}
                                            href={`/profile/${conn.id}`}
                                            className="relative w-11 h-11 rounded-full bg-white ring-3 ring-white/50 overflow-hidden hover:ring-blue-500/50 hover:z-10 transition-all shadow-lg backdrop-blur-sm"
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
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-white">
                                                        {conn.full_name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                    {connections.length > 6 && (
                                        <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-3 ring-white/50 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                            +{connections.length - 6}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Rede Ativa
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {connections.length} profissionais conectados
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lista compacta */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {connections.slice(0, 4).map((conn) => (
                                <Link
                                    key={conn.id}
                                    href={`/profile/${conn.id}`}
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all border border-white/20"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                width={36}
                                                height={36}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-white">
                                                {conn.full_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {conn.full_name}
                                        </p>
                                        {conn.rank_name && (
                                            <p className="text-xs text-gray-600">{conn.rank_name}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>

                        {connections.length > 4 && (
                            <Link
                                href={`/profile/${userId}/connections`}
                                className="mt-3 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Ver todas ({connections.length})
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V8 ========
interface ConfraternityV8Props {
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

export function ConfraternityStatsV8({ confraternities }: ConfraternityV8Props) {
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
        <Card className="h-[320px] bg-white/30 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/80 to-red-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Confrarias
                        </h3>
                        <p className="text-xs text-gray-600">
                            Próximos encontros
                        </p>
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center py-8 px-4 bg-orange-100/50 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                            <p className="text-sm text-orange-700 font-medium">
                                Nenhum encontro agendado
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                                Organize uma confraria
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {confraternities.slice(0, 3).map((conf) => {
                            const date = formatDate(conf.proposed_date)
                            return (
                                <div
                                    key={conf.id}
                                    className="flex items-center gap-3 p-3 bg-orange-500/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-md hover:bg-orange-500/40 transition-colors"
                                >
                                    {/* Calendário glass */}
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center shadow-md">
                                        <span className="text-lg font-bold text-orange-700">{date.day}</span>
                                        <span className="text-[10px] uppercase text-gray-600 font-medium">{date.month}</span>
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
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
                                        <p className="text-sm font-semibold text-gray-900 truncate">
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
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== NA ROTA FEED V8 ========
interface NaRotaFeedV8Props {
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

export function NaRotaFeedV8({ userId, userName, userAvatar, ratings, portfolio }: NaRotaFeedV8Props) {
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
        <Card className="bg-white/30 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/80 to-pink-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Na Rota
                        </h3>
                        <p className="text-xs text-gray-600">
                            {allItems.length} atividades
                        </p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-white/20 max-h-[600px] overflow-y-auto">
                {allItems.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100/50 backdrop-blur-sm flex items-center justify-center">
                            <Camera className="w-10 h-10 text-purple-400" />
                        </div>
                        <p className="text-base font-medium text-gray-700">
                            Nenhuma atividade ainda
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Compartilhe suas conquistas
                        </p>
                    </div>
                ) : (
                    allItems.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden shadow-md">
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
                                    <p className="text-sm font-semibold text-gray-900">
                                        {userName.split(' ')[0]}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {timeAgo(item.date)}
                                    </p>
                                </div>
                            </div>

                            {item.type === 'rating' && (
                                <div className="p-4 bg-amber-500/30 backdrop-blur-md rounded-xl border border-white/20">
                                    <div className="flex gap-1 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-5 h-5",
                                                    i < item.data.rating
                                                        ? "text-amber-500 fill-amber-500"
                                                        : "text-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    {item.data.comment && (
                                        <p className="text-sm text-gray-700">
                                            {item.data.comment}
                                        </p>
                                    )}
                                </div>
                            )}

                            {item.type === 'portfolio' && item.data.image_url && (
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100/50 backdrop-blur-sm">
                                    <Image
                                        src={item.data.image_url}
                                        alt={item.data.title || 'Projeto'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-6 pt-3">
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-sm font-medium">Curtir</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Comentar</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors">
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
