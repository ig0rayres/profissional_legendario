/**
 * COMPONENTES CENTRALIZADOS - ROTA DO VALENTE
 * 
 * IMPORTANTE: Todos os ícones são buscados DIRETAMENTE das tabelas do banco:
 * - medals.icon
 * - proezas.icon
 * - ranks.icon
 * - daily_missions.icon
 * 
 * NUNCA usar ícones hardcoded. Sempre referenciar o banco.
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ============================================
// TIPOS
// ============================================

interface BadgeProps {
    id: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'full' | 'icon-only' | 'compact'
    showPoints?: boolean
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

const SIZES = {
    xs: { icon: 'text-lg', container: 'w-6 h-6', text: 'text-xs' },
    sm: { icon: 'text-xl', container: 'w-8 h-8', text: 'text-xs' },
    md: { icon: 'text-2xl', container: 'w-10 h-10', text: 'text-sm' },
    lg: { icon: 'text-3xl', container: 'w-12 h-12', text: 'text-base' },
    xl: { icon: 'text-4xl', container: 'w-16 h-16', text: 'text-lg' },
}

// ============================================
// CACHE GLOBAL (evita múltiplas requisições)
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
                id: m.id, name: m.name, icon: m.icon,
                points: m.points_reward, description: m.description
            }
        })
    }

    if (proezasRes.data) {
        proezasRes.data.forEach(p => {
            proezasCache[p.id] = {
                id: p.id, name: p.name, icon: p.icon,
                points: p.points_base, description: p.description
            }
        })
    }

    if (ranksRes.data) {
        ranksRes.data.forEach(r => {
            ranksCache[r.id] = {
                id: r.id, name: r.name, icon: r.icon,
                points: r.points_required, description: r.description
            }
        })
    }

    if (missionsRes.data) {
        missionsRes.data.forEach(m => {
            missionsCache[m.id] = {
                id: m.id, name: m.name, icon: m.icon,
                points: m.points_base, description: m.description
            }
        })
    }

    cacheLoaded = true
}

// Função para invalidar cache (chamar após edição no admin)
export function invalidateBadgeCache() {
    medalsCache = {}
    proezasCache = {}
    ranksCache = {}
    missionsCache = {}
    cacheLoaded = false
}

// ============================================
// COMPONENTE: MEDALHA (Permanente)
// ============================================

export function MedalBadge({
    id,
    size = 'md',
    variant = 'full',
    showPoints = false,
    className
}: BadgeProps) {
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
        return <div className={cn(SIZES[size].container, 'animate-pulse bg-muted rounded-full', className)} />
    }

    if (!data) {
        return <span className={cn(SIZES[size].icon, className)}>🏅</span>
    }

    const sizeConfig = SIZES[size]

    if (variant === 'icon-only') {
        return (
            <span
                className={cn(sizeConfig.icon, className)}
                title={data.name}
            >
                {data.icon}
            </span>
        )
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-1', className)} title={data.name}>
                <span className={sizeConfig.icon}>{data.icon}</span>
                <span className={cn(sizeConfig.text, 'font-medium')}>{data.name}</span>
            </div>
        )
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className={sizeConfig.icon}>{data.icon}</span>
            <div>
                <p className={cn(sizeConfig.text, 'font-semibold')}>{data.name}</p>
                {showPoints && (
                    <p className="text-xs text-muted-foreground">+{data.points} pts</p>
                )}
            </div>
        </div>
    )
}

// ============================================
// COMPONENTE: PROEZA (Mensal)
// ============================================

export function ProezaBadge({
    id,
    size = 'md',
    variant = 'full',
    showPoints = false,
    className
}: BadgeProps) {
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
        return <div className={cn(SIZES[size].container, 'animate-pulse bg-muted rounded-full', className)} />
    }

    if (!data) {
        return <span className={cn(SIZES[size].icon, className)}>🔥</span>
    }

    const sizeConfig = SIZES[size]

    if (variant === 'icon-only') {
        return (
            <span
                className={cn(sizeConfig.icon, className)}
                title={data.name}
            >
                {data.icon}
            </span>
        )
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-1', className)} title={data.name}>
                <span className={sizeConfig.icon}>{data.icon}</span>
                <span className={cn(sizeConfig.text, 'font-medium')}>{data.name}</span>
            </div>
        )
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className={sizeConfig.icon}>{data.icon}</span>
            <div>
                <p className={cn(sizeConfig.text, 'font-semibold')}>{data.name}</p>
                {showPoints && (
                    <p className="text-xs text-muted-foreground">+{data.points} pts</p>
                )}
            </div>
        </div>
    )
}

// ============================================
// COMPONENTE: PATENTE (Rank)
// ============================================

export function RankBadge({
    id,
    size = 'md',
    variant = 'full',
    showPoints = false,
    className
}: BadgeProps) {
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
        return <div className={cn(SIZES[size].container, 'animate-pulse bg-muted rounded-full', className)} />
    }

    if (!data) {
        return <span className={cn(SIZES[size].icon, className)}>🔰</span>
    }

    const sizeConfig = SIZES[size]

    if (variant === 'icon-only') {
        return (
            <span
                className={cn(sizeConfig.icon, className)}
                title={data.name}
            >
                {data.icon}
            </span>
        )
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-1', className)} title={data.name}>
                <span className={sizeConfig.icon}>{data.icon}</span>
                <span className={cn(sizeConfig.text, 'font-medium')}>{data.name}</span>
            </div>
        )
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className={sizeConfig.icon}>{data.icon}</span>
            <div>
                <p className={cn(sizeConfig.text, 'font-semibold')}>{data.name}</p>
                {showPoints && (
                    <p className="text-xs text-muted-foreground">{data.points.toLocaleString()} pts</p>
                )}
            </div>
        </div>
    )
}

// ============================================
// COMPONENTE: MISSÃO DIÁRIA
// ============================================

export function MissionBadge({
    id,
    size = 'md',
    variant = 'full',
    showPoints = false,
    className
}: BadgeProps) {
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
        return <div className={cn(SIZES[size].container, 'animate-pulse bg-muted rounded-full', className)} />
    }

    if (!data) {
        return <span className={cn(SIZES[size].icon, className)}>✨</span>
    }

    const sizeConfig = SIZES[size]

    if (variant === 'icon-only') {
        return (
            <span
                className={cn(sizeConfig.icon, className)}
                title={data.name}
            >
                {data.icon}
            </span>
        )
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-1', className)} title={data.name}>
                <span className={sizeConfig.icon}>{data.icon}</span>
                <span className={cn(sizeConfig.text, 'font-medium')}>{data.name}</span>
            </div>
        )
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className={sizeConfig.icon}>{data.icon}</span>
            <div>
                <p className={cn(sizeConfig.text, 'font-semibold')}>{data.name}</p>
                {showPoints && (
                    <p className="text-xs text-muted-foreground">+{data.points} pts</p>
                )}
            </div>
        </div>
    )
}

// ============================================
// EXPORTS PARA COMPATIBILIDADE
// ============================================

// Alias para código legado
export { RankBadge as RankInsignia }
