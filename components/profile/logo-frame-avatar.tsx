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
    className,
    borderColor = '#1E4D40' // Verde Floresta padrão
}: LogoFrameAvatarProps) {

    // Dimensões baseadas no size
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
    }

    // Calcular espessura da borda baseado no tamanho
    const borderSizes = {
        sm: 'border-[3px]',
        md: 'border-[4px]',
        lg: 'border-[6px]',
        xl: 'border-[8px]',
    }

    return (
        <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
            {/* 
               MOLDURA DIAMANTE 
               Rotação de 45 graus para criar o losango.
            */}
            <div
                className={cn(
                    "absolute inset-0 bg-[#F2F4F3] transform rotate-45 overflow-hidden shadow-2xl z-10 transition-transform duration-300 group-hover:scale-105",
                    borderSizes[size],
                    "border-[#1E4D40]" // Usando classe Tailwind se possível, ou style inline para cor custom
                )}
                style={{ borderColor: borderColor }}
            >
                {/* 
                   CONTEÚDO DA IMAGEM
                   Contra-rotacionado para ficar em pé.
                   Escalado (145%) para cobrir os cantos do losango sem deixar vazio.
                */}
                <div className="absolute inset-0 transform -rotate-45 flex items-center justify-center">
                    {src ? (
                        <div className="relative w-[145%] h-[145%]">
                            <Image
                                src={src}
                                alt={alt || "Avatar"}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-[145%] h-[145%] bg-[#1E4D40]/10 flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#1E4D40]/30">?</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 
               ELEMENTO DECORATIVO "MONTANHAS" (Topo)
               Tentativa de simular o topo do logo.
               Posicionado no vértice superior.
            */}
            <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 z-20 w-[40%] h-[20%] pointer-events-none">
                {/* Svg simplificado de montanha se ajustando ao topo */}
                <svg
                    viewBox="0 0 100 40"
                    className="w-full h-full drop-shadow-sm"
                    style={{ fill: borderColor }}
                >
                    <path d="M50 0 L80 40 L20 40 Z" />
                    <path d="M25 10 L45 40 L5 40 Z" opacity="0.8" />
                    <path d="M75 10 L95 40 L55 40 Z" opacity="0.8" />
                </svg>
            </div>
        </div>
    )
}
