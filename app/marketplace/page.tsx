'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Store, Search, Filter, PlusCircle, Loader2, Crown, Star } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { MarketplaceCard } from '@/components/marketplace/marketplace-card'
import { LegendaryBanner } from '@/components/marketplace/legendary-banner'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { MarketplaceAd, MarketplaceCategory } from '@/lib/data/marketplace'

export default function MarketplacePage() {
    const { user } = useAuth()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // 🆕 Filtros avançados
    const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'sell' | 'buy'>('all')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [priceMin, setPriceMin] = useState<string>('')
    const [priceMax, setPriceMax] = useState<string>('')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    const [categories, setCategories] = useState<MarketplaceCategory[]>([])
    const [ads, setAds] = useState<MarketplaceAd[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        // Carregar categorias
        const { data: categoriesData } = await supabase
            .from('marketplace_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        if (categoriesData) setCategories(categoriesData)

        // Carregar anúncios ativos com relacionamentos
        const { data: adsData } = await supabase
            .from('marketplace_ads')
            .select(`
                *,
                category:marketplace_categories(id, name, slug, icon),
                ad_tier:marketplace_ad_tiers(id, name, tier_level, highlight_color, highlight_badge, position_boost),
                user:profiles(id, full_name, avatar_url, pista)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (adsData) {
            // Ordenar por position_boost do tier (destaques primeiro)
            const sorted = adsData.sort((a, b) => {
                const boostA = a.ad_tier?.position_boost || 0
                const boostB = b.ad_tier?.position_boost || 0
                return boostB - boostA
            })
            setAds(sorted)
        }

        setLoading(false)
    }

    // 🆕 Filtrar anúncios com TODOS os filtros
    const filteredAds = ads.filter(ad => {
        // Filtro de tipo (Todos, Vendas, Procurando)
        const matchesType = listingTypeFilter === 'all' || ad.listing_type === listingTypeFilter

        // Filtro de busca por texto
        const matchesSearch = !searchTerm ||
            ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ad.description?.toLowerCase().includes(searchTerm.toLowerCase()))

        // Filtro de categorias múltiplas (se != array vazio, filtrar)
        const matchesCategories = selectedCategories.length === 0 ||
            selectedCategories.includes(ad.category_id)

        // Filtro de range de preço
        const minPrice = priceMin ? parseFloat(priceMin) : 0
        const maxPrice = priceMax ? parseFloat(priceMax) : Infinity
        const matchesPrice = ad.price >= minPrice && ad.price <= maxPrice

        return matchesType && matchesSearch && matchesCategories && matchesPrice
    })

    // Contagem de resultados
    const resultsCount = filteredAds.length

    // Icone dinâmico da categoria
    function getCategoryIcon(iconName: string) {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Package
        return <Icon className="w-4 h-4" />
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-adventure pt-20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando marketplace...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure pt-20">
            {/* Header Section */}
            <div className="bg-card/95 backdrop-blur-md border-b border-primary/20 sticky top-20 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Store className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary font-montserrat">Rota Marketplace</h1>
                                <p className="text-xs text-muted-foreground">{ads.length} anúncios ativos</p>
                            </div>
                        </div>

                        <div className="flex flex-1 max-w-md w-full gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar veículos, imóveis..."
                                    className="pl-9 bg-background/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>

                        <Link href={user ? "/marketplace/create" : "/auth/login"}>
                            <Button className="glow-orange w-full md:w-auto">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Anunciar
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 🆕 Botões Principais: VENDER e COMPRAR */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {/* Botão VENDER - Verde */}
                    <Link href={user ? "/marketplace/create?type=sell" : "/auth/login"}>
                        <Button
                            className="w-full h-24 bg-secondary hover:bg-secondary/90 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all group"
                            size="lg"
                        >
                            <Store className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <div>VENDER</div>
                                <p className="text-xs font-normal opacity-80">Anuncie seu produto</p>
                            </div>
                        </Button>
                    </Link>

                    {/* Botão COMPRAR - Laranja */}
                    <Link href={user ? "/marketplace/create?type=buy" : "/auth/login"}>
                        <Button
                            className="w-full h-24 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all group"
                            size="lg"
                        >
                            <Search className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <div>COMPRAR</div>
                                <p className="text-xs font-normal opacity-80">Procuro um produto</p>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 🆕 FILTROS */}
            <div className="container mx-auto px-4 py-4">
                {/* Tabs de Tipo */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={listingTypeFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setListingTypeFilter('all')}
                        className="flex-1 md:flex-none"
                    >
                        Todos ({ads.length})
                    </Button>
                    <Button
                        variant={listingTypeFilter === 'sell' ? 'default' : 'outline'}
                        onClick={() => setListingTypeFilter('sell')}
                        className="flex-1 md:flex-none"
                    >
                        <Store className="w-4 h-4 mr-1" />
                        Vendas ({ads.filter(a => a.listing_type === 'sell').length})
                    </Button>
                    <Button
                        variant={listingTypeFilter === 'buy' ? 'outline' : 'outline'}
                        onClick={() => setListingTypeFilter('buy')}
                        className={`flex-1 md:flex-none ${listingTypeFilter === 'buy' ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
                    >
                        <Search className="w-4 h-4 mr-1" />
                        Procurando ({ads.filter(a => a.listing_type === 'buy').length})
                    </Button>
                </div>

                {/* Painel de Filtros Avançados */}
                <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 space-y-4">
                    {/* Busca por texto */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou palavra-chave..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtros Avançados (accordion) */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="w-full justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filtros Avançados
                        </span>
                        {showAdvancedFilters ? '▲' : '▼'}
                    </Button>

                    {showAdvancedFilters && (
                        <div className="space-y-4 pt-2 border-t border-primary/10">
                            {/* Categorias */}
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">📁 Categorias</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCategories([...selectedCategories, cat.id])
                                                    } else {
                                                        setSelectedCategories(selectedCategories.filter(c => c !== cat.id))
                                                    }
                                                }}
                                                className="w-4 h-4 text-primary rounded border-muted"
                                            />
                                            <span className="text-sm">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Range de Preço */}
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">💰 Faixa de Preço</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="De R$"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Até R$"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setSelectedCategories([])
                                        setPriceMin('')
                                        setPriceMax('')
                                        setListingTypeFilter('all')
                                    }}
                                    className="flex-1"
                                >
                                    🗑️ Limpar Filtros
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                >
                                    ✅ Aplicar ({resultsCount} resultados)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Categories */}
                    <div className={`
                        md:w-64 flex-shrink-0 space-y-2
                        ${mobileMenuOpen ? 'block' : 'hidden md:block'}
                    `}>
                        <h3 className="font-bold text-primary mb-4 px-2">Categorias</h3>
                        <div className="space-y-1">
                            <Button
                                variant={selectedCategory === null ? "secondary" : "ghost"}
                                className="w-full justify-start font-medium"
                                onClick={() => setSelectedCategory(null)}
                            >
                                <Store className="w-4 h-4 mr-2" />
                                Tudo
                                <Badge variant="outline" className="ml-auto">{ads.length}</Badge>
                            </Button>

                            {categories.map((category) => {
                                const count = ads.filter(a => a.category_id === category.id).length
                                return (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm"
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        {getCategoryIcon(category.icon)}
                                        <span className="ml-2">{category.name}</span>
                                        {count > 0 && (
                                            <Badge variant="outline" className="ml-auto">{count}</Badge>
                                        )}
                                    </Button>
                                )
                            })}
                        </div>

                        {/* Legenda de destaques */}
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-primary/10">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3">DESTAQUES</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                    <span>Lendário</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-green-500" />
                                    <span>Elite</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="flex-1">
                        {/* Banner Lendário */}
                        {!selectedCategory && !searchTerm && (
                            <LegendaryBanner ads={ads} />
                        )}

                        {filteredAds.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAds.map((ad) => (
                                    <MarketplaceCard key={ad.id} ad={ad} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-lg border border-primary/10">
                                <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Nenhum anúncio encontrado</p>
                                <p className="text-sm mb-4">
                                    {searchTerm || selectedCategory
                                        ? 'Tente mudar os filtros ou busque por outro termo'
                                        : 'Seja o primeiro a anunciar!'
                                    }
                                </p>
                                {user && (
                                    <Link href="/marketplace/create">
                                        <Button>
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            Criar Anúncio
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
