'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon,
    TrendingUp, Eye, Camera, Settings, Edit, Bell, Briefcase, CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileActionButtonsV6 } from '@/components/profile/profile-action-buttons-v6'
import { CoverUpload } from '@/components/profile/cover-upload'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { RankInsignia } from '@/components/gamification/rank-insignia'

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
                {profile.cover_url && !profile.cover_url.startsWith('preset:') ? (
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
                    // Se não tiver capa (ou for preset), deixa o fundo global aparecer (transparente/glass)
                    <>
                        {/* Fundo levemente sutil para separar conteúdo, mas permitindo ver o background da página */}
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

                        {/* Animated Topographic Lines (Original Theme Texture) */}
                        <div
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
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
                    {/* Avatar Diamond Frame Experiment */}
                    {/* Avatar with Logo Frame */}
                    <div className="relative flex-shrink-0 ml-4 mr-6">
                        <div className="relative group">
                            <LogoFrameAvatar
                                src={profile.avatar_url}
                                alt={profile.full_name}
                                size="lg"
                                className="shadow-2xl"
                            />
                        </div>

                        {/* Rank Badge with Glow - Adjusted Position */}
                        <div
                            className="absolute bottom-6 right-6 z-30"
                            style={{
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                            }}
                        >
                            <RankInsignia
                                rankId={gamification?.current_rank_id || 'novato'}
                                size="lg"
                                variant="icon-only"
                                className="border-4 border-[#1A2421]" // Borda escura para separar do avatar
                            />
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

                        {/* Gamification Stats with HIGH POLISH & GLOW */}
                        <div className="flex items-center gap-3 mb-3">
                            {[
                                {
                                    label: 'Vigor',
                                    value: gamification?.total_points || 0,
                                    icon: Flame,
                                    color: '#D4742C', // Laranja
                                    glow: 'shadow-orange-500/20 hover:shadow-orange-500/40' // Glow Laranja
                                },
                                {
                                    label: 'Medalhas',
                                    value: earnedMedals.length,
                                    icon: Award,
                                    color: '#F59E0B', // Dourado
                                    glow: 'shadow-yellow-500/20 hover:shadow-yellow-500/40' // Glow Dourado
                                },
                                {
                                    label: 'ID Rota',
                                    value: profile.rota_number || '#000001',
                                    icon: null,
                                    color: '#1E4D40', // Verde
                                    glow: 'shadow-green-500/20 hover:shadow-green-500/40' // Glow Verde
                                },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "relative group flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/5 transition-all duration-300 cursor-default overflow-hidden",
                                        "bg-black/20 backdrop-blur-md hover:bg-black/30 hover:border-white/20 hover:-translate-y-1 hover:scale-105",
                                        stat.glow,
                                        "shadow-lg animate-in fade-in zoom-in duration-700 fill-mode-backwards"
                                    )}
                                    style={{
                                        animationDelay: `${idx * 150}ms`
                                    }}
                                >
                                    {/* Efeito de brilho ao passar o mouse */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative">
                                        {stat.icon ? (
                                            <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <stat.icon
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                                                    style={{ color: stat.color }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-[10px] font-black text-white/30">#</div>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider leading-none mb-1 group-hover:text-white/70 transition-colors">
                                            {stat.label}
                                        </span>
                                        <span className="text-lg font-black text-white leading-none tracking-tight drop-shadow-md group-hover:text-white transition-colors">
                                            {stat.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Medalhas Row (Sem label de texto, apenas ícones) */}
                        <div className="flex items-center gap-2 mt-1">
                            {/* Label removido conforme pedido */}
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    {earnedMedals.length > 0 ? (
                                        earnedMedals.slice(0, 4).map((userMedal) => {
                                            const medal = allMedals.find(m => m.id === userMedal.medal_id)

                                            // Fallback visual se não achar os dados da medalha (mas tiver o ID)
                                            if (!medal) {
                                                console.warn('[HeaderV6] Medalha não encontrada nos metadados:', userMedal.medal_id)
                                                return null
                                            }

                                            return (
                                                <Tooltip key={userMedal.medal_id}>
                                                    <TooltipTrigger asChild>
                                                        <div className="group relative cursor-pointer">
                                                            <div className="w-8 h-8 rounded-full bg-[#1E4D40] flex items-center justify-center border border-[#3D6B54]/50 shadow-lg shadow-black/20 group-hover:scale-110 group-hover:bg-[#256050] transition-all duration-300">
                                                                <MedalBadge
                                                                    medalId={medal.id}
                                                                    size="sm"
                                                                    variant="icon-only"
                                                                    className="bg-transparent w-full h-full text-white !shadow-none" // Forçando estilo ícone branco
                                                                />
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-[#1A2421] border-[#3D6B54] text-white p-3 shadow-xl">
                                                        <p className="font-bold text-[#D4742C] text-xs uppercase tracking-wider mb-1">{medal.name}</p>
                                                        {medal.description && (
                                                            <p className="text-[10px] text-gray-300 leading-tight max-w-[150px]">{medal.description}</p>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        })
                                    ) : (
                                        <span className="text-xs text-white/40 italic">Nenhuma medalha ainda</span>
                                    )}
                                    {earnedMedals.length > 4 && (
                                        <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold text-white/50 border border-white/5">
                                            +{earnedMedals.length - 4}
                                        </div>
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
                                            <a href="/dashboard/financeiro">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 bg-black/40 border border-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/30 transition-all"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Financeiro</TooltipContent>
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
