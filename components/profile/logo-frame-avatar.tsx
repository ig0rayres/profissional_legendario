'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoFrameAvatarProps {
    src?: string | null
    alt?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    borderColor?: string
}

export function LogoFrameAvatar({
    src,
    alt,
    size = 'lg',
    className
}: LogoFrameAvatarProps) {

    // Dimensões
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
    }

    return (
        <div className={cn("relative flex items-center justify-center filter drop-shadow-xl", sizeClasses[size], className)}>

            {/* 1. IMAGEM DO USUÁRIO */}
            {/* Posicionada no fundo, recortada em losango para não vazar nos cantos transparentes da moldura */}
            {/* O inset-1 garante que ela fique levemente menor que o container total, para não vazar 1px se o antialiasing falhar */}
            <div
                className="absolute inset-[10%] z-0 overflow-hidden"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }}
            >
                {/* Fundo de fallback */}
                <div className="absolute inset-0 bg-[#F2F4F3]"></div>

                {/* Foto */}
                <div className="relative w-full h-full transform scale-[1.35]"> {/* Zoom para preencher bem os cantos internos da moldura */}
                    {src ? (
                        <Image
                            src={src}
                            alt={alt || "Avatar"}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1E4D40]/10">
                            <span className="text-3xl font-bold text-[#1E4D40]/30 opacity-50">?</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. MOLDURA PNG ORIGINAL (Sobreposição) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Image
                    src="/images/logo-frame.png"
                    alt="Frame"
                    fill
                    className="object-contain" // Garante que a proporção da moldura seja mantida
                    priority
                />
            </div>

        </div>
    )
}
