'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Shield, Star, MapPin, Eye, Award, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarketplaceAd {
    id: string
    title: string
    price: number
    location: string
    images: string[]
    views_count: number
    ad_tier?: {
        tier_level: 'basico' | 'elite' | 'lendario'
    }
}

interface PremiumAdCardProps {
    ad: MarketplaceAd
}

export function PremiumAdCard({ ad }: PremiumAdCardProps) {
    const isLendario = ad.ad_tier?.tier_level === 'lendario'
    const isElite = ad.ad_tier?.tier_level === 'elite'
    const isPremium = isLendario || isElite

    return (
        <Link href={`/marketplace/${ad.id}`}>
            <div className={`
                group relative overflow-hidden rounded-lg
                bg-white shadow-lg hover:shadow-2xl
                transition-all duration-300
                hover:-translate-y-2
                ${isLendario ? 'border-2 border-accent ring-2 ring-accent/20' : ''}
                ${isElite ? 'border-2 border-primary' : ''}
                ${!isPremium ? 'border border-border' : ''}
            `}>
                {/* Imagem */}
                <div className="relative h-56 overflow-hidden bg-muted">
                    <Image
                        src={ad.images[0] || '/placeholder-product.jpg'}
                        alt={ad.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient overlay */}
                    <div className={`
                        absolute inset-0 bg-gradient-to-t
                        ${isLendario ? 'from-accent/80 via-accent/20 to-transparent' : ''}
                        ${isElite ? 'from-primary/80 via-primary/20 to-transparent' : ''}
                        ${!isPremium ? 'from-foreground/60 via-foreground/10 to-transparent' : ''}
                    `} />

                    {/* Badge LENDÁRIO */}
                    {isLendario && (
                        <div className="absolute top-3 left-3 z-10">
                            <div className="relative">
                                {/* Glow */}
                                <div className="absolute inset-0 bg-accent/40 blur-lg animate-pulse" />

                                {/* Badge */}
                                <div className="relative flex items-center gap-2 px-4 py-2
                                                bg-gradient-to-br from-accent via-orange-500 to-orange-700
                                                border border-orange-400
                                                shadow-xl shadow-accent/50
                                                transform transition-all duration-200
                                                group-hover:scale-110 group-hover:-rotate-2">
                                    <Award className="w-4 h-4 text-white" />
                                    <span className="font-['Montserrat'] font-extrabold text-white text-xs uppercase tracking-wider">
                                        LENDÁRIO
                                    </span>
                                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                                </div>

                                {/* Ribbon */}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2
                                                w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px]
                                                border-l-transparent border-r-transparent border-t-orange-800" />
                            </div>
                        </div>
                    )}

                    {/* Badge ELITE */}
                    {isElite && (
                        <div className="absolute top-3 left-3 z-10">
                            <div className="flex items-center gap-2 px-3 py-1.5
                                            bg-primary border border-accent
                                            shadow-lg
                                            transform transition-all duration-200
                                            group-hover:scale-110">
                                <Shield className="w-4 h-4 text-accent" />
                                <span className="font-['Montserrat'] font-bold text-white text-xs uppercase tracking-wide">
                                    ELITE
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Preço - Canto inferior */}
                    <div className={`
                        absolute bottom-3 left-3 px-4 py-2
                        transform -skew-x-6 shadow-xl
                        ${isLendario ? 'bg-accent glow-orange-strong' : ''}
                        ${isElite ? 'bg-primary' : ''}
                        ${!isPremium ? 'bg-foreground' : ''}
                    `}>
                        <span className="inline-block transform skew-x-6
                                       font-['Montserrat'] font-extrabold text-white text-xl">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                maximumFractionDigits: 0
                            }).format(ad.price)}
                        </span>
                    </div>

                    {/* Badge "Em Alta" para anúncios com muitas views */}
                    {ad.views_count > 500 && (
                        <div className="absolute top-3 right-3 z-10">
                            <div className="flex items-center gap-1 px-2 py-1
                                            bg-red-600 rounded-full
                                            shadow-lg shadow-red-600/50
                                            animate-pulse">
                                <TrendingUp className="w-3 h-3 text-white" />
                                <span className="font-['Montserrat'] font-bold text-white text-[10px] uppercase">
                                    EM ALTA
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-3">
                    {/* Título */}
                    <h3 className={`
                        font-['Montserrat'] font-extrabold uppercase
                        line-clamp-2 transition-colors
                        ${isLendario ? 'text-accent text-lg' : ''}
                        ${isElite ? 'text-primary text-lg' : ''}
                        ${!isPremium ? 'text-foreground text-base' : ''}
                        group-hover:text-accent
                    `}>
                        {ad.title}
                    </h3>

                    {/* Separador decorativo - apenas para premium */}
                    {isPremium && (
                        <div className="flex items-center gap-2">
                            <div className={`
                                h-px flex-1 bg-gradient-to-r from-transparent
                                ${isLendario ? 'via-accent to-transparent' : ''}
                                ${isElite ? 'via-primary to-transparent' : ''}
                            `} />
                            <Star className={`
                                w-3 h-3
                                ${isLendario ? 'text-accent fill-accent' : ''}
                                ${isElite ? 'text-primary fill-primary' : ''}
                            `} />
                            <div className={`
                                h-px flex-1 bg-gradient-to-r to-transparent
                                ${isLendario ? 'from-accent' : ''}
                                ${isElite ? 'from-primary' : ''}
                            `} />
                        </div>
                    )}

                    {/* Metadados */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin className={`
                                w-4 h-4
                                ${isLendario ? 'text-accent' : ''}
                                ${isElite ? 'text-primary' : ''}
                            `} />
                            <span className="line-clamp-1">{ad.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {ad.views_count.toLocaleString('pt-BR')}
                        </span>
                    </div>

                    {/* CTA */}
                    <Button
                        className={`
                            w-full font-['Montserrat'] font-bold uppercase text-sm
                            transform transition-all duration-200
                            hover:scale-105 active:scale-95
                            ${isLendario ? 'bg-accent hover:bg-accent/90 text-white border-2 border-accent glow-orange' : ''}
                            ${isElite ? 'bg-primary hover:bg-primary/90 text-white border-2 border-accent' : ''}
                            ${!isPremium ? 'bg-primary hover:bg-primary/90 text-white' : ''}
                        `}
                    >
                        VER DETALHES →
                    </Button>
                </div>

                {/* Efeito de brilho no hover - apenas para premium */}
                {isPremium && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className={`
                            absolute inset-0
                            ${isLendario ? 'bg-gradient-to-tr from-accent/10 via-transparent to-accent/5' : ''}
                            ${isElite ? 'bg-gradient-to-tr from-primary/10 via-transparent to-primary/5' : ''}
                        `} />
                    </div>
                )}
            </div>
        </Link>
    )
}
