'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Award, Star, MapPin, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LegendaryAd {
    id: string
    title: string
    price: number
    location: string
    images: string[]
    views_count: number
    created_at: string
}

interface LegendaryCarouselProps {
    ads: LegendaryAd[]
}

export function LegendaryCarousel({ ads }: LegendaryCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying || ads.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying, ads.length])

    const goToPrevious = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
    }

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % ads.length)
    }

    if (ads.length === 0) return null

    const currentAd = ads[currentIndex]

    return (
        <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/95 to-primary/80 shadow-2xl">
            {/* Brasão Watermark */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M50 10 L70 30 L70 70 L50 90 L30 70 L30 30 Z" fill="currentColor" />
                    </svg>
                </div>
            </div>

            {/* Imagem do Produto */}
            <div className="absolute inset-0">
                <Image
                    src={currentAd.images[0] || '/placeholder-product.jpg'}
                    alt={currentAd.title}
                    fill
                    className="object-cover"
                    priority
                />

                {/* Gradient Overlay - Verde Rota */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />

                {/* Textura sutil */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
            </div>

            {/* Badge LENDÁRIO - Estilo Patch Militar */}
            <div className="absolute top-8 right-8 z-20">
                {/* Glow laranja pulsante */}
                <div className="absolute inset-0 bg-accent/30 blur-2xl animate-pulse" />

                {/* Badge principal */}
                <div className="relative">
                    {/* Borda decorativa rotacionada */}
                    <div className="absolute inset-0 border-2 border-accent/40 rounded-sm transform rotate-45" />

                    {/* Patch militar */}
                    <div className="relative flex items-center gap-3 px-6 py-3
                                    bg-gradient-to-br from-accent via-orange-500 to-orange-700
                                    border-2 border-orange-400
                                    shadow-2xl shadow-accent/60
                                    transform transition-all duration-300
                                    hover:scale-110 hover:-rotate-2">

                        {/* Ícone de medalha */}
                        <Award className="w-6 h-6 text-white drop-shadow-lg" />

                        {/* Texto MONTSERRAT uppercase */}
                        <span className="font-['Montserrat'] font-extrabold text-white 
                                       tracking-widest uppercase text-base drop-shadow-lg">
                            LENDÁRIO
                        </span>

                        {/* Estrelas decorativas */}
                        <div className="flex gap-1">
                            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                        </div>
                    </div>

                    {/* Ribbon effect */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2
                                    w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px]
                                    border-l-transparent border-r-transparent border-t-orange-800" />
                </div>
            </div>

            {/* Conteúdo - Parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <div className="max-w-4xl">
                    {/* Tag "ANÚNCIO LENDÁRIO" */}
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2
                                    bg-accent/90 backdrop-blur-sm
                                    border border-accent/50">
                        <Award className="w-4 h-4 text-white" />
                        <span className="font-['Montserrat'] font-bold text-white text-xs uppercase tracking-wider">
                            Anúncio Lendário
                        </span>
                    </div>

                    {/* Separador decorativo */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent to-accent/50" />
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <div className="h-px w-24 bg-accent/50" />
                    </div>

                    {/* Título */}
                    <h2 className="font-['Montserrat'] font-extrabold text-white text-4xl uppercase mb-3
                                   drop-shadow-2xl line-clamp-2">
                        {currentAd.title}
                    </h2>

                    {/* Preço - Estilo tático */}
                    <div className="inline-block mb-6 px-6 py-3
                                    bg-accent glow-orange-strong
                                    transform -skew-x-6 shadow-xl">
                        <span className="inline-block transform skew-x-6
                                       font-['Montserrat'] font-extrabold text-white text-3xl">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(currentAd.price)}
                        </span>
                    </div>

                    {/* Metadados */}
                    <div className="flex items-center gap-6 mb-6 text-white/90">
                        <span className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-accent" />
                            <span className="font-medium">{currentAd.location}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-accent" />
                            <span className="font-medium">{currentAd.views_count.toLocaleString('pt-BR')} visualizações</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent" />
                            <span className="font-medium">
                                {new Date(currentAd.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </span>
                    </div>

                    {/* CTA */}
                    <Link href={`/marketplace/${currentAd.id}`}>
                        <Button
                            size="lg"
                            className="font-['Montserrat'] font-bold uppercase tracking-wider
                                     bg-white hover:bg-white/90 text-primary
                                     border-2 border-accent
                                     shadow-xl hover:shadow-2xl
                                     transform transition-all duration-200
                                     hover:scale-105 active:scale-95
                                     px-8 py-6 text-base"
                        >
                            VER DETALHES →
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Controles de navegação */}
            {ads.length > 1 && (
                <>
                    {/* Botão Anterior */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                                   w-12 h-12 rounded-full
                                   bg-white/10 hover:bg-white/20 backdrop-blur-md
                                   border border-white/30
                                   flex items-center justify-center
                                   transition-all duration-200
                                   hover:scale-110 active:scale-95"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    {/* Botão Próximo */}
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                                   w-12 h-12 rounded-full
                                   bg-white/10 hover:bg-white/20 backdrop-blur-md
                                   border border-white/30
                                   flex items-center justify-center
                                   transition-all duration-200
                                   hover:scale-110 active:scale-95"
                        aria-label="Próximo"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {ads.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index)
                                    setIsAutoPlaying(false)
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? 'w-8 bg-accent'
                                        : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                                aria-label={`Ir para anúncio ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
