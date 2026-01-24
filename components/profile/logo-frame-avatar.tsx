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

    // Dimensões
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
    }

    // Calcular espessura relativa do stroke baseada no tamanho não é trivial em SVG responsivo,
    // mas vamos fixar um strokeWidth no SVG que fica visualmente agradável (ex: 3% a 4% do tamanho).

    return (
        <div className={cn("relative flex items-center justify-center filter drop-shadow-xl", sizeClasses[size], className)}>

            {/* 1. MÁSCARA DA IMAGEM E CONTEÚDO */}
            {/* Recortamos a imagem em formato de losango para ela não vazar da moldura */}
            <div
                className="absolute inset-2 z-0 overflow-hidden"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }}
            >
                {/* Fundo caso não tenha imagem ou transparente */}
                <div className="absolute inset-0 bg-[#F2F4F3]"></div>

                {/* Imagem do Usuário */}
                <div className="relative w-full h-full transform scale-[1.05]"> {/* Leve zoom para garantir borda */}
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

            {/* 2. MOLDURA SVG (BORDA + MONTANHA INTEGRADA) */}
            {/* Posicionado POR CIMA da imagem */}
            <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                style={{ overflow: 'visible' }} // Permitir sombra/glow se precisar
            >
                <defs>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                    </filter>
                </defs>

                {/* Grupo unificado da moldura */}
                <g fill={borderColor} stroke={borderColor} strokeWidth="0">

                    {/* A. BORDA LOSANGO (Usando path composto ou stroke simulado) */}
                    {/* Vamos desenhar a borda como um shape preenchido com um buraco no meio (fill-rule: evenodd) */}
                    <path
                        d="M 50 0 L 100 50 L 50 100 L 0 50 Z  M 50 6 L 94 50 L 50 94 L 6 50 Z"
                        fillRule="evenodd"
                        shapeRendering="geometricPrecision"
                    />

                    {/* B. MONTANHA NO TOPO (Integrada) */}
                    {/* Um triângulo que 'desce' do topo e se funde com a borda interna */}
                    <path
                        d="M 50 5 L 70 30 L 30 30 Z"
                        shapeRendering="geometricPrecision"
                    // Ajuste fino: O topo da montanha (50, 5) deve coincidir ou sobrepor levemente a borda interna superior
                    // A borda interna superior (vértice) está em (50, 6).
                    // Vamos começar em (50, 0) para garantir conexão total com o topo externo, 
                    // ou (50, 4) para ficar 'dentro' da borda.
                    />

                    {/* Montanha mais detalhada (estilo logo - 3 picos) */}
                    <path
                        d="M 50 2 L 68 28 L 55 24 L 50 32 L 45 24 L 32 28 Z"
                        fill={borderColor}
                        className="hidden" // Habilitar se quiser silhouette complexa
                    />

                </g>

                {/* Opcional: Neve no topo da montanha (Branco) */}
                <path
                    d="M 50 5 L 56 14 L 50 11 L 44 14 Z"
                    fill="#F2F4F3"
                    opacity="0.9"
                />

            </svg>
        </div>
    )
}
