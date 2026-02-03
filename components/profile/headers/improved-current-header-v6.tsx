'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    MapPin, Star, Users, MessageCircle, UserPlus,
    Flame, Award, Shield, Instagram, MessageCircleIcon,
    TrendingUp, Eye, Camera, Settings, Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationPreferencesDialog } from '@/components/settings/notification-preferences-dialog'

interface ImprovedCurrentHeaderV6Props {
    profile: {
        full_name: string
        avatar_url: string | null
        professional_title?: string | null
        location?: string | null
        rating?: number
        cover_url?: string | null
    }
    gamification: {
        total_points: number
        current_rank_id: string
        medals_count: number
    }
    medals?: Array<{ id: string; icon: string; name: string }>
    isOwner?: boolean
    onCoverUpdate?: () => void
}

export default function ImprovedCurrentHeaderV6({
    profile,
    gamification,
    medals = [],
    isOwner = false,
    onCoverUpdate
}: ImprovedCurrentHeaderV6Props) {
    const rating = 5.0
    const [showPreferences, setShowPreferences] = useState(false)

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
            {isOwner && onCoverUpdate && (
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        size="sm"
                        onClick={onCoverUpdate}
                        className="h-9 bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md shadow-lg"
                    >
                        <Camera className="w-4 h-4 mr-1.5" />
                        Ajustar Capa
                    </Button>
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
                                    {profile.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{profile.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-[#1E4D40] text-[#1E4D40]" />
                                        ))}
                                        <span className="ml-1">{rating} (23)</span>
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
                                            {gamification.current_rank_id}
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
                                    value: gamification.total_points,
                                    icon: Flame,
                                    delta: '127 mês passado',
                                    color: '#D2691E'
                                },
                                {
                                    label: 'Medalhas',
                                    value: gamification.medals_count,
                                    icon: Award,
                                    color: '#D2691E'
                                },
                                {
                                    label: 'ID Rota',
                                    value: `#000001`,
                                    icon: null,
                                    color: '#D2691E'
                                },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10"
                                    style={{
                                        background: 'rgba(45, 59, 45, 0.3)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        opacity: 0.9
                                    }}
                                >
                                    {stat.icon && <stat.icon className="w-5 h-5 text-[#1E4D40]" />}
                                    <div>
                                        <div className="text-lg font-bold text-[#F2F4F3] leading-none mb-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] text-[#D1D5DB] uppercase tracking-wider leading-none">
                                            {stat.label}
                                        </div>
                                        {stat.delta && (
                                            <div className="text-[9px] text-green-400 leading-none mt-0.5">
                                                {stat.delta}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Medalhas Showcase (não Conquistas) */}
                        {medals.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#D1D5DB] uppercase tracking-wide mr-1">Medalhas:</span>
                                {medals.slice(0, 4).map((medal) => (
                                    <div
                                        key={medal.id}
                                        className="w-9 h-9 rounded-lg border border-[#1E4D40]/30 flex items-center justify-center"
                                        style={{
                                            background: `url(${medal.icon})`,
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                        }}
                                        title={medal.name}
                                    >
                                        <Award className="w-4.5 h-4.5 text-[#1E4D40]" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Action Bar with Glass Effect */}
                <div
                    className="mt-auto px-6 py-3 border-t border-white/5"
                    style={{
                        background: 'rgba(26, 36, 33, 0.6)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {isOwner ? (
                                <>
                                    {/* Botões de Gestão - Owner */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-white/20 text-white hover:bg-white/10"
                                    >
                                        <Edit className="w-4 h-4 mr-1.5" />
                                        Editar Perfil
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-white/20 text-white hover:bg-white/10"
                                        onClick={() => setShowPreferences(true)}
                                    >
                                        <Settings className="w-4 h-4 mr-1.5" />
                                        Configurações
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {/* OFERTAR VIGOR - Primeiro (pedido do usuário) */}
                                    <Button
                                        size="sm"
                                        className="h-9 bg-[#D2691E] hover:bg-[#C85A17] text-white shadow-lg"
                                        onClick={() => window.location.href = `/ofertar-vigor?user=${profile.full_name}`}
                                    >
                                        <Flame className="w-4 h-4 mr-1.5" />
                                        Ofertar
                                    </Button>

                                    {/* MENSAGEM */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]"
                                        onClick={() => window.location.href = `/chat/${profile.full_name}`}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-1.5" />
                                        Mensagem
                                    </Button>

                                    {/* ELO - Com lógica completa (importar componente real) */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]"
                                    >
                                        <UserPlus className="w-4 h-4 mr-1.5" />
                                        Criar Elo
                                    </Button>

                                    {/* CONFRARIA */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]"
                                        onClick={() => window.location.href = `/elo-da-rota/confraria/solicitar`}
                                    >
                                        Confraria
                                    </Button>

                                    {/* CLASSIFICAR */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]"
                                    >
                                        <Star className="w-4 h-4 mr-1.5" />
                                        Classificar
                                    </Button>

                                    {/* ORAR */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 border-[#2D3B2D] text-[#F2F4F3] hover:bg-[#2D3B2D]"
                                        onClick={() => window.location.href = `/orar/${profile.full_name}`}
                                    >
                                        🙏 Orar
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button className="w-9 h-9 rounded-lg bg-[#2D3B2D]/60 flex items-center justify-center hover:bg-[#2D3B2D] transition-all hover:scale-105">
                                <MessageCircleIcon className="w-4 h-4 text-white" />
                            </button>
                            <button className="p-2.5 rounded-lg bg-[#2D3B2D]/60 hover:bg-[#2D3B2D] transition-colors">
                                <Instagram className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Dialog de Preferências de Notificações */}
            <NotificationPreferencesDialog
                isOpen={showPreferences}
                onClose={() => setShowPreferences(false)}
            />
        </div>
    )
}
