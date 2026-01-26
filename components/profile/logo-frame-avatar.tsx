'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoFrameAvatarProps {
    src?: string | null
    alt?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    priority?: boolean
}

export function LogoFrameAvatar({
    src,
    alt,
    size = 'lg',
    className,
    priority = false
}: LogoFrameAvatarProps) {

    // Dimensões
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-48 h-48', // Aumentado novamente (+10%)
        xl: 'w-56 h-56',
    }

    return (
        <div
            className={cn(
                "relative flex items-center justify-center group cursor-pointer transition-transform duration-500 ease-out hover:scale-105",
                sizeClasses[size],
                className
            )}
        >
            {/* EFEITO DE GLOW EXTREMO NO FUNDO AO PASSAR O MOUSE */}
            <div className="absolute inset-2 bg-orange-500/0 blur-2xl rounded-full opacity-0 group-hover:opacity-60 group-hover:bg-orange-500/30 transition-all duration-500 will-change-[opacity]" />

            {/* CONTAINER PRINCIPAL COM FILTRO DE SOMBRA NA BORDA */}
            <div className="relative w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_25px_rgba(255,100,0,0.6)] transition-all duration-500">

                {/* 1. IMAGEM DO USUÁRIO (BACKGROUND) */}
                {/* Ajustei o inset para preencher melhor a nova moldura */}
                <div
                    className="absolute inset-[8%] z-0 overflow-hidden backface-hidden"
                    style={{
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // Losango
                    }}
                >
                    {/* Fundo fallback */}
                    <div className="absolute inset-0 bg-[#0f1a15]"></div>

                    {/* Foto */}
                    <div className="relative w-full h-full transform scale-[1.35] group-hover:scale-[1.45] transition-transform duration-700 ease-in-out">
                        {src ? (
                            <Image
                                src={src}
                                alt={alt || "Avatar"}
                                fill
                                className="object-cover"
                                priority={priority}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1E4D40]/10">
                                <span className="text-3xl font-bold text-[#1E4D40]/30 opacity-50 group-hover:opacity-80 transition-opacity">?</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. MOLDURA PNG (FOREGROUND) - Nova Moldura de Montanhas */}
                {/* A moldura fica fixa em relação ao zoom interno, mantendo a estrutura sólida */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <Image
                        src="/frame-mountains.png"
                        alt="Frame"
                        fill
                        className="object-contain drop-shadow-md"
                        priority={true}
                    />
                </div>
            </div>

            {/* BRILHO ESPECULAR (OVERLAY) */}
            {/* Reflexo sutil */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
            </div>
        </div>
    )
}
