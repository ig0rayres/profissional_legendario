/**
 * COMPONENTES CENTRALIZADOS - ROTA DO VALENTE
 * 
 * Ícones são LUCIDE REACT (monocromáticos)
 * O banco guarda o NOME do ícone: 'Sword', 'Star', 'CheckCircle', etc.
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface BadgeProps {
    id: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'full' | 'icon-only' | 'compact' | 'badge' | 'outline' | 'profile'
    showPoints?: boolean
    showLabel?: boolean
    className?: string
}

interface BadgeData {
    id: string
    name: string
    icon: string
    points: number
    description?: string
}

// ============================================
// TAMANHOS
// ============================================

const ICON_SIZES = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
}

const CONTAINER_SIZES = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
}

// ============================================
// FALLBACK REMOVIDO - ÍCONES VEM 100% DO BANCO
// ============================================
// Se precisar de fallback, é porque o banco não foi configurado
const DEFAULT_ICONS: Record<string, string> = {}

// ============================================
// FUNÇÃO PARA OBTER ÍCONE LUCIDE
// ============================================

function getLucideIcon(iconName: string): any {
    // Tentar obter do Lucide
    const Icon = (LucideIcons as any)[iconName]
    if (Icon) return Icon

    // Fallback para Award
    return LucideIcons.Award
}

// ============================================
// CACHE GLOBAL
// ============================================

let medalsCache: Record<string, BadgeData> = {}
let proezasCache: Record<string, BadgeData> = {}
let ranksCache: Record<string, BadgeData> = {}
let missionsCache: Record<string, BadgeData> = {}
let cacheLoaded = false

async function loadAllCaches() {
    if (cacheLoaded) return

    const supabase = createClient()

    const [medalsRes, proezasRes, ranksRes, missionsRes] = await Promise.all([
        supabase.from('medals').select('id, name, icon, points_reward, description'),
        supabase.from('proezas').select('id, name, icon, points_base, description'),
        supabase.from('ranks').select('id, name, icon, points_required, description'),
        supabase.from('daily_missions').select('id, name, icon, points_base, description')
    ])

    if (medalsRes.data) {
        medalsRes.data.forEach(m => {
            medalsCache[m.id] = {
                id: m.id, name: m.name,
                icon: m.icon || DEFAULT_ICONS[m.id] || 'Award',
                points: m.points_reward, description: m.description
            }
        })
    }

    if (proezasRes.data) {
        proezasRes.data.forEach(p => {
            proezasCache[p.id] = {
                id: p.id, name: p.name,
                icon: p.icon || DEFAULT_ICONS[p.id] || 'Flame',
                points: p.points_base, description: p.description
            }
        })
    }

    if (ranksRes.data) {
        ranksRes.data.forEach(r => {
            ranksCache[r.id] = {
                id: r.id, name: r.name,
                icon: r.icon || DEFAULT_ICONS[r.id] || 'Shield',
                points: r.points_required, description: r.description
            }
        })
    }

    if (missionsRes.data) {
        missionsRes.data.forEach(m => {
            missionsCache[m.id] = {
                id: m.id, name: m.name,
                icon: m.icon || 'Target',
                points: m.points_base, description: m.description
            }
        })
    }

    cacheLoaded = true
}

export function invalidateBadgeCache() {
    medalsCache = {}
    proezasCache = {}
    ranksCache = {}
    missionsCache = {}
    cacheLoaded = false
}

// ============================================
// ESTILOS
// ============================================

const STYLES = {
    badge: 'bg-secondary text-white shadow-lg',
    outline: 'bg-white/90 backdrop-blur-sm text-secondary border-2 border-secondary/60 shadow-lg',
    profile: 'bg-transparent text-primary',
    'icon-only': 'bg-secondary text-white shadow-lg',
}

// ============================================
// COMPONENTE GENÉRICO DE BADGE
// ============================================

function GenericBadge({
    data,
    size = 'md',
    variant = 'icon-only',
    showPoints = false,
    showLabel = false,
    className,
    fallbackIcon = 'Award'
}: {
    data: BadgeData | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: string
    showPoints?: boolean
    showLabel?: boolean
    className?: string
    fallbackIcon?: string
}) {
    if (!data) {
        const FallbackIcon = getLucideIcon(fallbackIcon)
        return (
            <div className={cn(CONTAINER_SIZES[size], 'rounded-full flex items-center justify-center', STYLES['icon-only'], className)}>
                <FallbackIcon className={ICON_SIZES[size]} strokeWidth={2.5} />
            </div>
        )
    }

    const Icon = getLucideIcon(data.icon)

    if (variant === 'profile') {
        return (
            <div className={cn(CONTAINER_SIZES[size], 'rounded-full flex items-center justify-center', STYLES.profile, className)}>
                <Icon className={ICON_SIZES[size]} strokeWidth={2.5} />
            </div>
        )
    }

    if (variant === 'icon-only') {
        return (
            <div className={cn(CONTAINER_SIZES[size], 'rounded-full flex items-center justify-center', STYLES['icon-only'], className)} title={data.name}>
                <Icon className={ICON_SIZES[size]} strokeWidth={2.5} />
            </div>
        )
    }

    if (variant === 'outline') {
        return (
            <div className={cn(CONTAINER_SIZES[size], 'rounded-full flex items-center justify-center', STYLES.outline, className)} title={data.name}>
                <Icon className={ICON_SIZES[size]} strokeWidth={2.5} />
            </div>
        )
    }

    if (variant === 'badge') {
        return (
            <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide', STYLES.badge, className)}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {showLabel && <span>{data.name}</span>}
            </div>
        )
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-1', className)} title={data.name}>
                <div className={cn(CONTAINER_SIZES[size], 'rounded-full flex items-center justify-center', STYLES['icon-only'])}>
                    <Icon className={ICON_SIZES[size]} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium">{data.name}</span>
            </div>
        )
    }

    // full
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className={cn(CONTAINER_SIZES[size], 'rounded-full flex items-center justify-center', STYLES['icon-only'])}>
                <Icon className={ICON_SIZES[size]} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-sm font-semibold">{data.name}</p>
                {showPoints && <p className="text-xs text-muted-foreground">+{data.points} pts</p>}
            </div>
        </div>
    )
}

// ============================================
// COMPONENTES PÚBLICOS
// ============================================

export function MedalBadge({ id, size = 'md', variant = 'icon-only', showPoints, showLabel, className }: BadgeProps) {
    const [data, setData] = useState<BadgeData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            await loadAllCaches()
            setData(medalsCache[id] || null)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) {
        return <div className={cn(CONTAINER_SIZES[size], 'animate-pulse bg-muted rounded-full', className)} />
    }

    return <GenericBadge data={data} size={size} variant={variant} showPoints={showPoints} showLabel={showLabel} className={className} fallbackIcon="Award" />
}

export function ProezaBadge({ id, size = 'md', variant = 'icon-only', showPoints, showLabel, className }: BadgeProps) {
    const [data, setData] = useState<BadgeData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            await loadAllCaches()
            setData(proezasCache[id] || null)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) {
        return <div className={cn(CONTAINER_SIZES[size], 'animate-pulse bg-muted rounded-full', className)} />
    }

    return <GenericBadge data={data} size={size} variant={variant} showPoints={showPoints} showLabel={showLabel} className={className} fallbackIcon="Flame" />
}

export function RankBadge({ id, size = 'md', variant = 'icon-only', showPoints, showLabel, className }: BadgeProps) {
    const [data, setData] = useState<BadgeData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            await loadAllCaches()
            setData(ranksCache[id] || null)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) {
        return <div className={cn(CONTAINER_SIZES[size], 'animate-pulse bg-muted rounded-full', className)} />
    }

    return <GenericBadge data={data} size={size} variant={variant} showPoints={showPoints} showLabel={showLabel} className={className} fallbackIcon="Shield" />
}

export function MissionBadge({ id, size = 'md', variant = 'icon-only', showPoints, showLabel, className }: BadgeProps) {
    const [data, setData] = useState<BadgeData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            await loadAllCaches()
            setData(missionsCache[id] || null)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) {
        return <div className={cn(CONTAINER_SIZES[size], 'animate-pulse bg-muted rounded-full', className)} />
    }

    return <GenericBadge data={data} size={size} variant={variant} showPoints={showPoints} showLabel={showLabel} className={className} fallbackIcon="Target" />
}

// Alias para compatibilidade
export { RankBadge as RankInsignia }
