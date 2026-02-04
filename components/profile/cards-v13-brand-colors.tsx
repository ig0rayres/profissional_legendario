'use client'

import { useState, useEffect } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { getProfileUrl } from '@/lib/profile/utils'
import { useRouter } from 'next/navigation'
import { CreatePostModal } from '@/components/social/create-post-modal'
import { CreatePostModalV2 } from '@/components/social/create-post-modal-v2'
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { useAvatarConfig } from '@/hooks/use-avatar-config'
import { useAuth } from '@/lib/auth/context'


/**
 * V13 - BRAND COLORS
 * Cores estritamente do projeto
 * Verde Rota #1E4D40 (principal)
 * Laranja #D2691E (moderado/destaque)
 * Cinza #2D3142 (textos)
 * Tons de cinza claro (backgrounds)
 */

// ======== ROTA DO VALENTE V13 - BRAND COLORS ========
interface RotaDoValenteV13Props {
    currentXP: number
    nextLevelXP: number
    currentLevel: number
    rankName: string
    totalMedals: number
    vigor: number
    position?: number
}

export function RotaDoValenteV13({
    currentXP = 850,
    nextLevelXP = 1000,
    currentLevel = 5,
    rankName = 'Veterano',
    totalMedals = 8,
    vigor = 75,
    position = 12
}: RotaDoValenteV13Props) {
    const progress = (currentXP / nextLevelXP) * 100

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-[#1E4D40]/20 shadow-xl hover:shadow-2xl hover:border-[#1E4D40]/40 transition-all duration-500 group">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <CardContent className="p-6 relative">
                {/* Header com badge de destaque */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            {/* Pulso animado */}
                            <div className="absolute inset-0 rounded-2xl bg-[#1E4D40] animate-ping opacity-20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-[#2D3142]">
                                    Rota do Valente
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#D2691E] text-[10px] font-bold text-white shadow-md animate-pulse">
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
                            <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] shadow-lg transform hover:scale-110 transition-all duration-300">
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">#{position}</span>
                                </div>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-[#2D3142] text-white text-xs rounded-lg opacity-0 group-hover/rank:opacity-100 transition-opacity whitespace-nowrap z-10">
                                Posição no ranking geral
                            </div>
                        </div>
                    )}
                </div>

                {/* Patente e Nível - Interativo */}
                <div className="mb-6 p-4 rounded-2xl bg-[#1E4D40]/5 border border-[#1E4D40]/20 hover:border-[#1E4D40]/40 hover:bg-[#1E4D40]/10 transition-all duration-300 cursor-pointer group/rank">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-xl transform group-hover/rank:rotate-12 transition-transform duration-500">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                {/* Anel de nível */}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D2691E] flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white">
                                    {currentLevel}
                                </div>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-[#1E4D40]">{rankName}</p>
                                <p className="text-xs text-gray-600">Nível {currentLevel}</p>
                            </div>
                        </div>

                        {/* Stats rápidos */}
                        <div className="flex gap-3">
                            <div className="text-center group/stat cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-[#D2691E]/10 border border-[#D2691E]/20 flex items-center justify-center mb-1 transform hover:scale-105 hover:shadow-md hover:border-[#D2691E]/30 transition-all duration-300 cursor-pointer group/stat">
                                    <Star className="w-5 h-5 text-[#D2691E] fill-[#D2691E]" />
                                </div>
                                <p className="text-xs font-bold text-[#2D3142]">{totalMedals}</p>
                                <p className="text-[10px] text-gray-600">Medalhas</p>
                            </div>
                            <div className="text-center group/stat cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-[#1E4D40]/10 border border-[#1E4D40]/20 flex items-center justify-center mb-1 transform hover:scale-105 hover:shadow-md hover:border-[#1E4D40]/30 transition-all duration-300 cursor-pointer group/stat">
                                    <Flame className="w-5 h-5 text-[#1E4D40]" />
                                </div>
                                <p className="text-xs font-bold text-[#2D3142]">{vigor}%</p>
                                <p className="text-[10px] text-gray-600">Vigor</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de progresso XP */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#1E4D40]" />
                            <span className="text-xs font-semibold text-gray-700">Progresso para próximo nível</span>
                        </div>
                        <span className="text-xs font-bold text-[#1E4D40]">{currentXP} / {nextLevelXP} Vigor</span>
                    </div>

                    {/* Barra com animação */}
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner group/progress cursor-pointer">
                        {/* Fundo */}
                        <div className="absolute inset-0 bg-gray-100" />

                        {/* Progresso principal */}
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] rounded-full shadow-lg transition-all duration-700 ease-out group-hover/progress:shadow-xl"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Brilho animado */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
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
                        Faltam <span className="font-bold text-[#1E4D40]">{nextLevelXP - currentXP} Vigor</span> para o próximo nível
                    </p>
                </div>

                {/* Ações rápidas */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        className="h-12 bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] hover:from-[#163D33] hover:to-[#1E4D40] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Ver Missões
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 border-2 border-[#1E4D40] text-[#1E4D40] hover:bg-[#1E4D40]/5 font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        Ranking
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// ======== PROJECTS COUNTER V13 ========
interface ProjectsCounterV13Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    canShowButton?: boolean
    onRequestProject?: () => void
    targetUserId?: string
    targetUserName?: string
}

export function ProjectsCounterV13({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV13Props) {
    const totalProjects = completedCount + inProgressCount

    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 group overflow-hidden">
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Projetos
                            </h3>
                            <p className="text-xs text-gray-600">
                                Histórico profissional
                            </p>
                        </div>
                    </div>
                    <div className="text-right transform group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-[#1E4D40]">{totalProjects}</span>
                        <p className="text-[10px] text-gray-600 uppercase">Total</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#1E4D40]/5 border border-[#1E4D40]/10 rounded-xl text-center transform hover:scale-105 hover:shadow-md hover:border-[#1E4D40]/30 transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-4 h-4 text-[#1E4D40] group-hover/stat:animate-bounce" />
                            <span className="text-lg font-bold text-[#1E4D40]">{completedCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Concluídos</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center transform hover:scale-105 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-gray-600 group-hover/stat:animate-spin" />
                            <span className="text-lg font-bold text-gray-700">{inProgressCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Em Andamento</p>
                    </div>
                </div>

                {canShowButton && (
                    <Button
                        className="w-full h-11 bg-[#D2691E] hover:bg-[#B85715] text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
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

// ======== ELOS DA ROTA V13 ========
interface ElosDaRotaV13Props {
    connections?: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        slug?: string
        rota_number?: string | null
        rank_name?: string
        rank_id?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV13({ connections: propConnections, pendingCount: propPendingCount, userId }: ElosDaRotaV13Props) {
    const [connections, setConnections] = useState(propConnections || [])
    const [pendingCount, setPendingCount] = useState(propPendingCount || 0)
    const [loading, setLoading] = useState(!propConnections)
    const [showPendingPopup, setShowPendingPopup] = useState(false)
    const [pendingRequests, setPendingRequests] = useState<any[]>([])
    const [loadingPending, setLoadingPending] = useState(false)
    const supabase = createClient()
    const { user } = useAuth() // 🔒 SEGURANÇA: só mostra solicitações para o dono

    // Carregar configurações de avatar do banco
    const { sizes: avatarSizes } = useAvatarConfig('elo', 'desktop')

    useEffect(() => {
        // Se connections foram passadas como prop, não carrega
        if (propConnections) {
            setConnections(propConnections)
            setPendingCount(propPendingCount || 0)
            return
        }

        // Caso contrário, carrega os dados
        loadConnections()
    }, [userId, propConnections])

    async function loadConnections() {
        try {
            // Buscar conexões aceitas
            const { data: acceptedData, error: acceptedError } = await supabase
                .from('user_connections')
                .select(`
                    id,
                    requester_id,
                    addressee_id,
                    requester:profiles!user_connections_requester_id_fkey(id, full_name, avatar_url, slug, rota_number),
                    addressee:profiles!user_connections_addressee_id_fkey(id, full_name, avatar_url, slug, rota_number)
                `)
                .eq('status', 'accepted')
                .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
                .limit(12)

            if (acceptedError) throw acceptedError

            console.log('[Connections] Raw data:', acceptedData)

            // Coletar IDs dos parceiros para buscar ranks
            const partnerIds = (acceptedData || []).map((conn: any) => {
                const isAddressee = conn.addressee_id === userId
                return isAddressee ? conn.requester_id : conn.addressee_id
            }).filter(Boolean)

            // Buscar ranks dos parceiros
            let rankMap: Record<string, string> = {}
            if (partnerIds.length > 0) {
                const { data: gamifData } = await supabase
                    .from('user_gamification')
                    .select('user_id, current_rank_id')
                    .in('user_id', partnerIds)

                if (gamifData) {
                    rankMap = Object.fromEntries(
                        gamifData.map((g: any) => [g.user_id, g.current_rank_id || 'novato'])
                    )
                }
            }

            // Formatar conexões
            const formatted = (acceptedData || [])
                .map((connection: any) => {
                    const isAddressee = connection.addressee_id === userId
                    const partnerId = isAddressee ? connection.requester_id : connection.addressee_id
                    const partner = isAddressee ? connection.requester : connection.addressee

                    // Verificar se partner existe e tem dados válidos
                    if (!partner || !partner.id) {
                        console.warn('[Connections] Partner inválido:', connection)
                        return null
                    }

                    return {
                        id: partner.id,
                        slug: partner.slug,
                        rota_number: partner.rota_number,
                        full_name: partner.full_name || 'Usuário',
                        avatar_url: partner.avatar_url,
                        rank_id: rankMap[partnerId] || 'novato',
                        rank_name: rankMap[partnerId] || 'novato'
                    }
                })
                .filter(Boolean) // Remove conexões inválidas

            setConnections(formatted)

            // Buscar convites pendentes
            const { count } = await supabase
                .from('user_connections')
                .select('*', { count: 'exact', head: true })
                .eq('addressee_id', userId)
                .eq('status', 'pending')

            setPendingCount(count || 0)
        } catch (error) {
            console.error('Error loading connections:', error)
        } finally {
            setLoading(false)
        }
    }

    async function loadPendingRequests() {
        if (loadingPending) return
        setLoadingPending(true)

        try {
            const { data, error } = await supabase
                .from('user_connections')
                .select(`
                    id,
                    requester_id,
                    created_at,
                    requester:profiles!user_connections_requester_id_fkey(id, full_name, avatar_url, slug, rota_number)
                `)
                .eq('addressee_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error

            setPendingRequests(data || [])
        } catch (error) {
            console.error('Error loading pending requests:', error)
        } finally {
            setLoadingPending(false)
        }
    }

    async function handleAcceptConnection(connectionId: string, requesterId: string, requesterName: string) {
        console.log('[ELO] Aceitando conexão:', connectionId)
        try {
            const { data, error } = await supabase
                .from('user_connections')
                .update({ status: 'accepted', accepted_at: new Date().toISOString() })
                .eq('id', connectionId)
                .eq('status', 'pending') // 🔒 ANTI-FARM: Só aceita se ainda estiver pending
                .select()

            console.log('[ELO] Resultado:', { data, error })

            if (error) {
                console.error('[ELO] Erro:', error)
                alert('Erro ao aceitar: ' + error.message)
                return
            }

            // 🎮 GAMIFICAÇÃO: +pontos por ACEITAR elo
            console.log('[ELO] 🎮 Iniciando gamificação de aceite...')
            try {
                const { useAuth } = await import('@/lib/auth/context')
                const { awardPoints, awardBadge, checkEloPointsAlreadyAwarded } = await import('@/lib/api/gamification')
                const { getActionPoints } = await import('@/lib/services/point-actions-service')

                // Pegar user ID do contexto - alternativa sem hooks
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    console.log('[ELO] User ID:', user.id, 'Requester ID:', requesterId)

                    // Verificar se já recebeu pontos por este elo (anti-farming)
                    const alreadyAwarded = await checkEloPointsAlreadyAwarded(user.id, requesterId, 'elo_accepted')
                    console.log('[ELO] Anti-farming result:', alreadyAwarded)

                    if (!alreadyAwarded) {
                        // Dar pontos ao usuário que aceitou
                        const points = await getActionPoints('elo_accepted')
                        console.log('[ELO] Pontos a creditar:', points)

                        const result = await awardPoints(
                            user.id,
                            points,
                            'elo_accepted',
                            `Aceitou elo com ${requesterName}`,
                            { target_user_id: requesterId } // Para verificação de duplicação
                        )
                        console.log('[ELO] ✅ awardPoints resultado:', result)

                        // Verificar se é o primeiro elo (medalha "presente")
                        const { count } = await supabase
                            .from('user_connections')
                            .select('*', { count: 'exact', head: true })
                            .eq('addressee_id', user.id)
                            .eq('status', 'accepted')

                        console.log('[ELO] Total de elos aceitos:', count)

                        if (count === 1) {
                            console.log('[ELO] 🏅 Primeiro elo! Concedendo medalha  "Presente"...')
                            await awardBadge(user.id, 'presente')
                            console.log('[ELO] ✅ Medalha "Presente" concedida!')
                        }
                    } else {
                        console.log('[ELO] ⚠️ Pontos de aceite já creditados para este par de usuários')
                    }
                } else {
                    console.error('[ELO] ❌ Usuário não autenticado')
                }
            } catch (gamifError) {
                console.error('[ELO] ❌ Erro de gamificação:', gamifError)
            }

            // Remover da lista e atualizar contagem
            setPendingRequests(prev => prev.filter(r => r.id !== connectionId))
            setPendingCount(prev => Math.max(0, prev - 1))

            // Fechar popup se não houver mais pendentes
            if (pendingRequests.length <= 1) {
                setShowPendingPopup(false)
            }

            // Recarregar conexões
            loadConnections()
        } catch (error: any) {
            console.error('[ELO] Exception:', error)
            alert('Erro: ' + error.message)
        }
    }

    async function handleRejectConnection(connectionId: string) {
        try {
            const { error } = await supabase
                .from('user_connections')
                .update({ status: 'rejected' })
                .eq('id', connectionId)

            if (error) throw error

            setPendingRequests(prev => prev.filter(r => r.id !== connectionId))
            setPendingCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error rejecting connection:', error)
        }
    }

    function handleBellClick() {
        setShowPendingPopup(!showPendingPopup)
        if (!showPendingPopup && pendingRequests.length === 0) {
            loadPendingRequests()
        }
    }

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-md">
                <CardContent className="p-5">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1E4D40] border-t-transparent" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getDisplayName = (fullName: string) => {
        const parts = fullName.split(' ')
        if (parts.length >= 2) {
            return `${parts[0]} ${parts[parts.length - 1]}`
        }
        return fullName
    }

    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Elos da Rota
                            </h3>
                            <p className="text-xs text-gray-600">
                                {connections.length} conexões
                            </p>
                        </div>
                    </div>

                    {/* 🔒 SEGURANÇA: Sino de solicitações só aparece para o dono do perfil */}
                    {pendingCount > 0 && user?.id === userId && (
                        <div className="relative">
                            <button
                                onClick={handleBellClick}
                                className="relative p-2 rounded-xl bg-[#1E4D40]/10 border border-[#1E4D40]/20 hover:bg-[#1E4D40]/20 transition-all transform hover:scale-110 duration-300 group/bell"
                            >
                                <Bell className="w-5 h-5 text-[#1E4D40] group-hover/bell:animate-bounce" />
                                <span className="absolute top-0 right-0 w-5 h-5 bg-[#1E4D40] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
                                    {pendingCount}
                                </span>
                            </button>

                            {/* Popup de solicitações pendentes - FIXED para não ser cortado */}
                            {showPendingPopup && (
                                <div className="fixed right-4 top-20 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden">
                                    <div className="bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] p-3">
                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            Solicitações de Elo
                                        </h4>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto">
                                        {loadingPending ? (
                                            <div className="p-4 text-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1E4D40] border-t-transparent mx-auto" />
                                            </div>
                                        ) : pendingRequests.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                Nenhuma solicitação pendente
                                            </div>
                                        ) : (
                                            pendingRequests.map((request: any) => (
                                                <div key={request.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                            {request.requester?.avatar_url ? (
                                                                <img src={request.requester.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                                                    {request.requester?.full_name?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                                {request.requester?.full_name || 'Usuário'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Quer conectar com você
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleAcceptConnection(request.id, request.requester_id, request.requester?.full_name || 'Usuário')}
                                                            className="flex-1 py-1.5 bg-[#1E4D40] text-white text-xs font-medium rounded-lg hover:bg-[#2A6B5A] transition-colors"
                                                        >
                                                            Aceitar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectConnection(request.id)}
                                                            className="flex-1 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                                        >
                                                            Recusar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowPendingPopup(false)}
                                        className="w-full p-2 text-center text-xs text-gray-500 hover:bg-gray-50 border-t border-gray-100"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {connections.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-[#1E4D40]/30 hover:bg-[#1E4D40]/5 transition-all cursor-pointer">
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
                        {/* GRID 4 COLUNAS - Mostra até 12 elos */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {connections.slice(0, 12).map((conn) => (
                                <Link
                                    key={conn.id}
                                    href={getProfileUrl({ full_name: conn.full_name, slug: conn.slug, rota_number: conn.rota_number })}
                                    className="group flex flex-col items-center text-center"
                                >
                                    <div className="relative mb-2">
                                        <div
                                            className="relative"
                                            style={avatarSizes ? {
                                                width: `${avatarSizes.frameSize}px`,
                                                height: `${avatarSizes.frameSize}px`,
                                            } : undefined}
                                        >
                                            <LogoFrameAvatar
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                size="sm"
                                                className={avatarSizes ? 'w-full h-full' : 'w-12 h-12'}
                                            />
                                        </div>
                                        {/* Badge de patente no canto - CORRIGIDO */}
                                        {conn.rank_id && (
                                            <div
                                                className="absolute bottom-[1px] right-[1px] z-[5]"
                                            >
                                                <RankInsignia
                                                    rankId={conn.rank_id}
                                                    size="xs"
                                                    variant="icon-only"
                                                    className="w-[28px] h-[28px] border-[1.5px] border-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-medium text-[#2D3142] truncate w-full group-hover:text-[#1E4D40] transition-colors leading-tight">
                                        {getDisplayName(conn.full_name)}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {connections.length > 12 && (
                            <div className="text-center pt-2 border-t border-gray-200">
                                <Link
                                    href={`/profile/${userId}/connections`}
                                    className="inline-flex items-center gap-2 py-2 text-sm font-medium text-[#1E4D40] hover:text-[#163D33] transition-colors group/link"
                                >
                                    Ver todas as conexões ({connections.length})
                                    <ChevronRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V13 ========
interface ConfraternityV13Props {
    confraternities?: Array<{
        id: string
        proposed_date: string
        location: string
        partner: {
            full_name: string
            avatar_url?: string | null
        }
    }>
    userId?: string
}

export function ConfraternityStatsV13({ confraternities: propConfraternities, userId }: ConfraternityV13Props) {
    const [confraternities, setConfraternities] = useState(propConfraternities || [])
    const [counters, setCounters] = useState({ current_month_count: 0, total_count: 0 })
    const [pendingInvitesCount, setPendingInvitesCount] = useState(0)
    const [loading, setLoading] = useState(!propConfraternities && !!userId)
    const supabase = createClient()
    const router = useRouter()
    const { user } = useAuth() // 🔒 SEGURANÇA: só mostra convites para o dono

    useEffect(() => {
        // Se confraternities foram passadas como prop, não carrega
        if (propConfraternities) {
            setConfraternities(propConfraternities)
        }

        // Se tem userId, carrega os dados
        if (userId) {
            loadConfraternities()
            loadCounters()
            // 🔒 SEGURANÇA: Só carrega convites pendentes se for o dono do perfil
            if (user?.id === userId) {
                loadPendingInvites()
            }
        }
    }, [userId, propConfraternities])

    // Estado para controlar o modal de nova publicação
    const [showCreatePostModal, setShowCreatePostModal] = useState(false)
    const [selectedConfForPost, setSelectedConfForPost] = useState<string | undefined>(undefined)

    const [showInvitesPopup, setShowInvitesPopup] = useState(false)
    const [pendingInvites, setPendingInvites] = useState<Array<{
        id: string
        sender: { id: string; full_name: string; avatar_url: string | null }
        proposed_date: string | null
        location: string | null
        message: string | null
    }>>([])
    const [processingInvite, setProcessingInvite] = useState<string | null>(null)

    async function loadPendingInvites() {
        if (!userId) return
        try {
            const { data, count } = await supabase
                .from('confraternity_invites')
                .select(`
                    id, proposed_date, location, message,
                    sender:profiles!confraternity_invites_sender_id_fkey(id, full_name, avatar_url)
                `, { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            setPendingInvitesCount(count || 0)
            if (data) {
                setPendingInvites(data.map((inv: any) => ({
                    id: inv.id,
                    sender: inv.sender?.[0] || inv.sender || { id: '', full_name: 'Usuário', avatar_url: null },
                    proposed_date: inv.proposed_date,
                    location: inv.location,
                    message: inv.message
                })))
            }
        } catch (e) { console.error(e) }
    }

    async function handleAcceptInvite(inviteId: string) {
        setProcessingInvite(inviteId)
        try {
            const { acceptConfraternityInvite } = await import('@/lib/api/confraternity')
            const result = await acceptConfraternityInvite(inviteId, userId!)
            if (result.success) {
                // Remover da lista local
                setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
                setPendingInvitesCount(prev => Math.max(0, prev - 1))
                // Recarregar confrarias
                loadConfraternities()
                // Toast de sucesso
                const { toast } = await import('sonner')
                toast.success('Convite aceito!', { description: '+10 Vigor' })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setProcessingInvite(null)
        }
    }

    async function handleRejectInvite(inviteId: string) {
        setProcessingInvite(inviteId)
        try {
            const { rejectConfraternityInvite } = await import('@/lib/api/confraternity')
            const result = await rejectConfraternityInvite(inviteId, userId!)
            if (result.success) {
                setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
                setPendingInvitesCount(prev => Math.max(0, prev - 1))
                const { toast } = await import('sonner')
                toast.info('Convite recusado')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setProcessingInvite(null)
        }
    }

    async function loadCounters() {
        try {
            const { data, error } = await supabase
                .from('user_confraternity_stats')
                .select('current_month_count, total_count')
                .eq('user_id', userId)
                .single()

            if (error) {
                console.error('[ConfraternityStatsV13] Error loading counters:', error)
                return
            }

            if (data) {
                setCounters({
                    current_month_count: data.current_month_count || 0,
                    total_count: data.total_count || 0
                })
            }
        } catch (err) {
            console.error('[ConfraternityStatsV13] Exception loading counters:', err)
        }
    }

    async function loadConfraternities() {
        try {
            const { data, error } = await supabase
                .from('confraternity_invites')
                .select('id, proposed_date, location, status, sender_id, receiver_id')
                .eq('status', 'accepted')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .gte('proposed_date', new Date().toISOString())
                .order('proposed_date', { ascending: true })
                .limit(5)

            if (error) throw error

            if (!data || data.length === 0) {
                setConfraternities([])
                setLoading(false)
                return
            }

            // Buscar os parceiros
            const partnerIds = data.map(item =>
                item.sender_id === userId ? item.receiver_id : item.sender_id
            )

            const { data: partners } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', partnerIds)

            const partnersMap = new Map(partners?.map(p => [p.id, p]) || [])

            const formatted = data.map(item => {
                const partnerId = item.sender_id === userId ? item.receiver_id : item.sender_id
                const partner = partnersMap.get(partnerId)

                return {
                    id: item.id,
                    proposed_date: item.proposed_date,
                    location: item.location,
                    partner: {
                        full_name: partner?.full_name || 'Usuário',
                        avatar_url: partner?.avatar_url
                    }
                }
            })

            setConfraternities(formatted)
        } catch (error) {
            console.error('Error loading confraternities:', error)
        } finally {
            setLoading(false)
        }
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
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#D2691E]/30 transition-all duration-300 group relative z-10">
            {/* Glass animation container - isolated with overflow-hidden */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
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

                    {/* Contadores de confrarias realizadas */}
                    <div className="flex items-center gap-2">
                        {/* Mês atual */}
                        <div className="flex flex-col items-center bg-gradient-to-br from-[#D2691E]/10 to-[#B85715]/5 border border-[#D2691E]/20 rounded-lg px-3 py-1.5">
                            <span className="text-lg font-bold text-[#D2691E]">{counters.current_month_count}</span>
                            <span className="text-[9px] uppercase text-gray-600 font-medium">
                                {new Date().toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                            </span>
                        </div>

                        {/* Total */}
                        <div className="flex flex-col items-center bg-gradient-to-br from-green-600/10 to-green-700/5 border border-green-600/20 rounded-lg px-3 py-1.5">
                            <span className="text-lg font-bold text-green-700">{counters.total_count}</span>
                            <span className="text-[9px] uppercase text-gray-600 font-medium">Total</span>
                        </div>
                        {/* 🔒 SEGURANÇA: Sino só aparece para o dono do perfil  */}
                        {pendingInvitesCount > 0 && user?.id === userId && (
                            <div className="relative ml-3">
                                <div
                                    onClick={() => setShowInvitesPopup(!showInvitesPopup)}
                                    className="relative bg-gradient-to-br from-[#D2691E] to-[#B85715] p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer animate-glow-pulse"
                                >
                                    <Bell className="w-6 h-6 text-white animate-bell-ring origin-top" />
                                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-red-500 rounded-full text-[12px] font-bold text-white flex items-center justify-center shadow-lg border-2 border-white px-1">
                                        {pendingInvitesCount}
                                    </span>
                                </div>

                                {/* Popup de Convites Pendentes */}
                                {showInvitesPopup && (
                                    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
                                        <div className="bg-gradient-to-r from-[#D2691E] to-[#B85715] px-4 py-3">
                                            <h4 className="text-white font-bold text-sm">Convites Pendentes</h4>
                                            <p className="text-white/80 text-xs">{pendingInvitesCount} convite(s) aguardando</p>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {pendingInvites.map((invite) => (
                                                <div key={invite.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-full bg-[#D2691E]/20 flex items-center justify-center overflow-hidden">
                                                            {invite.sender.avatar_url ? (
                                                                <Image
                                                                    src={invite.sender.avatar_url}
                                                                    alt={invite.sender.full_name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-bold text-[#D2691E]">
                                                                    {invite.sender.full_name?.charAt(0) || '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                                {invite.sender.full_name}
                                                            </p>
                                                            {invite.proposed_date && (
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(invite.proposed_date).toLocaleDateString('pt-BR', {
                                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {invite.message && (
                                                        <p className="text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded italic">
                                                            "{invite.message}"
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptInvite(invite.id)}
                                                            disabled={processingInvite === invite.id}
                                                            className="flex-1 py-1.5 px-3 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {processingInvite === invite.id ? 'Processando...' : '✓ Aceitar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectInvite(invite.id)}
                                                            disabled={processingInvite === invite.id}
                                                            className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            ✗ Recusar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-2 bg-gray-50 border-t">
                                            <button
                                                onClick={() => setShowInvitesPopup(false)}
                                                className="w-full py-2 text-xs text-gray-600 hover:text-gray-900"
                                            >
                                                Fechar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="text-center py-8 bg-[#D2691E]/5 rounded-xl border border-dashed border-[#D2691E]/20 hover:border-[#D2691E]/40 hover:bg-[#D2691E]/10 transition-all cursor-pointer">
                        <Calendar className="w-10 h-10 text-[#D2691E]/50 mx-auto mb-2" />
                        <p className="text-sm text-[#2D3142]">
                            Nenhuma confraria agendada
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
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
                                    onClick={() => {
                                        // Abrir modal de nova publicação com confraria pré-selecionada
                                        setSelectedConfForPost(conf.id)
                                        setShowCreatePostModal(true)
                                    }}
                                    className={cn(
                                        "relative flex items-center gap-3 p-3 rounded-xl border transition-all transform hover:scale-102 duration-300 cursor-pointer group/conf",
                                        new Date(conf.proposed_date) < new Date()
                                            ? "bg-orange-50 border-orange-200 hover:border-orange-400"
                                            : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-[#D2691E]/30"
                                    )}
                                >
                                    {new Date(conf.proposed_date) < new Date() && (
                                        <div className="absolute -top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                            FOTO PENDENTE
                                        </div>
                                    )}

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
                                        {new Date(conf.proposed_date) < new Date() && (
                                            <p className="text-[10px] font-bold text-orange-600 mt-1 flex items-center gap-1">
                                                <Camera className="w-3 h-3" />
                                                Clique para enviar foto
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>

            {/* Modal de Nova Publicação para Confraria */}
            {userId && (
                <CreatePostModalV2
                    open={showCreatePostModal}
                    onOpenChange={(open) => {
                        setShowCreatePostModal(open)
                        if (!open) setSelectedConfForPost(undefined)
                    }}
                    userId={userId}
                    preselectedConfraternityId={selectedConfForPost}
                    onPostCreated={() => {
                        // Recarregar dados
                        loadConfraternities()
                        loadCounters()
                    }}
                />
            )}
        </Card>
    )
}

// ======== NA ROTA FEED V13 ========
interface NaRotaFeedV13Props {
    userId: string
    userName: string
    userAvatar?: string | null
    userRankId?: string
    showCreateButton?: boolean
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

export function NaRotaFeedV13({ userId, userName, userAvatar, userRankId, showCreateButton = false, ratings, portfolio, posts = [] }: NaRotaFeedV13Props) {
    const [createPostOpen, setCreatePostOpen] = useState(false)

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
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <div className="px-5 py-4 border-b border-gray-200 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Na Rota
                            </h3>
                            <p className="text-xs text-gray-600">
                                {allItems.length} publicações
                            </p>
                        </div>
                    </div>
                    {showCreateButton && (
                        <Button
                            size="sm"
                            onClick={() => setCreatePostOpen(true)}
                            className="bg-[#1E4D40] hover:bg-[#2A6B5A] text-white gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            Criar Post
                        </Button>
                    )}
                </div>
            </div>

            <div className="divide-y divide-gray-200 relative">
                {allItems.length === 0 ? (
                    <div className="text-center py-12 px-5">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Camera className="w-10 h-10 text-gray-400" />
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
                                    {/* Avatar com LogoFrame e Badge de Patente */}
                                    <div className="relative">
                                        <LogoFrameAvatar
                                            src={userAvatar}
                                            alt={userName}
                                            size="sm"
                                            className="w-10 h-10"
                                        />
                                        {userRankId && (
                                            <div className="absolute bottom-[2px] right-[2px] z-[5]">
                                                <RankInsignia
                                                    rankId={userRankId}
                                                    size="xs"
                                                    variant="icon-only"
                                                    className="w-[18px] h-[18px] border-[1px] border-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#2D3142]">
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
                                    <div className="p-4 bg-[#D2691E]/5 rounded-xl border border-[#D2691E]/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-[#D2691E] fill-[#D2691E]" />
                                            <span className="text-sm text-[#2D3142]">
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
                                                            ? "text-[#D2691E] fill-[#D2691E] transform hover:scale-125"
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
                                        <p className="text-sm text-[#2D3142] mt-2 font-medium">
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
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#D2691E] transition-all transform hover:scale-110 duration-300 group/like">
                                    <Heart className="w-5 h-5 group-hover/like:fill-[#D2691E]" />
                                    <span className="text-sm font-medium">Curtir</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#1E4D40] transition-all transform hover:scale-110 duration-300">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Comentar</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#1E4D40] transition-all transform hover:scale-110 duration-300">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Compartilhar</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de criar post */}
            <CreatePostModal
                open={createPostOpen}
                onOpenChange={setCreatePostOpen}
                userId={userId}
                onPostCreated={() => {
                    // Refresh da página ou recarregar posts
                    window.location.reload()
                }}
            />
        </Card>
    )
}
