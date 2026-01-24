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

interface ImprovedCurrentHeaderV5GreenProps {
    profileData: {
        full_name: string
        avatar_url: string | null
        bio: string | null
        pista: string | null
        rota_number: string | null
        cover_url?: string | null
    }
    gamification: {
        total_points: number
        current_rank_id: string
        medals_count: number
    }
    medals?: Array<{ id: string; icon: string; name: string }>
    isOwner?: boolean
}

export function ImprovedCurrentHeaderV5Green({
    profileData,
    gamification,
    medals = [],
    isOwner = false
}: ImprovedCurrentHeaderV5GreenProps) {
    const rating = 5.0

    return (
        <div className="relative w-full h-[320px] overflow-hidden">
            {/* Background - Verde principal */}
            <div className="absolute inset-0">
                {profileData.cover_url ? (
                    <>
                        <Image
                            src={profileData.cover_url}
                            alt="Capa"
                            fill
                            className="object-cover"
                        />
                        {/* Overlay verde escuro */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]" />
                        {/* Animated Topographic Lines */}
                        <div
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                            }}
                        />
                    </>
                )}
            </div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col justify-between p-6">
                {/* Top Section: Avatar + Name + Stats */}
                <div className="flex items-start gap-6">
                    {/* Avatar com borda laranja */}
                    <div className="relative flex-shrink-0">
                        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#D2691E] shadow-2xl">
                            <Image
                                src={profileData.avatar_url || '/placeholder-avatar.png'}
                                alt={profileData.full_name}
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Name, Stats, Location */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            {/* Left: Name + ID + Location */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl font-bold text-white mb-1 truncate">
                                    {profileData.full_name}
                                </h1>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm text-gray-300">
                                        ID Rota: {profileData.rota_number || '---'}
                                    </span>
                                    {profileData.pista && (
                                        <>
                                            <span className="text-gray-500">•</span>
                                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                                <MapPin className="w-4 h-4" />
                                                <span>{profileData.pista}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Stats Cards - Verde com detalhes cinza */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-xs text-gray-400">Vigor</div>
                                                <div className="text-lg font-bold text-white">{gamification.total_points}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    <span>127 mês passado</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-xs text-gray-400">Avaliação</div>
                                                <div className="text-lg font-bold text-white">{rating.toFixed(1)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-xs text-gray-400">Visualizações</div>
                                                <div className="text-lg font-bold text-white">1.2k</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-xs text-gray-400">Elos</div>
                                                <div className="text-lg font-bold text-white">47</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Rank Badge - Laranja */}
                            <div className="flex-shrink-0">
                                <div className="bg-gradient-to-br from-[#D2691E] to-[#A0522D] border-2 border-[#D2691E]/30 rounded-xl px-4 py-3 shadow-xl">
                                    <div className="flex flex-col items-center gap-1">
                                        <Shield className="w-8 h-8 text-white" />
                                        <div className="text-xs font-semibold text-white/90">Patente</div>
                                        <div className="text-sm font-bold text-white">{gamification.current_rank_id || 'Novato'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Medals + Buttons */}
                <div className="flex items-end justify-between gap-4">
                    {/* Medals - Cinza em detalhes */}
                    <div className="flex-1">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4 text-gray-400" />
                                <h3 className="text-sm font-semibold text-white">Medalhas</h3>
                                <Badge variant="secondary" className="ml-auto bg-gray-500/20 text-gray-300 border-gray-500/30">
                                    {medals.length}
                                </Badge>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {medals.slice(0, 8).map((medal) => (
                                    <div
                                        key={medal.id}
                                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 flex items-center justify-center text-xl shadow-md hover:scale-110 transition-transform"
                                        title={medal.name}
                                    >
                                        {medal.icon}
                                    </div>
                                ))}
                                {medals.length > 8 && (
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 font-semibold">
                                        +{medals.length - 8}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Ofertar laranja, demais cinza neutro */}
                    {!isOwner && (
                        <div className="flex gap-2 flex-shrink-0">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-[#D2691E] to-[#B8610E] hover:from-[#B8610E] hover:to-[#D2691E] text-white font-semibold shadow-lg border border-[#D2691E]/30"
                            >
                                <Flame className="w-4 h-4 mr-1" />
                                Ofertar
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-sm shadow-lg"
                            >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Mensagem
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-sm shadow-lg"
                            >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Criar Elo
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-sm shadow-lg"
                            >
                                <Users className="w-4 h-4 mr-1" />
                                Confraria
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-sm shadow-lg"
                            >
                                <Star className="w-4 h-4 mr-1" />
                                Classificar
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-sm shadow-lg"
                            >
                                <MessageCircleIcon className="w-4 h-4 mr-1" />
                                Orar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
