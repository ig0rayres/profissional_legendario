'use client'

import Image from 'next/image'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'

export interface DashboardHeaderAvatarUser {
    id: string
    full_name: string
    avatar_url: string | null
    rank_id?: string
    rank_name?: string
    rank_icon?: string
}

interface DashboardHeaderAvatarProps {
    user: DashboardHeaderAvatarUser
    /** Modo de visualização */
    mode?: 'desktop' | 'mobile'
    /** Tamanhos customizados (opcional - para o editor) */
    customSizes?: {
        frameSize?: number
        badgeSize?: number
        badgeBottom?: number
        badgeRight?: number
        borderWidth?: number
    }
}

/**
 * AVATAR DO HEADER DO DASHBOARD - CONJUNTO COMPLETO
 * 
 * Este componente renderiza o CONJUNTO COMPLETO:
 * 1. Moldura quadrada com logo da Rota (LogoFrameAvatar)
 * 2. Foto do usuário dentro da moldura
 * 3. Badge de patente no canto inferior direito
 * 
 * Configurações finalizadas:
 * 
 * MOBILE:
 * - Conjunto total: 116px x 116px
 * - Patente: 36px (size="lg")
 * - Posição patente: bottom-[8px] right-[8px]
 * - Borda patente: 1.5px branca
 * 
 * DESKTOP:
 * - Conjunto total: 152px x 152px
 * - Patente: 44px (size="lg")
 * - Posição patente: bottom-[16px] right-[16px]
 * - Borda patente: 2px branca
 * 
 * USO:
 * <DashboardHeaderAvatar user={user} />
 */
export function DashboardHeaderAvatar({
    user,
    mode = 'desktop',
    customSizes
}: DashboardHeaderAvatarProps) {
    return (
        <div className="relative flex-shrink-0 z-50">
            <div className="relative group">
                <LogoFrameAvatar
                    src={user.avatar_url}
                    alt={user.full_name}
                    size="sm"
                    className='!w-[67px] !h-[67px]'
                />
            </div>

            {/* Rank Badge */}
            {user.rank_id && (
                <div className='absolute bottom-[3px] right-[3px] z-[30]'>
                    <RankInsignia
                        rankId={user.rank_id}
                        rankName={user.rank_name}
                        iconName={user.rank_icon}
                        size="sm"
                        variant="icon-only"
                        className='!w-[24px] !h-[24px] border-[1px] border-white'
                    />
                </div>
            )}
        </div>
    )
}
