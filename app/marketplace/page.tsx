'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Store, Search, Filter, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MARKETPLACE_CATEGORIES, MOCK_MARKETPLACE_ITEMS } from '@/lib/data/marketplace'
import { MarketplaceCard } from '@/components/marketplace/marketplace-card'
import { useAuth } from '@/lib/auth/context'

export default function MarketplacePage() {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const filteredItems = MOCK_MARKETPLACE_ITEMS.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true
        return matchesSearch && matchesCategory
    })

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
                            <h1 className="text-2xl font-bold text-primary font-montserrat">Rota Marketplace</h1>
                        </div>

                        <div className="flex flex-1 max-w-md w-full gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar itens..."
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
                                Anunciar Item
                            </Button>
                        </Link>
                    </div>
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
                                Tudo
                            </Button>
                            {MARKETPLACE_CATEGORIES.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "secondary" : "ghost"}
                                    className="w-full justify-start text-sm"
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="flex-1">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredItems.map((item) => (
                                    <MarketplaceCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-lg border border-primary/10">
                                <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Nenhum item encontrado</p>
                                <p className="text-sm">Tente mudar os filtros ou busque por outro termo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
