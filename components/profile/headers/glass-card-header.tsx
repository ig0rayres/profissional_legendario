'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassCardHeaderProps {
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

export function GlassCardHeader({
    profileData,
    gamification,
    medals = [],
    isOwner = false
}: GlassCardHeaderProps) {

    return (
        <div className="relative w-full h-[240px] overflow-hidden">
            {/* Background - Coastal */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E')",
                    }}
                />
            </div>

            {/* Glass Card Container */}
            <div className="relative h-full flex items-center justify-center px-6">
                <div
                    className="w-full max-w-4xl rounded-2xl border border-[#D2691E]/30 shadow-2xl overflow-hidden"
                    style={{
                        background: 'rgba(26, 36, 33, 0.85)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <div className="flex items-center gap-4 p-4">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="relative w-24 h-24 rounded-full border-3 border-[#D2691E] overflow-hidden shadow-lg">
                                {profileData.avatar_url ? (
                                    <Image
                                        src={profileData.avatar_url}
                                        alt={profileData.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#2D3B2D] flex items-center justify-center">
                                        <Users className="w-12 h-12 text-[#D1D5DB]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info and Stats */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#F2F4F3]">
                                        {profileData.full_name}
                                    </h1>
                                    <p className="text-sm text-[#D1D5DB]">{profileData.bio || 'Profissional'}</p>
                                </div>
                            </div>

                            {/* Inline Stats */}
                            <div className="flex items-center gap-3 text-sm text-[#F2F4F3] mb-2">
                                <div className="flex items-center gap-1">
                                    <Flame className="w-4 h-4 text-[#D2691E]" />
                                    <span className="font-bold">{gamification.total_points}</span>
                                    <span className="text-[#D1D5DB]">Vigor</span>
                                </div>
                                <span className="text-[#D1D5DB]">|</span>
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4 text-[#D2691E]" />
                                    <span className="font-bold">{gamification.medals_count}</span>
                                    <span className="text-[#D1D5DB]">Medalhas</span>
                                </div>
                                <span className="text-[#D1D5DB]">|</span>
                                <div className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-[#D2691E]" />
                                    <span className="font-bold capitalize">{gamification.current_rank_id}</span>
                                </div>
                                <span className="text-[#D1D5DB]">|</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[#D2691E] font-mono font-bold">#{profileData.rota_number || '000000'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trophy Case */}
                        {medals.length > 0 && (
                            <div className="flex-shrink-0">
                                <div className="text-[10px] text-[#D1D5DB] uppercase tracking-wider mb-1.5">Trophy Case</div>
                                <div className="flex gap-2">
                                    {medals.slice(0, 3).map((medal) => (
                                        <div
                                            key={medal.id}
                                            className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2D3B2D] to-[#1A2421] border border-[#D2691E]/40 flex flex-col items-center justify-center shadow-lg"
                                        >
                                            <Award className="w-5 h-5 text-[#D2691E] mb-0.5" />
                                            <span className="text-[8px] text-[#D1D5DB] text-center leading-tight px-0.5">{medal.name.slice(0, 8)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="px-4 pb-4 flex items-center gap-2">
                        {!isOwner && (
                            <>
                                <Button size="sm" className="h-8 bg-[#D2691E] hover:bg-[#C85A17] text-white">
                                    Conectar
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    Mensagem
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    Elo
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    Confraria
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    Ofertar
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
                                    Class.
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]">
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
