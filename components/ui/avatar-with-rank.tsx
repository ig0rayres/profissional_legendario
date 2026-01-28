'use client'

/**
 * AVATAR COM PATENTE - COMPONENTE CENTRALIZADO
 * 
 * USE ESTE COMPONENTE EM TODOS OS LUGARES ONDE EXIBIR AVATAR COM PATENTE:
 * - Feed (Na Rota)
 * - Elos da Rota
 * - Confrarias
 * - Cards de usuário
 * - Comentários
 * - etc.
 * 
 * NUNCA crie avatares com patente em outros lugares!
 */

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getRankIcon, getRankIconName } from '@/lib/utils/ranks'
import { RankInsignia } from '@/components/gamification/rank-insignia'

export interface AvatarUser {
    id: string
    full_name: string
    avatar_url: string | null
    rank_id?: string
    rank_name?: string
    rank_icon?: string
    slug?: string
    rota_number?: string
}

interface AvatarWithRankProps {
    user: AvatarUser
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showName?: boolean
    linkToProfile?: boolean
    className?: string
    variant?: 'square' | 'rounded' | 'circle'
    /** 
     * Estilo do frame:
     * - 'simple': Borda verde simples (padrão para listas, comentários)
     * - 'diamond': Frame de losango com montanhas (para feed, destaque)
     */
    frameStyle?: 'simple' | 'diamond'
}

// Configuração de tamanhos
const SIZE_CONFIG = {
    xs: {
        container: 'w-8 h-8',
        avatar: 32,
        badge: 'xs' as const,
        badgeOffset: '-bottom-1 -right-1',
        text: 'text-xs',
        diamondSize: 'w-10 h-10'
    },
    sm: {
        container: 'w-10 h-10',
        avatar: 40,
        badge: 'xs' as const,
        badgeOffset: '-bottom-1 -right-1',
        text: 'text-sm',
        diamondSize: 'w-12 h-12'
    },
    md: {
        container: 'w-12 h-12',
        avatar: 48,
        badge: 'sm' as const,
        badgeOffset: '-bottom-1.5 -right-1.5',
        text: 'text-sm',
        diamondSize: 'w-14 h-14'
    },
    lg: {
        container: 'w-16 h-16',
        avatar: 64,
        badge: 'sm' as const,
        badgeOffset: '-bottom-2 -right-2',
        text: 'text-base',
        diamondSize: 'w-20 h-20'
    },
    xl: {
        container: 'w-24 h-24',
        avatar: 96,
        badge: 'md' as const,
        badgeOffset: '-bottom-2 -right-2',
        text: 'text-lg',
        diamondSize: 'w-28 h-28'
    }
}

// Configuração de variantes (para estilo simple)
const VARIANT_CONFIG = {
    square: 'rounded-lg',
    rounded: 'rounded-xl',
    circle: 'rounded-full'
}

export function AvatarWithRank({
    user,
    size = 'md',
    showName = false,
    linkToProfile = false,
    className,
    variant = 'rounded',
    frameStyle = 'simple'
}: AvatarWithRankProps) {
    const config = SIZE_CONFIG[size]

    // Resolver ícone da patente
    const rankIconName = user.rank_icon || getRankIconName(user.rank_id)
    const rankId = user.rank_id || 'novato'

    // URL do perfil
    const profileUrl = user.slug && user.rota_number
        ? `/${user.slug}/${user.rota_number}`
        : `/perfil/${user.id}`

    // Iniciais do nome
    const initials = user.full_name
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?'

    // Renderizar avatar com frame de losango (diamond)
    const renderDiamondAvatar = () => (
        <div className={cn("relative", config.diamondSize)}>
            {/* Container do losango */}
            <div className="relative w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                {/* Foto dentro do losango */}
                <div
                    className="absolute inset-[8%] z-0 overflow-hidden"
                    style={{
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                    }}
                >
                    <div className="absolute inset-0 bg-[#0f1a15]" />
                    <div className="relative w-full h-full transform scale-[1.35]">
                        {user.avatar_url ? (
                            <Image
                                src={user.avatar_url}
                                alt={user.full_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1E4D40]/20">
                                <span className="text-lg font-bold text-[#1E4D40]/50">{initials}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Frame de montanhas */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <Image
                        src="/frame-mountains.png"
                        alt="Frame"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Badge de patente */}
            <div className="absolute -bottom-1 -right-1 z-20">
                <RankInsignia
                    rankId={rankId}
                    rankName={user.rank_name}
                    iconName={rankIconName}
                    size={config.badge}
                    variant="avatar"
                />
            </div>
        </div>
    )

    // Renderizar avatar simples (bordas)
    const renderSimpleAvatar = () => {
        const borderRadius = VARIANT_CONFIG[variant]
        return (
            <div className={cn(
                "relative group/avatar",
                config.container
            )}>
                {/* Avatar - Frame verde da Rota */}
                <div className={cn(
                    "w-full h-full overflow-hidden border-2 border-[#1E4D40]/40 group-hover/avatar:border-[#1E4D40] transition-all shadow-md group-hover/avatar:shadow-lg",
                    borderRadius
                )}>
                    {user.avatar_url ? (
                        <Image
                            src={user.avatar_url}
                            alt={user.full_name}
                            width={config.avatar}
                            height={config.avatar}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={cn(
                            "w-full h-full bg-gradient-to-br from-[#1E4D40]/10 to-[#2A6B5A]/10 flex items-center justify-center",
                            config.text,
                            "font-bold text-[#1E4D40]"
                        )}>
                            {initials}
                        </div>
                    )}
                </div>

                {/* Badge de Patente */}
                <div className={cn("absolute z-10", config.badgeOffset)}>
                    <RankInsignia
                        rankId={rankId}
                        rankName={user.rank_name}
                        iconName={rankIconName}
                        size={config.badge}
                        variant="avatar"
                    />
                </div>
            </div>
        )
    }

    const avatarContent = (
        <div className={cn("relative inline-flex flex-col items-center", className)}>
            {frameStyle === 'diamond' ? renderDiamondAvatar() : renderSimpleAvatar()}

            {/* Nome (opcional) */}
            {showName && (
                <span className={cn(
                    "mt-1 text-center truncate max-w-full",
                    config.text,
                    "text-foreground/80"
                )}>
                    {user.full_name.split(' ')[0]}
                </span>
            )}
        </div>
    )

    // Se deve linkar para o perfil
    if (linkToProfile) {
        return (
            <Link href={profileUrl} className="hover:opacity-90 transition-opacity">
                {avatarContent}
            </Link>
        )
    }

    return avatarContent
}

/**
 * Versão simplificada para listas
 */
export function AvatarWithRankCompact({
    user,
    size = 'sm',
    className
}: {
    user: AvatarUser
    size?: 'xs' | 'sm' | 'md'
    className?: string
}) {
    return (
        <AvatarWithRank
            user={user}
            size={size}
            showName={false}
            linkToProfile={false}
            variant="rounded"
            frameStyle="simple"
            className={className}
        />
    )
}
