'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Briefcase, CheckCircle, Clock, TrendingUp, Zap,
    Link2, Users, Bell, ChevronRight, ArrowUpRight, UserPlus,
    Swords, Calendar, MapPin, Sparkles,
    Star, Heart, MessageCircle, Share2, MoreHorizontal,
    Camera, Trophy, Target, Award, Shield, Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * V12 - ULTRA INTERACTIVE
 * Baseado no V6 com interatividade máxima
 * Foco principal: Rota do Valente
 * Hover effects, animações, transições suaves
 */

// ======== ROTA DO VALENTE - CARD PRINCIPAL ========
interface RotaDoValenteV12Props {
    currentXP: number
    nextLevelXP: number
    currentLevel: number
    rankName: string
    totalMedals: number
    vigor: number
    position?: number // Posição no ranking
}

export function RotaDoValenteV12({
    currentXP = 850,
    nextLevelXP = 1000,
    currentLevel = 5,
    rankName = 'Veterano',
    totalMedals = 8,
    vigor = 75,
    position = 12
}: RotaDoValenteV12Props) {
    const progress = (currentXP / nextLevelXP) * 100

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-500 group">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <CardContent className="p-6 relative">
                {/* Header com badge de destaque */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            {/* Pulso animado */}
                            <div className="absolute inset-0 rounded-2xl bg-emerald-500 animate-ping opacity-20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900">
                                    Rota do Valente
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                                    DESTAQUE
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Sua jornada de evolução
                            </p>
                        </div>
                    </div>

                    {/* Badge de posição no ranking */}
                    {position && (
                        <div className="relative group/rank cursor-pointer">
                            <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transform hover:scale-110 transition-all duration-300">
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">#{position}</span>
                                </div>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/rank:opacity-100 transition-opacity whitespace-nowrap">
                                Posição no ranking geral
                            </div>
                        </div>
                    )}
                </div>

                {/* Patente e Nível - Interativo */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 hover:border-emerald-400 transition-all duration-300 cursor-pointer group/rank">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-xl transform group-hover/rank:rotate-12 transition-transform duration-500">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                {/* Anel de nível */}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white">
                                    {currentLevel}
                                </div>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-emerald-900">{rankName}</p>
                                <p className="text-xs text-gray-600">Nível {currentLevel}</p>
                            </div>
                        </div>

                        {/* Stats rápidos */}
                        <div className="flex gap-3">
                            <div className="text-center group/stat cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-1 transform hover:scale-110 transition-transform">
                                    <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                                </div>
                                <p className="text-xs font-bold text-gray-900">{totalMedals}</p>
                                <p className="text-[10px] text-gray-600">Medalhas</p>
                            </div>
                            <div className="text-center group/stat cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-1 transform hover:scale-110 transition-transform">
                                    <Flame className="w-5 h-5 text-red-600" />
                                </div>
                                <p className="text-xs font-bold text-gray-900">{vigor}%</p>
                                <p className="text-[10px] text-gray-600">Vigor</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de progresso XP - Super interativa */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-gray-700">Progresso para próximo nível</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">{currentXP} / {nextLevelXP} Vigor</span>
                    </div>

                    {/* Barra com animação e hover */}
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner group/progress cursor-pointer">
                        {/* Fundo animado */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 opacity-50" />

                        {/* Progresso principal */}
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-full shadow-lg transition-all duration-700 ease-out group-hover/progress:shadow-xl"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Brilho animado */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                        </div>

                        {/* Indicador de porcentagem */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white drop-shadow-lg">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>

                    {/* Faltam X XP */}
                    <p className="text-xs text-gray-600 mt-2 text-center">
                        Faltam <span className="font-bold text-emerald-600">{nextLevelXP - currentXP} Vigor</span> para o próximo nível
                    </p>
                </div>

                {/* Ações rápidas */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        className="h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Ver Missões
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        Ranking
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// ======== PROJECTS COUNTER V12 ========
interface ProjectsCounterV12Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    canShowButton?: boolean
    onRequestProject?: () => void
}

export function ProjectsCounterV12({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV12Props) {
    const totalProjects = completedCount + inProgressCount

    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Projetos
                            </h3>
                            <p className="text-xs text-gray-600">
                                Histórico profissional
                            </p>
                        </div>
                    </div>
                    <div className="text-right transform group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalProjects}</span>
                        <p className="text-[10px] text-gray-600 uppercase">Total</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-center transform hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-4 h-4 text-emerald-600 group-hover/stat:animate-bounce" />
                            <span className="text-lg font-bold text-emerald-700">{completedCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Concluídos</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-center transform hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-amber-600 group-hover/stat:animate-spin" />
                            <span className="text-lg font-bold text-amber-700">{inProgressCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Em Andamento</p>
                    </div>
                </div>

                {canShowButton && (
                    <Button
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={onRequestProject}
                    >
                        Solicitar Projeto
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {showButton && !canShowButton && (
                    <div className="text-center py-2 px-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                        <p className="text-xs text-gray-600">
                            Seu histórico de projetos
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== ELOS DA ROTA V12 ========
interface ElosDaRotaV12Props {
    connections: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        rank_name?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV12({ connections, pendingCount = 0, userId }: ElosDaRotaV12Props) {
    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
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
                        <button className="relative p-2 rounded-xl bg-amber-100 hover:bg-amber-200 transition-all transform hover:scale-110 duration-300 group/bell">
                            <Bell className="w-5 h-5 text-amber-600 group-hover/bell:animate-bounce" />
                            <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-br from-red-500 to-orange-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
                                {pendingCount}
                            </span>
                        </button>
                    )}
                </div>

                {connections.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer">
                        <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                            Ainda não há conexões
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Conecte-se com outros profissionais
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                            <div className="flex -space-x-2">
                                {connections.slice(0, 5).map((conn, idx) => (
                                    <Link
                                        key={conn.id}
                                        href={`/profile/${conn.id}`}
                                        className="relative w-10 h-10 rounded-full bg-white ring-2 ring-white overflow-hidden hover:ring-purple-500 hover:z-10 transition-all shadow-md transform hover:scale-125 duration-300"
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
                                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {conn.full_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                                {connections.length > 5 && (
                                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 ring-2 ring-white flex items-center justify-center text-white text-xs font-bold shadow-md transform hover:scale-125 transition-all duration-300 cursor-pointer">
                                        +{connections.length - 5}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {connections.slice(0, 2).map(c => c.full_name.split(' ')[0]).join(', ')}
                                    {connections.length > 2 && ` e mais ${connections.length - 2}`}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Sua rede profissional
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-3">
                            {connections.slice(0, 3).map((conn) => (
                                <Link
                                    key={conn.id}
                                    href={`/profile/${conn.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-all transform hover:scale-102 hover:shadow-md duration-300 group/conn"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 transform group-hover/conn:scale-110 transition-transform">
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                width={36}
                                                height={36}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-purple-600">
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
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 transform group-hover/conn:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                        </div>

                        {connections.length > 3 && (
                            <Link
                                href={`/profile/${userId}/connections`}
                                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group/link"
                            >
                                Ver todas as conexões
                                <ChevronRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V12 ========
interface ConfraternityV12Props {
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

export function ConfraternityStatsV12({ confraternities }: ConfraternityV12Props) {
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
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
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
                    <div className="text-center py-8 bg-orange-50 rounded-xl border border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-100/50 transition-all cursor-pointer">
                        <Calendar className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                        <p className="text-sm text-orange-700">
                            Nenhuma confraria agendada
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                            Agende um encontro com sua rede
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.slice(0, 3).map((conf) => {
                            const date = formatDate(conf.proposed_date)
                            return (
                                <div
                                    key={conf.id}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all transform hover:scale-102 duration-300 cursor-pointer group/conf"
                                >
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-white border border-orange-200 flex flex-col items-center justify-center shadow-sm transform group-hover/conf:scale-110 transition-transform">
                                        <span className="text-lg font-bold text-orange-700">{date.day}</span>
                                        <span className="text-[10px] uppercase text-gray-600 font-medium">{date.month}</span>
                                    </div>

                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md transform group-hover/conf:rotate-6 transition-transform">
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

// ======== NA ROTA FEED V12 ========
interface NaRotaFeedV12Props {
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

export function NaRotaFeedV12({ userId, userName, userAvatar, ratings, portfolio, posts = [] }: NaRotaFeedV12Props) {
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
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <div className="px-5 py-4 border-b border-gray-200 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Na Rota
                            </h3>
                            <p className="text-xs text-gray-600">
                                {allItems.length} publicações
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-200 relative">
                {allItems.length === 0 ? (
                    <div className="text-center py-12 px-5">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Camera className="w-10 h-10 text-indigo-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                            Nenhuma publicação ainda
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                            As atividades e fotos de {getFirstName(userName)} aparecerão aqui
                        </p>
                    </div>
                ) : (
                    allItems.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors group/post">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden transform group-hover/post:scale-110 transition-transform">
                                        {userAvatar ? (
                                            <Image
                                                src={userAvatar}
                                                alt={userName}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-indigo-600">
                                                {userName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {getFirstName(userName)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatRelativeTime(item.date)}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-1 rounded-full hover:bg-gray-200 transition-colors transform hover:rotate-90 duration-300">
                                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {item.type === 'rating' && (
                                <div className="mb-3">
                                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                                            <span className="text-sm text-gray-900">
                                                Recebeu uma avaliação de <strong>{item.data.reviewer?.full_name || 'Alguém'}</strong>
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-5 h-5 transition-all duration-300",
                                                        i < item.data.rating
                                                            ? "text-amber-500 fill-amber-500 transform hover:scale-125"
                                                            : "text-gray-300"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        {item.data.comment && (
                                            <p className="text-sm text-gray-700 italic">
                                                "{item.data.comment}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.type === 'portfolio' && item.data.image_url && (
                                <div className="mb-3">
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group/image">
                                        <Image
                                            src={item.data.image_url}
                                            alt={item.data.title || 'Projeto'}
                                            fill
                                            className="object-cover transform group-hover/image:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    {item.data.title && (
                                        <p className="text-sm text-gray-900 mt-2 font-medium">
                                            {item.data.title}
                                        </p>
                                    )}
                                    {item.data.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {item.data.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-all transform hover:scale-110 duration-300 group/like">
                                    <Heart className="w-5 h-5 group-hover/like:fill-red-600" />
                                    <span className="text-sm font-medium">Curtir</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-all transform hover:scale-110 duration-300">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Comentar</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-all transform hover:scale-110 duration-300">
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
