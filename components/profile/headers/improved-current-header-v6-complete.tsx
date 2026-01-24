'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon,
    TrendingUp, Eye, Camera, Settings, Edit, Bell, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileActionButtonsV6 } from '@/components/profile/profile-action-buttons-v6'
import { CoverUpload } from '@/components/profile/cover-upload'
import { MedalBadge } from '@/components/gamification/medal-badge'

interface ImprovedCurrentHeaderV6CompleteProps {
    profile: any
    isOwner?: boolean
    gamification?: any
    subscription?: any
    ratingStats?: any
    confraternityStats?: any
    earnedMedals?: any[]
    allMedals?: any[]
}

/**
 * V6 Header - EXACT COPY FROM DEMO with Real Data
 * All visual effects, glass morphism, hovers preserved
 */
export default function ImprovedCurrentHeaderV6Complete({
    profile,
    gamification,
    isOwner = false,
    ratingStats,
    confraternityStats,
    earnedMedals = [],
    allMedals = []
}: ImprovedCurrentHeaderV6CompleteProps) {

    const rating = ratingStats?.average_rating || 5.0

    return (
        <div className="relative w-full h-[320px] overflow-hidden">
            {/* Background with Cover Photo */}
            <div className="absolute inset-0">
                {profile.cover_url ? (
                    <>
                        <Image
                            src={profile.cover_url}
                            alt="Capa"
                            fill
                            className="object-cover"
                        />
                        {/* Overlay escuro com gradiente para legibilidade */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]" />
                        {/* Animated Topographic Lines */}
                        <div
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                            }}
                        />
                    </>
                )}
            </div>

            {/* Botão de Ajustar Capa - Só para owner */}
            {isOwner && (
                <div className="absolute top-4 right-4 z-10">
                    <CoverUpload
                        userId={profile.id}
                        currentCoverUrl={profile.cover_url}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative h-full flex flex-col">

                {/* Top Row */}
                <div className="flex items-start gap-4 p-6">

                    {/* Avatar with Depth Effect */}
                    <div className="relative flex-shrink-0">
                        <div
                            className="relative w-28 h-28 rounded-2xl border-2 border-[#D2691E] overflow-hidden"
                            style={{
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(210, 105, 30, 0.1)',
                            }}
                        >
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.full_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#2D3B2D] to-[#1A2421] flex items-center justify-center">
                                    <Users className="w-14 h-14 text-[#D1D5DB]" />
                                </div>
                            )}
                        </div>

                        {/* Rank Badge with Glow */}
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
                                <h1 className="text-3xl font-bold text-[#F2F4F3] mb-1">
                                    {profile.full_name}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-[#D1D5DB] mb-1">
                                    {profile.professional_title && (
                                        <span className="max-w-[400px] truncate">{profile.professional_title}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#D1D5DB]">
                                    {profile.pista && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{profile.pista}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-[#1E4D40] text-[#1E4D40]" />
                                        ))}
                                        <span className="ml-1">{rating.toFixed(1)} ({ratingStats?.total_ratings || 0})</span>
                                    </div>
                                </div>
                            </div>

                            {/* PATENTE - Badge tipo medalha */}
                            <div className="flex-shrink-0 ml-4">
                                <div
                                    className="relative px-5 py-4 rounded-2xl border-2 border-[#1E4D40]/50"
                                    style={{
                                        background: 'rgba(45, 59, 45, 0.3)',
                                        opacity: 0.9,
                                        backdropFilter: 'blur(8px)'
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-8 h-8 text-[#1E4D40]" />
                                        <div className="text-base font-bold text-[#F2F4F3] capitalize leading-none text-center">
                                            {gamification?.current_rank_id || 'Novato'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gamification Stats with Glass Cards */}
                        <div className="flex items-center gap-2 mb-3">
                            {[
                                {
                                    label: 'Vigor',
                                    value: gamification?.total_points || 0,
                                    icon: Flame,
                                    delta: '127 mês passado',
                                    color: '#1E4D40'
                                },
                                {
                                    label: 'Medalhas',
                                    value: earnedMedals.length,
                                    icon: Award,
                                    color: '#1E4D40'
                                },
                                {
                                    label: 'ID Rota',
                                    value: profile.rota_number || '#000001',
                                    icon: null,
                                    color: '#1E4D40'
                                },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10"
                                    style={{
                                        background: 'rgba(45, 59, 45, 0.3)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <div>
                                        {stat.icon && <stat.icon className="w-4 h-4" style={{ color: stat.color }} />}
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#D1D5DB] uppercase tracking-wide leading-none mb-0.5">
                                            {stat.label}
                                        </div>
                                        <div className="text-base font-bold text-[#F2F4F3] leading-none">
                                            {stat.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Medalhas Row */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase text-[#D1D5DB] tracking-wider">Medalhas:</span>
                            <div className="flex items-center gap-1">
                                <TooltipProvider>
                                    {earnedMedals.slice(0, 4).map((userMedal) => {
                                        const medal = allMedals.find(m => m.id === userMedal.medal_id)
                                        if (!medal) return null

                                        return (
                                            <Tooltip key={userMedal.medal_id}>
                                                <TooltipTrigger asChild>
                                                    <div className="cursor-pointer hover:scale-110 transition-transform">
                                                        <MedalBadge medalId={medal.id} size="sm" variant="profile" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold text-sm">{medal.name}</p>
                                                    {medal.description && (
                                                        <p className="text-xs text-zinc-300 mt-1">{medal.description}</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                    {earnedMedals.length > 4 && (
                                        <span className="text-[10px] text-[#D1D5DB] ml-1">+{earnedMedals.length - 4}</span>
                                    )}
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Action Buttons */}
                <div className="mt-auto px-6 py-4 border-t border-white/10" style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center justify-between">
                        {/* Action Buttons */}
                        {!isOwner ? (
                            <ProfileActionButtonsV6
                                userId={profile.id}
                                userName={profile.full_name}
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href="/dashboard/editar-perfil">
                                                <Button variant="default" size="sm" className="h-9">
                                                    <Edit className="w-4 h-4 mr-1.5" />
                                                    Editar Perfil
                                                </Button>
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Editar Perfil</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href="/dashboard/editar-perfil">
                                                <Button variant="outline" size="icon" className="h-9 w-9">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Configurações</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}

                        {/* Social Icons */}
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                {profile.whatsapp && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>WhatsApp</TooltipContent>
                                    </Tooltip>
                                )}
                                {profile.instagram && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10"
                                                >
                                                    <Instagram className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Instagram</TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
