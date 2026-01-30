'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Crown, ChevronLeft, ChevronRight, MapPin, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MarketplaceAd } from '@/lib/data/marketplace'

interface LegendaryBannerProps {
    ads: MarketplaceAd[]
}

export function LegendaryBanner({ ads }: LegendaryBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovering, setIsHovering] = useState(false)
    const [direction, setDirection] = useState<'left' | 'right'>('right')

    const legendaryAds = ads.filter(ad =>
        ad.ad_tier?.tier_level === 'lendario' && ad.status === 'active'
    )

    // Auto-play (pausa no hover)
    useEffect(() => {
        if (legendaryAds.length <= 1 || isHovering) return

        const interval = setInterval(() => {
            setDirection('right')
            setCurrentIndex(prev => (prev + 1) % legendaryAds.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [legendaryAds.length, isHovering])

    const goToSlide = useCallback((index: number) => {
        setDirection(index > currentIndex ? 'right' : 'left')
        setCurrentIndex(index)
    }, [currentIndex])

    const goNext = useCallback(() => {
        setDirection('right')
        setCurrentIndex(prev => (prev + 1) % legendaryAds.length)
    }, [legendaryAds.length])

    const goPrev = useCallback(() => {
        setDirection('left')
        setCurrentIndex(prev => (prev - 1 + legendaryAds.length) % legendaryAds.length)
    }, [legendaryAds.length])

    if (legendaryAds.length === 0) return null

    const currentAd = legendaryAds[currentIndex]
    const images = currentAd.images || []
    const mainPhoto = images[0] || '/placeholder-product.jpg'

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    return (
        <div
            className="relative mb-8"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Banner Container com borda dourada */}
            <div className="relative overflow-hidden rounded-2xl">
                {/* Borda Dourada Animada */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-2xl animate-pulse opacity-80" />

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 via-yellow-500/30 to-amber-600/30 blur-xl rounded-2xl" />

                {/* Conteúdo Principal */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden m-[2px]">
                    <Link href={`/marketplace/${currentAd.id}`} className="block">
                        <div className="flex flex-col md:flex-row">
                            {/* Imagem do Produto */}
                            <div className="relative w-full md:w-2/3 aspect-video md:aspect-[16/9] overflow-hidden">
                                <Image
                                    src={mainPhoto}
                                    alt={currentAd.title}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    priority
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/90 md:block hidden" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent md:hidden" />

                                {/* Badge LENDÁRIO no topo */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full shadow-lg shadow-amber-500/30">
                                    <Crown className="w-5 h-5 text-white animate-pulse" />
                                    <span className="text-white font-bold text-sm tracking-wide">LENDÁRIO</span>
                                </div>

                                {/* Visualizações */}
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                                    <Eye className="w-4 h-4" />
                                    <span>{currentAd.views_count || 0}</span>
                                </div>
                            </div>

                            {/* Informações do Produto */}
                            <div className="relative w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center">
                                {/* Título */}
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2">
                                    {currentAd.title}
                                </h3>

                                {/* Localização */}
                                <div className="flex items-center gap-2 text-gray-400 mb-4">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{currentAd.location || 'Brasil'}</span>
                                </div>

                                {/* Descrição curta */}
                                <p className="text-gray-300 text-sm mb-6 line-clamp-2 hidden md:block">
                                    {currentAd.description}
                                </p>

                                {/* Preço */}
                                <div className="mb-6">
                                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                                        {formatPrice(currentAd.price)}
                                    </span>
                                </div>

                                {/* CTA Button */}
                                <Button
                                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-6 text-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02]"
                                >
                                    Ver Anúncio
                                </Button>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Controles do Carrossel */}
            {legendaryAds.length > 1 && (
                <>
                    {/* Setas de Navegação */}
                    <button
                        onClick={(e) => { e.preventDefault(); goPrev() }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); goNext() }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicadores de Slide */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {legendaryAds.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-300",
                                    index === currentIndex
                                        ? "bg-amber-500 scale-125 shadow-lg shadow-amber-500/50"
                                        : "bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
