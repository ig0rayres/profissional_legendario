'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompactCenteredHeaderProps {
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

export function CompactCenteredHeader({
    profileData,
    gamification,
    medals = [],
    isOwner = false
}: CompactCenteredHeaderProps) {
    const rating = 5.0 // Mock - substituir por real

    return (
        <div className="relative w-full h-[240px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A2421] to-[#2D3B2D]">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                    }}
                />
            </div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col items-center justify-center px-4">

                {/* Avatar with Orbiting Medals */}
                <div className="relative mb-3">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-full border-2 border-[#D2691E] overflow-hidden shadow-lg">
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

                    {/* Orbiting Medals */}
                    {medals.slice(0, 5).map((medal, idx) => {
                        const angle = (idx * 72) - 90 // 360/5 = 72 degrees
                        const radius = 45
                        const x = Math.cos(angle * Math.PI / 180) * radius
                        const y = Math.sin(angle * Math.PI / 180) * radius

                        return (
                            <div
                                key={medal.id}
                                className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-[#2D3B2D] border border-[#D2691E]/40 flex items-center justify-center shadow-md"
                                style={{
                                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                }}
                            >
                                <Award className="w-3.5 h-3.5 text-[#D2691E]" />
                            </div>
                        )
                    })}
                </div>

                {/* Name and Info - Compact */}
                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold text-[#F2F4F3] mb-0.5">
                        {profileData.full_name}
                    </h1>
                    <div className="flex items-center justify-center gap-3 text-xs text-[#D1D5DB]">
                        {profileData.bio && (
                            <span className="max-w-[200px] truncate">{profileData.bio}</span>
                        )}
                        {profileData.pista && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{profileData.pista}</span>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#D2691E] text-[#D2691E]" />
                        ))}
                        <span className="text-xs text-[#D1D5DB] ml-1">{rating}</span>
                    </div>
                </div>

                {/* Stats Bar - Thin Horizontal */}
                <div className="flex items-center gap-2 mb-2">
                    {[
                        { label: 'Vigor', value: gamification.total_points, icon: Flame },
                        { label: 'Medalhas', value: gamification.medals_count, icon: Award },
                        { label: gamification.current_rank_id, value: '', icon: Shield },
                        { label: 'ID Rota', value: profileData.rota_number || '-', icon: null },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2D3B2D]/60 backdrop-blur-sm border border-white/5 rounded-md"
                        >
                            {stat.icon && <stat.icon className="w-3.5 h-3.5 text-[#D2691E]" />}
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[#D1D5DB] leading-none">{stat.label}</span>
                                {stat.value && (
                                    <span className="text-xs font-bold text-[#F2F4F3] leading-none">{stat.value}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons - Single Compact Row */}
                <div className="flex items-center gap-1.5">
                    {!isOwner && (
                        <>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                Elo
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                Mensagem
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                Confraria
                            </Button>
                            <Button size="sm" className="h-7 text-xs bg-[#D2691E] hover:bg-[#C85A17]">
                                Ofertar
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                Classificar
                            </Button>
                        </>
                    )}

                    {/* Social Icons */}
                    <div className="flex items-center gap-1 ml-1">
                        <button className="w-7 h-7 rounded-full bg-[#2D3B2D]/60 flex items-center justify-center hover:bg-[#2D3B2D] transition-colors">
                            <MessageCircleIcon className="w-3.5 h-3.5 text-[#D2691E]" />
                        </button>
                        <button className="w-7 h-7 rounded-full bg-[#2D3B2D]/60 flex items-center justify-center hover:bg-[#2D3B2D] transition-colors">
                            <Instagram className="w-3.5 h-3.5 text-[#D2691E]" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
