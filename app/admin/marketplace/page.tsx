'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit2, Trash2, Eye, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import {
    MOCK_MARKETPLACE_CATEGORIES,
    MOCK_MARKETPLACE_LISTINGS,
    MarketplaceCategory,
    MarketplaceListing
} from '@/lib/data/mock'
import { MarketplaceCategoryDialog } from '@/components/admin/marketplace-category-dialog'
import * as LucideIcons from 'lucide-react'

export default function MarketplacePage() {
    const [activeTab, setActiveTab] = useState('anuncios')
    const [categories, setCategories] = useState<MarketplaceCategory[]>(MOCK_MARKETPLACE_CATEGORIES)
    const [listings, setListings] = useState<MarketplaceListing[]>(MOCK_MARKETPLACE_LISTINGS)

    // Category management
    const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    // Statistics
    const totalListings = listings.length
    const activeListings = listings.filter(l => l.status === 'active').length
    const totalValue = listings.filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.price, 0)

    // Filtered listings
    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || listing.categoryId === categoryFilter
        const matchesStatus = statusFilter === 'all' || listing.status === statusFilter
        return matchesSearch && matchesCategory && matchesStatus
    })

    // Handlers
    const handleSaveCategory = (category: Partial<MarketplaceCategory>) => {
        if (selectedCategory) {
            setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, ...category } as MarketplaceCategory : c))
        } else {
            setCategories(prev => [...prev, category as MarketplaceCategory])
        }
        setSelectedCategory(null)
    }

    const handleEditCategory = (category: MarketplaceCategory) => {
        setSelectedCategory(category)
        setIsCategoryDialogOpen(true)
    }

    const handleNewCategory = () => {
        setSelectedCategory(null)
        setIsCategoryDialogOpen(true)
    }

    const handleDeleteCategory = (category: MarketplaceCategory) => {
        if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            setCategories(prev => prev.filter(c => c.id !== category.id))
        }
    }

    const handleDeleteListing = (listing: MarketplaceListing) => {
        if (confirm(`Tem certeza que deseja excluir o anúncio "${listing.title}"?`)) {
            setListings(prev => prev.filter(l => l.id !== listing.id))
        }
    }

    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName]
        return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Tag className="w-5 h-5" />
    }

    const getStatusBadge = (status: MarketplaceListing['status']) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
            active: { variant: 'default', label: 'Ativo' },
            expired: { variant: 'destructive', label: 'Expirado' },
            sold: { variant: 'secondary', label: 'Vendido' },
            removed: { variant: 'outline', label: 'Removido' }
        }
        const config = variants[status] || variants.active
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const getDaysUntilExpiration = (expiresAt: string) => {
        const now = new Date()
        const expiration = new Date(expiresAt)
        const diff = expiration.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        return days
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-impact text-primary">Gestão do Marketplace</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie categorias e anúncios da plataforma
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Categorias Ativas</div>
                    <div className="text-2xl font-bold text-primary mt-1">
                        {categories.filter(c => c.active).length}
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Total de Anúncios</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">{totalListings}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Anúncios Ativos</div>
                    <div className="text-2xl font-bold text-green-500 mt-1">{activeListings}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Valor Total (Ativos)</div>
                    <div className="text-2xl font-bold text-purple-500 mt-1">
                        R$ {(totalValue / 1000).toFixed(0)}K
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="anuncios">Anúncios ({filteredListings.length})</TabsTrigger>
                    <TabsTrigger value="categorias">Categorias ({categories.length})</TabsTrigger>
                </TabsList>

                {/* ANÚNCIOS TAB */}
                <TabsContent value="anuncios" className="mt-6 space-y-4">
                    {/* Filters */}
                    <div className="glass-strong p-4 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título ou descrição..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">Todas as categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">Todos os status</option>
                                <option value="active">Ativo</option>
                                <option value="expired">Expirado</option>
                                <option value="sold">Vendido</option>
                                <option value="removed">Removido</option>
                            </select>
                        </div>
                    </div>

                    {/* Listings Table */}
                    <div className="glass-strong rounded-lg border border-primary/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary/10 border-b border-primary/20">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Título</th>
                                        <th className="text-left p-4 font-semibold">Categoria</th>
                                        <th className="text-left p-4 font-semibold">Vendedor</th>
                                        <th className="text-right p-4 font-semibold">Preço</th>
                                        <th className="text-center p-4 font-semibold">Status</th>
                                        <th className="text-center p-4 font-semibold">Expira em</th>
                                        <th className="text-center p-4 font-semibold">Visualizações</th>
                                        <th className="text-center p-4 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredListings.map((listing) => {
                                        const daysLeft = getDaysUntilExpiration(listing.expiresAt)
                                        return (
                                            <tr key={listing.id} className="border-b border-primary/10 hover:bg-primary/5">
                                                <td className="p-4">
                                                    <div className="font-medium text-primary">{listing.title}</div>
                                                    {listing.categoryName === 'Veículos' && listing.vehicleBrand && (
                                                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                            <div><span className="font-semibold">Marca:</span> {listing.vehicleBrand}</div>
                                                            {listing.vehicleModel && <div><span className="font-semibold">Modelo:</span> {listing.vehicleModel}</div>}
                                                            {listing.vehicleYear && <div><span className="font-semibold">Ano:</span> {listing.vehicleYear}</div>}
                                                            {listing.vehicleKm !== undefined && <div><span className="font-semibold">KM:</span> {listing.vehicleKm.toLocaleString('pt-BR')}</div>}
                                                            {listing.vehicleColor && <div><span className="font-semibold">Cor:</span> {listing.vehicleColor}</div>}
                                                        </div>
                                                    )}
                                                    {listing.categoryName !== 'Veículos' && (
                                                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                            {listing.location}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline">{listing.categoryName}</Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">{listing.sellerName}</div>
                                                    <div className="text-xs text-muted-foreground">{listing.sellerEmail}</div>
                                                </td>
                                                <td className="p-4 text-right font-semibold text-green-600">
                                                    {formatCurrency(listing.price)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {getStatusBadge(listing.status)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="text-sm">{formatDate(listing.expiresAt)}</div>
                                                    {listing.status === 'active' && (
                                                        <div className={`text-xs ${daysLeft < 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                            {daysLeft > 0 ? `${daysLeft} dias` : 'Hoje'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        <span className="text-sm">{listing.views}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button size="sm" variant="outline" title="Visualizar">
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" title="Editar">
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-destructive"
                                                            title="Excluir"
                                                            onClick={() => handleDeleteListing(listing)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredListings.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                Nenhum anúncio encontrado
                            </div>
                        )}
                    </div>

                    {/* Totalizador */}
                    <div className="glass-strong p-4 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-sm text-muted-foreground">Total de Anúncios</div>
                                <div className="text-xl font-bold text-primary">{filteredListings.length}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Valor Total</div>
                                <div className="text-xl font-bold text-green-600">
                                    {formatCurrency(filteredListings.reduce((sum, l) => sum + l.price, 0))}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Preço Médio</div>
                                <div className="text-xl font-bold text-purple-600">
                                    {filteredListings.length > 0
                                        ? formatCurrency(filteredListings.reduce((sum, l) => sum + l.price, 0) / filteredListings.length)
                                        : 'R$ 0'}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* CATEGORIAS TAB */}
                <TabsContent value="categorias" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <Button
                            className="glow-orange bg-secondary hover:bg-secondary/90"
                            onClick={handleNewCategory}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Categoria
                        </Button>
                    </div>

                    <MarketplaceCategoryDialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                        category={selectedCategory}
                        onSave={handleSaveCategory}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="glass-strong p-5 rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-md flex items-center justify-center"
                                            style={{ backgroundColor: category.color + '20', color: category.color }}
                                        >
                                            {getIcon(category.icon)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary">{category.name}</h3>
                                            <span className="text-xs text-muted-foreground">/{category.slug}</span>
                                        </div>
                                    </div>
                                    <Badge variant={category.active ? "default" : "secondary"}>
                                        {category.active ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </div>

                                {/* Expiration */}
                                <div className="mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-secondary" />
                                    <span className="text-sm font-semibold text-secondary">
                                        Expira em {category.expirationDays} dias
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Anúncios: </span>
                                        <span className="font-semibold text-blue-500">{category.listingCount || 0}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-primary/10">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleEditCategory(category)}
                                    >
                                        <Edit2 className="w-3 h-3 mr-1" />
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteCategory(category)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
