'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon,
    TrendingUp, Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImprovedCurrentHeaderGrayProps {
    profileData: {
        full_name: string
        avatar_url: string | null
        bio: string | null
        pista: string | null
        rota_number: string | null
    }
    gamification: {
        total_points: number
        current_rank_id: string
        medals_count: number
    }
    medals?: Array<{ id: string; icon: string; name: string }>
    isOwner?: boolean
}

/**
 * Versão SÓBRIA/GRAY do header
 * Paleta: Cinza predominante, verde em detalhes, laranja apenas em destaques
 */
export function ImprovedCurrentHeaderGray({
    profileData,
    gamification,
    medals = [],
    isOwner = false
}: ImprovedCurrentHeaderGrayProps) {
    const rating = 5.0

    return (
        <div className="relative w-full h-[320px] overflow-hidden">
            {/* Background - CINZA SÓBRIO */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C] via-[#2A2A2A] to-[#1C1C1C]" />
                {/* Pattern mais sutil */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col">

                {/* Top Row */}
                <div className="flex items-start gap-4 p-6">

                    {/* Avatar - Borda Laranja (destaque) */}
                    <div className="relative flex-shrink-0">
                        <div
                            className="relative w-28 h-28 rounded-2xl border-2 border-[#D2691E] overflow-hidden"
                            style={{
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(210, 105, 30, 0.1)',
                            }}
                        >
                            {profileData.avatar_url ? (
                                <Image
                                    src={profileData.avatar_url}
                                    alt={profileData.full_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#3A3A3A] to-[#2A2A2A] flex items-center justify-center">
                                    <Users className="w-14 h-14 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Rank Badge - Laranja (destaque) */}
                        <div
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#C85A17] flex items-center justify-center shadow-lg"
                            style={{
                                boxShadow: '0 4px 16px rgba(210, 105, 30, 0.5)',
                            }}
                        >
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    {profileData.full_name}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-400 mb-1">
                                    {profileData.bio && (
                                        <span className="max-w-[400px] truncate">{profileData.bio}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    {profileData.pista && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-emerald-600" />
                                            <span>{profileData.pista}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-[#D2691E] text-[#D2691E]" />
                                        ))}
                                        <span className="ml-1">{rating} (23)</span>
                                    </div>
                                </div>
                            </div>

                            {/* PATENTE - Laranja destaque */}
                            <div className="flex-shrink-0 ml-4">
                                <div
                                    className="px-4 py-3 rounded-xl border border-[#D2691E]/40 min-w-[140px]"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(210, 105, 30, 0.12) 0%, rgba(60, 60, 60, 0.4) 100%)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 4px 12px rgba(210, 105, 30, 0.15)',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-5 h-5 text-[#D2691E]" />
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Patente</span>
                                    </div>
                                    <div className="text-xl font-bold text-white capitalize leading-none">
                                        {gamification.current_rank_id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats - CINZA com detalhes verdes */}
                        <div className="flex items-center gap-2 mb-3">
                            {[
                                {
                                    label: 'Vigor',
                                    value: gamification.total_points,
                                    icon: Flame,
                                    delta: '127 mês passado',
                                },
                                {
                                    label: 'Medalhas',
                                    value: gamification.medals_count,
                                    icon: Award,
                                },
                                {
                                    label: 'ID Rota',
                                    value: `#${profileData.rota_number || '000000'}`,
                                    icon: null,
                                },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5"
                                    style={{
                                        background: 'rgba(50, 50, 50, 0.5)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                    }}
                                >
                                    {stat.icon && <stat.icon className="w-5 h-5 text-emerald-500" />}
                                    <div>
                                        <div className="text-lg font-bold text-white leading-none mb-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">
                                            {stat.label}
                                        </div>
                                        {stat.delta && (
                                            <div className="text-[9px] text-emerald-400 leading-none mt-0.5">
                                                {stat.delta}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Medalhas - Verde detalhe */}
                        {medals.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 uppercase tracking-wide mr-1">Medalhas:</span>
                                {medals.slice(0, 4).map((medal) => (
                                    <div
                                        key={medal.id}
                                        className="w-9 h-9 rounded-lg border border-emerald-600/30 flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(50, 50, 50, 0.7) 0%, rgba(40, 40, 40, 0.7) 100%)',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                                        }}
                                        title={medal.name}
                                    >
                                        <Award className="w-4.5 h-4.5 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Bar - Cinza glass */}
                <div
                    className="mt-auto px-6 py-3 border-t border-white/5"
                    style={{
                        background: 'rgba(30, 30, 30, 0.7)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {!isOwner && (
                                <>
                                    {/* OFERTAR - Laranja (destaque) */}
                                    <Button
                                        size="sm"
                                        className="h-9 bg-[#D2691E] hover:bg-[#C85A17] text-white shadow-lg"
                                        onClick={() => window.location.href = `/ofertar-vigor?user=${profileData.full_name}`}
                                    >
                                        <Flame className="w-4 h-4 mr-1.5" />
                                        Ofertar
                                    </Button>

                                    {/* Outros botões - Cinza */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-gray-600 text-gray-200 hover:bg-gray-700"
                                        onClick={() => window.location.href = `/chat/${profileData.full_name}`}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-1.5" />
                                        Mensagem
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-gray-600 text-gray-200 hover:bg-gray-700"
                                    >
                                        <UserPlus className="w-4 h-4 mr-1.5" />
                                        Criar Elo
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-gray-600 text-gray-200 hover:bg-gray-700"
                                        onClick={() => window.location.href = `/elo-da-rota/confraria/solicitar`}
                                    >
                                        Confraria
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-gray-600 text-gray-200 hover:bg-gray-700"
                                    >
                                        <Star className="w-4 h-4 mr-1.5" />
                                        Classificar
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-gray-600 text-gray-200 hover:bg-gray-700"
                                        onClick={() => window.location.href = `/orar/${profileData.full_name}`}
                                    >
                                        🙏 Orar
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Social - Verde detalhe */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button className="w-9 h-9 rounded-lg bg-gray-700/60 flex items-center justify-center hover:bg-gray-600 transition-all hover:scale-105">
                                <MessageCircleIcon className="w-4 h-4 text-emerald-500" />
                            </button>
                            <button className="w-9 h-9 rounded-lg bg-gray-700/60 flex items-center justify-center hover:bg-gray-600 transition-all hover:scale-105">
                                <Instagram className="w-4 h-4 text-emerald-500" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
