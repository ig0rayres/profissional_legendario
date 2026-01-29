'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Crown, Star, MapPin, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MarketplaceAd } from '@/lib/data/marketplace'
import { useRef, useState, useEffect } from 'react'

interface FeaturedAdsCarouselProps {
    ads: MarketplaceAd[]
}

export function FeaturedAdsCarousel({ ads }: FeaturedAdsCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    // Filtrar apenas anúncios Elite e Lendário
    const featuredAds = ads.filter(ad =>
        ad.ad_tier?.tier_level === 'lendario' || ad.ad_tier?.tier_level === 'elite'
    )

    // Se não tem anúncios em destaque, não renderiza nada
    if (featuredAds.length === 0) return null

    const updateScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
            setTimeout(updateScrollButtons, 300)
        }
    }

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    // Separar Lendários e Elite
    const lendarioAds = featuredAds.filter(ad => ad.ad_tier?.tier_level === 'lendario')
    const eliteAds = featuredAds.filter(ad => ad.ad_tier?.tier_level === 'elite')

    return (
        <div className="mb-8">
            {/* Header do Destaque */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
                        <Sparkles className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Anúncios em Destaque</h2>
                        <p className="text-xs text-muted-foreground">{featuredAds.length} anúncios premium</p>
                    </div>
                </div>

                {/* Botões de navegação */}
                {featuredAds.length > 3 && (
                    <div className="hidden md:flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Carrossel de Destaques */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                onScroll={updateScrollButtons}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {featuredAds.map((ad) => {
                    const isLendario = ad.ad_tier?.tier_level === 'lendario'
                    const mainImage = ad.images?.[0] || '/placeholder-product.jpg'

                    return (
                        <Link
                            key={ad.id}
                            href={`/marketplace/${ad.id}`}
                            className="flex-shrink-0 w-[300px] md:w-[350px] group"
                        >
                            <Card className={`
                                h-full overflow-hidden transition-all duration-300
                                ${isLendario
                                    ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30'
                                    : 'border-2 border-green-500 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30'
                                }
                            `}>
                                {/* Banner de Destaque */}
                                <div className={`
                                    py-2 px-4 text-center font-bold text-sm
                                    ${isLendario
                                        ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black animate-pulse'
                                        : 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                                    }
                                `}>
                                    {isLendario ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Crown className="w-4 h-4" />
                                            ANÚNCIO LENDÁRIO
                                            <Crown className="w-4 h-4" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Star className="w-4 h-4" />
                                            ANÚNCIO ELITE
                                            <Star className="w-4 h-4" />
                                        </span>
                                    )}
                                </div>

                                {/* Imagem */}
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={mainImage}
                                        alt={ad.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Overlay com gradiente */}
                                    <div className={`
                                        absolute inset-0 
                                        ${isLendario
                                            ? 'bg-gradient-to-t from-amber-900/60 via-transparent to-transparent'
                                            : 'bg-gradient-to-t from-green-900/60 via-transparent to-transparent'
                                        }
                                    `} />

                                    {/* Preço no canto */}
                                    <div className={`
                                        absolute bottom-2 right-2 px-3 py-1 rounded-full font-bold text-lg
                                        ${isLendario
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-green-500 text-white'
                                        }
                                    `}>
                                        {formatPrice(ad.price)}
                                    </div>

                                    {/* Views */}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm text-xs">
                                            <Eye className="w-3 h-3 mr-1" />
                                            {ad.views_count}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Conteúdo */}
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg line-clamp-1 mb-1 group-hover:text-primary transition">
                                        {ad.title}
                                    </h3>

                                    {ad.location && (
                                        <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{ad.location}</span>
                                        </div>
                                    )}

                                    {/* Vendedor */}
                                    {ad.user && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden">
                                                {(ad.user as any).avatar_url ? (
                                                    <Image
                                                        src={(ad.user as any).avatar_url}
                                                        alt={(ad.user as any).full_name}
                                                        width={24}
                                                        height={24}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                                                        {(ad.user as any).full_name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {(ad.user as any).full_name}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
