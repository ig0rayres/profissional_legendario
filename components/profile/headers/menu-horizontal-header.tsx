'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon,
    Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuHorizontalHeaderProps {
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

export function MenuHorizontalHeader({
    profileData,
    gamification,
    medals = [],
    isOwner = false
}: MenuHorizontalHeaderProps) {

    return (
        <div className="relative w-full h-[240px] overflow-hidden">
            {/* Background - Forest Trail */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E')",
                    }}
                />
            </div>

            {/* Content Container */}
            <div className="relative h-full flex items-center px-6 gap-4">

                {/* Avatar with Orbiting Medals */}
                <div className="relative flex-shrink-0">
                    <div className="relative w-20 h-20 rounded-full border-3 border-[#D2691E] overflow-hidden shadow-lg">
                        {profileData.avatar_url ? (
                            <Image
                                src={profileData.avatar_url}
                                alt={profileData.full_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#2D3B2D] flex items-center justify-center">
                                <Users className="w-10 h-10 text-[#D1D5DB]" />
                            </div>
                        )}
                    </div>

                    {/* Compass Badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#2D3B2D] border-2 border-[#D2691E] flex items-center justify-center">
                        <Compass className="w-4 h-4 text-[#D2691E]" />
                    </div>

                    {/* Orbiting Medals */}
                    {medals.slice(0, 5).map((medal, idx) => {
                        const positions = [
                            { top: '-6px', left: '-6px' },
                            { top: '-6px', right: '-6px' },
                            { bottom: '10px', left: '-8px' },
                            { bottom: '10px', right: '-8px' },
                            { top: '50%', left: '-10px', transform: 'translateY(-50%)' },
                        ]

                        return (
                            <div
                                key={medal.id}
                                className="absolute w-5 h-5 rounded-full bg-[#1A2421] border border-[#D2691E]/60 flex items-center justify-center shadow-md"
                                style={positions[idx] || {}}
                            >
                                <Award className="w-3 h-3 text-[#D2691E]" />
                            </div>
                        )
                    })}
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-[#F2F4F3] mb-0.5">
                                {profileData.full_name}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-[#D1D5DB]">
                                {profileData.bio && (
                                    <span className="max-w-[300px] truncate">{profileData.bio}</span>
                                )}
                                {profileData.pista && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{profileData.pista}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-2 mb-3">
                        {[
                            { label: 'Vigor', value: gamification.total_points, icon: Flame },
                            { label: 'Medalhas', value: gamification.medals_count, icon: Award },
                            { label: gamification.current_rank_id, value: '', icon: Shield },
                            { label: 'ID', value: profileData.rota_number || '-', icon: null },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D3B2D]/70 backdrop-blur-sm border border-white/10 rounded-lg"
                            >
                                {stat.icon && <stat.icon className="w-4 h-4 text-[#D2691E]" />}
                                <div>
                                    {stat.value && (
                                        <div className="text-sm font-bold text-[#F2F4F3]">{stat.value}</div>
                                    )}
                                    <div className="text-[10px] text-[#D1D5DB] uppercase tracking-wide">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trophy Showcase */}
                    {medals.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                            {medals.slice(0, 4).map((medal) => (
                                <div
                                    key={medal.id}
                                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2D3B2D] to-[#1A2421] border border-[#D2691E]/30 flex items-center justify-center shadow-md"
                                >
                                    <Award className="w-5 h-5 text-[#D2691E]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Menu Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {!isOwner && (
                            <>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    <Users className="w-3.5 h-3.5 mr-1" />
                                    Elo
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                                    Mensagem
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                                    Confraria
                                </Button>
                                <Button size="sm" className="h-8 text-xs bg-[#D2691E] hover:bg-[#C85A17] text-white">
                                    <Flame className="w-3.5 h-3.5 mr-1" />
                                    Ofertar
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    <Star className="w-3.5 h-3.5 mr-1" />
                                    Classificar
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    Orar
                                </Button>
                            </>
                        )}

                        {/* Social */}
                        <div className="flex items-center gap-1 ml-auto">
                            <button className="w-8 h-8 rounded-full bg-[#2D3B2D]/60 flex items-center justify-center hover:bg-[#2D3B2D] transition-colors">
                                <MessageCircleIcon className="w-4 h-4 text-[#D2691E]" />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-[#2D3B2D]/60 flex items-center justify-center hover:bg-[#2D3B2D] transition-colors">
                                <Instagram className="w-4 h-4 text-[#D2691E]" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
