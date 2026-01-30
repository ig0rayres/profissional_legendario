'use client'

/**
 * AVATARES PADRONIZADOS - SISTEMA UNIFICADO
 * 
 * 4 VARIAÇÕES PRÉ-DEFINIDAS:
 * 
 * 1. TINY (32px) - Para listas compactas, notificações
 * 2. SMALL (48px) - Para comentários, cards pequenos
 * 3. MEDIUM (64px) - Para posts, feed principal
 * 4. LARGE (120px+) - Para headers de perfil, destaque
 * 
 * USO:
 * <StandardAvatar variant="tiny" user={user} />
 * <StandardAvatar variant="small" user={user} showRank />
 * <StandardAvatar variant="medium" user={user} showRank linkToProfile />
 * <StandardAvatar variant="large" user={user} showRank frameStyle="diamond" />
 */

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { RankInsignia } from '@/components/gamification/rank-insignia'

export interface StandardAvatarUser {
    id: string
    full_name: string
    avatar_url: string | null
    rank_id?: string
    rank_name?: string
    rank_icon?: string
    slug?: string
    rota_number?: string
}

interface StandardAvatarProps {
    /** Variação pré-definida do avatar */
    variant: 'tiny' | 'small' | 'medium' | 'large'
    /** Dados do usuário */
    user: StandardAvatarUser
    /** Mostrar badge de patente? */
    showRank?: boolean
    /** Criar link para perfil? */
    linkToProfile?: boolean
    /** Estilo do frame (apenas para large) */
    frameStyle?: 'simple' | 'diamond'
    /** Classes adicionais */
    className?: string
}

// ============================================
// CONFIGURAÇÕES FIXAS POR VARIAÇÃO
// ============================================

const VARIANT_CONFIG = {
    // 1. TINY - Listas compactas, notificações
    tiny: {
        containerSize: 'w-8 h-8',
        imageSize: 32,
        borderWidth: 'border-2',
        borderColor: 'border-[#2D6B4F]',
        rounded: 'rounded-lg',
        rankSize: 'w-7 h-7',  // Aumentado para mais destaque
        rankPosition: 'absolute -bottom-0.5 -right-0.5',
        rankBadgeSize: 'xs' as const,
        showRankDefault: false
    },

    // 2. SMALL - Comentários, cards pequenos
    small: {
        containerSize: 'w-12 h-12',
        imageSize: 48,
        borderWidth: 'border-2',
        borderColor: 'border-[#2D6B4F]',
        rounded: 'rounded-xl',
        rankSize: 'w-8 h-8',  // Aumentado para mais destaque
        rankPosition: 'absolute -bottom-1 -right-1',
        rankBadgeSize: 'sm' as const,
        showRankDefault: true
    },

    // 3. MEDIUM - Posts, feed principal
    medium: {
        containerSize: 'w-16 h-16',
        imageSize: 64,
        borderWidth: 'border-3',
        borderColor: 'border-[#2D6B4F]',
        rounded: 'rounded-xl',
        rankSize: 'w-9 h-9',  // Aumentado para mais destaque
        rankPosition: 'absolute -bottom-1 -right-1',
        rankBadgeSize: 'sm' as const,
        showRankDefault: true
    },

    // 4. LARGE - Headers de perfil, destaque
    large: {
        containerSize: 'w-[116px] h-[116px] md:w-[152px] md:h-[152px]',
        imageSize: 152,
        borderWidth: 'border-4',
        borderColor: 'border-[#2D6B4F]',
        rounded: 'rounded-2xl',
        rankSize: 'w-14 h-14 md:w-[62px] md:h-[62px]',  // Aumentado para mais destaque
        rankPosition: 'absolute bottom-[8px] right-[8px] md:bottom-[18px] md:right-[18px]',  // Ajustado: 2px mais baixo e direita
        rankBadgeSize: 'md' as const,
        showRankDefault: true
    }
}

export function StandardAvatar({
    variant,
    user,
    showRank,
    linkToProfile = false,
    frameStyle = 'simple',
    className
}: StandardAvatarProps) {
    const config = VARIANT_CONFIG[variant]
    const shouldShowRank = showRank ?? config.showRankDefault

    // Avatar com imagem
    const avatarContent = (
        <div className={cn(
            'relative',
            config.containerSize,
            className
        )}>
            {/* Container do Avatar */}
            <div className={cn(
                'relative overflow-hidden bg-[#1A2421]',
                config.containerSize,
                config.rounded,
                config.borderWidth,
                config.borderColor,
                'shadow-lg'
            )}>
                <Image
                    src={user.avatar_url || '/images/default-avatar.png'}
                    alt={user.full_name}
                    width={config.imageSize}
                    height={config.imageSize}
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Badge de Patente */}
            {shouldShowRank && user.rank_id && (
                <div className={cn(
                    config.rankPosition,
                    'z-10'
                )}>
                    <RankInsignia
                        rankId={user.rank_id}
                        rankName={user.rank_name}
                        iconName={user.rank_icon}
                        size={config.rankBadgeSize}
                        variant="icon-only"
                        className={cn(
                            config.rankSize,
                            'border-[1.5px] border-white'
                        )}
                    />
                </div>
            )}
        </div>
    )

    // Se tiver link, envolve em Link
    if (linkToProfile && user.slug) {
        return (
            <Link
                href={`/profile/${user.slug}`}
                className="inline-block hover:opacity-90 transition-opacity"
            >
                {avatarContent}
            </Link>
        )
    }

    return avatarContent
}

/**
 * EXEMPLOS DE USO:
 * 
 * // Lista de notificações
 * <StandardAvatar variant="tiny" user={user} />
 * 
 * // Comentário
 * <StandardAvatar variant="small" user={user} showRank linkToProfile />
 * 
 * // Post no feed
 * <StandardAvatar variant="medium" user={user} showRank linkToProfile />
 * 
 * // Header do perfil
 * <StandardAvatar variant="large" user={user} showRank />
 */
