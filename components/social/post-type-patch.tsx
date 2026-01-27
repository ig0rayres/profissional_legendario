'use client'

import { cn } from '@/lib/utils'
import { Users, Flame, CheckCircle2, Award, Shield, Target, Flag, Medal } from 'lucide-react'

export type PostType = 'confraria' | 'em_campo' | 'projeto_entregue' | 'medalha'

interface PostTypePatchProps {
    type: PostType
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    className?: string
}

// Paleta sóbria para empresários - inspirada em medalhas militares
const patchConfig = {
    confraria: {
        label: 'CONFRARIA',
        icon: Users,
        // Bronze/cobre escuro - representa networking e parceria
        bg: 'bg-stone-800',
        border: 'border-stone-600',
        text: 'text-stone-200',
        iconColor: 'text-amber-600',
        accent: 'ring-amber-700/30',
    },
    em_campo: {
        label: 'EM CAMPO',
        icon: Target,
        // Cinza grafite com detalhe vermelho sutil
        bg: 'bg-zinc-800',
        border: 'border-zinc-600',
        text: 'text-zinc-200',
        iconColor: 'text-red-500',
        accent: 'ring-red-800/30',
    },
    projeto_entregue: {
        label: 'ENTREGUE',
        icon: Flag,
        // Verde militar escuro - missão cumprida
        bg: 'bg-emerald-900',
        border: 'border-emerald-700',
        text: 'text-emerald-100',
        iconColor: 'text-emerald-400',
        accent: 'ring-emerald-600/30',
    },
    medalha: {
        label: 'MEDALHA',
        icon: Medal,
        // Dourado fosco - conquista especial
        bg: 'bg-yellow-900/80',
        border: 'border-yellow-700',
        text: 'text-yellow-100',
        iconColor: 'text-yellow-500',
        accent: 'ring-yellow-600/30',
    },
}

const sizeConfig = {
    sm: {
        container: 'h-6 px-2.5 gap-1.5',
        icon: 'w-3 h-3',
        text: 'text-[10px]',
    },
    md: {
        container: 'h-7 px-3 gap-2',
        icon: 'w-3.5 h-3.5',
        text: 'text-xs',
    },
    lg: {
        container: 'h-8 px-4 gap-2',
        icon: 'w-4 h-4',
        text: 'text-sm',
    },
}

export function PostTypePatch({
    type,
    size = 'md',
    showLabel = true,
    className,
}: PostTypePatchProps) {
    const config = patchConfig[type]
    if (!config) return null // Fallback se tipo não existir

    const sizes = sizeConfig[size] || sizeConfig.md
    const Icon = config.icon

    return (
        <div
            className={cn(
                // Base - formato de tag militar
                "inline-flex items-center rounded",
                "font-semibold uppercase tracking-wider",
                // Cores sóbrias
                config.bg,
                config.text,
                // Borda sutil
                "border",
                config.border,
                // Ring accent
                "ring-1",
                config.accent,
                // Size
                sizes.container,
                className
            )}
        >
            {/* Icon */}
            <Icon className={cn(sizes.icon, config.iconColor)} />

            {/* Label */}
            {showLabel && (
                <span className={cn(sizes.text, "font-bold tracking-wide")}>
                    {config.label}
                </span>
            )}
        </div>
    )
}

// ====================================================
// SEAL VERSION - Insígnia circular para cards
// ====================================================

interface PostTypeSealProps {
    type: PostType
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sealSizeConfig = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { container: 'w-11 h-11', icon: 'w-5 h-5' },
    lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
}

export function PostTypeSeal({
    type,
    size = 'md',
    className,
}: PostTypeSealProps) {
    const config = patchConfig[type]
    if (!config) return null // Fallback se tipo não existir

    const sizes = sealSizeConfig[size] || sealSizeConfig.md
    const Icon = config.icon

    return (
        <div
            className={cn(
                // Circular seal
                "relative flex items-center justify-center rounded-full",
                // Background escuro
                config.bg,
                // Double border - estilo medalha militar
                "border-2",
                config.border,
                "ring-2 ring-offset-1 ring-offset-gray-900",
                config.accent,
                // Shadow sutil
                "shadow-lg",
                // Size
                sizes.container,
                className
            )}
        >
            {/* Inner ring detail */}
            <div className="absolute inset-1 rounded-full border border-white/10" />

            {/* Icon */}
            <Icon className={cn(sizes.icon, config.iconColor, "relative z-10")} />
        </div>
    )
}

// ====================================================
// BANNER VERSION - Faixa sóbria para topo do card
// ====================================================

interface PostTypeBannerProps {
    type: PostType
    date?: string
    className?: string
}

export function PostTypeBanner({
    type,
    date,
    className,
}: PostTypeBannerProps) {
    const config = patchConfig[type]
    if (!config) return null // Fallback se tipo não existir

    const Icon = config.icon

    return (
        <div className={cn(
            // Fundo escuro sólido - sem gradiente
            config.bg,
            "px-4 py-2 flex items-center justify-between",
            "border-b",
            config.border,
            className
        )}>
            {/* Left side - Icon + Label */}
            <div className="flex items-center gap-2">
                <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center",
                    "bg-black/20 border border-white/10"
                )}>
                    <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
                </div>
                <span className={cn(
                    "font-bold text-xs uppercase tracking-wider",
                    config.text
                )}>
                    {config.label}
                </span>
            </div>

            {/* Right side - Date */}
            {date && (
                <span className="text-white/50 text-xs font-medium">
                    {date}
                </span>
            )}
        </div>
    )
}

// ====================================================
// MINIMAL BADGE - Para uso inline muito discreto
// ====================================================

interface PostTypeMiniBadgeProps {
    type: PostType
    className?: string
}

export function PostTypeMiniBadge({ type, className }: PostTypeMiniBadgeProps) {
    const config = patchConfig[type]
    const Icon = config.icon

    return (
        <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded",
            "bg-gray-800/80 border border-gray-700",
            "text-[10px] font-semibold uppercase tracking-wide text-gray-400",
            className
        )}>
            <Icon className={cn("w-3 h-3", config.iconColor)} />
            <span>{config.label}</span>
        </div>
    )
}
