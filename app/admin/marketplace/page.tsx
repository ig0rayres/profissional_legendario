'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Plus, Search, Edit2, Trash2, Eye, Clock, Loader2, Crown, Star,
    DollarSign, CheckCircle, Tag, ShoppingBag, Settings
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    MarketplaceCategory,
    MarketplaceAdTier,
    MarketplaceAd,
    AD_STATUS_LABELS,
    TIER_LEVEL_LABELS,
    formatDaysRemaining
} from '@/lib/data/marketplace'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function MarketplaceAdminPage() {
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('anuncios')

    // Data
    const [categories, setCategories] = useState<MarketplaceCategory[]>([])
    const [tiers, setTiers] = useState<MarketplaceAdTier[]>([])
    const [ads, setAds] = useState<MarketplaceAd[]>([])

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    // Dialogs
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [tierDialogOpen, setTierDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null)
    const [selectedTier, setSelectedTier] = useState<MarketplaceAdTier | null>(null)
    const [saving, setSaving] = useState(false)

    // Form states
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: '',
        icon: 'Package',
        duration_days: 30,
        is_active: true
    })

    const [tierForm, setTierForm] = useState({
        category_id: '',
        name: '',
        tier_level: 'basico' as 'basico' | 'elite' | 'lendario',
        price: 0,
        duration_days: 30,
        highlight_color: '',
        highlight_badge: '',
        position_boost: 0,
        is_active: true
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        // Carregar categorias
        const { data: categoriesData } = await supabase
            .from('marketplace_categories')
            .select('*')
            .order('display_order')

        if (categoriesData) setCategories(categoriesData)

        // Carregar tiers
        const { data: tiersData } = await supabase
            .from('marketplace_ad_tiers')
            .select('*')
            .order('position_boost')

        if (tiersData) setTiers(tiersData)

        // Carregar anúncios com relacionamentos
        const { data: adsData } = await supabase
            .from('marketplace_ads')
            .select(`
                *,
                category:marketplace_categories(id, name, slug),
                ad_tier:marketplace_ad_tiers(id, name, tier_level),
                user:profiles(id, full_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

        if (adsData) setAds(adsData)

        setLoading(false)
    }

    // Statistics
    const activeAds = ads.filter(a => a.status === 'active').length
    const totalValue = ads.filter(a => a.status === 'active').reduce((sum, a) => sum + a.price, 0)
    const soldAds = ads.filter(a => a.status === 'sold').length

    // Filtered ads
    const filteredAds = ads.filter(ad => {
        const matchesSearch = !searchQuery ||
            ad.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || ad.category_id === categoryFilter
        const matchesStatus = statusFilter === 'all' || ad.status === statusFilter
        return matchesSearch && matchesCategory && matchesStatus
    })

    // Icon helper
    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Package
        return <Icon className="w-5 h-5" />
    }

    // Format helpers
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR')
    }

    // ===== CATEGORY HANDLERS =====
    const openNewCategory = () => {
        setSelectedCategory(null)
        setCategoryForm({
            name: '',
            slug: '',
            icon: 'Package',
            duration_days: 30,
            is_active: true
        })
        setCategoryDialogOpen(true)
    }

    const openEditCategory = (cat: MarketplaceCategory) => {
        setSelectedCategory(cat)
        setCategoryForm({
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            duration_days: cat.duration_days,
            is_active: cat.is_active
        })
        setCategoryDialogOpen(true)
    }

    const saveCategory = async () => {
        if (!categoryForm.name || !categoryForm.slug) {
            toast.error('Nome e slug são obrigatórios')
            return
        }

        setSaving(true)

        try {
            if (selectedCategory) {
                await supabase
                    .from('marketplace_categories')
                    .update({
                        name: categoryForm.name,
                        slug: categoryForm.slug,
                        icon: categoryForm.icon,
                        duration_days: categoryForm.duration_days,
                        is_active: categoryForm.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedCategory.id)
            } else {
                await supabase
                    .from('marketplace_categories')
                    .insert({
                        name: categoryForm.name,
                        slug: categoryForm.slug,
                        icon: categoryForm.icon,
                        duration_days: categoryForm.duration_days,
                        is_active: categoryForm.is_active,
                        display_order: categories.length + 1
                    })
            }

            toast.success('Categoria salva!')
            setCategoryDialogOpen(false)
            loadData()
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const deleteCategory = async (cat: MarketplaceCategory) => {
        if (!confirm(`Excluir categoria "${cat.name}"? Os anúncios serão afetados.`)) return

        await supabase.from('marketplace_categories').delete().eq('id', cat.id)
        toast.success('Categoria excluída')
        loadData()
    }

    // ===== TIER HANDLERS =====
    const openNewTier = () => {
        setSelectedTier(null)
        setTierForm({
            category_id: categories[0]?.id || '',
            name: '',
            tier_level: 'basico',
            price: 0,
            duration_days: 30,
            highlight_color: '',
            highlight_badge: '',
            position_boost: 0,
            is_active: true
        })
        setTierDialogOpen(true)
    }

    const openEditTier = (tier: MarketplaceAdTier) => {
        setSelectedTier(tier)
        setTierForm({
            category_id: tier.category_id,
            name: tier.name,
            tier_level: tier.tier_level,
            price: tier.price,
            duration_days: tier.duration_days,
            highlight_color: tier.highlight_color || '',
            highlight_badge: tier.highlight_badge || '',
            position_boost: tier.position_boost,
            is_active: tier.is_active
        })
        setTierDialogOpen(true)
    }

    const saveTier = async () => {
        if (!tierForm.name || !tierForm.category_id) {
            toast.error('Nome e categoria são obrigatórios')
            return
        }

        setSaving(true)

        try {
            if (selectedTier) {
                await supabase
                    .from('marketplace_ad_tiers')
                    .update({
                        category_id: tierForm.category_id,
                        name: tierForm.name,
                        tier_level: tierForm.tier_level,
                        price: tierForm.price,
                        duration_days: tierForm.duration_days,
                        highlight_color: tierForm.highlight_color || null,
                        highlight_badge: tierForm.highlight_badge || null,
                        position_boost: tierForm.position_boost,
                        is_active: tierForm.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedTier.id)
            } else {
                await supabase
                    .from('marketplace_ad_tiers')
                    .insert({
                        category_id: tierForm.category_id,
                        name: tierForm.name,
                        tier_level: tierForm.tier_level,
                        price: tierForm.price,
                        duration_days: tierForm.duration_days,
                        highlight_color: tierForm.highlight_color || null,
                        highlight_badge: tierForm.highlight_badge || null,
                        position_boost: tierForm.position_boost,
                        is_active: tierForm.is_active
                    })
            }

            toast.success('Modalidade salva!')
            setTierDialogOpen(false)
            loadData()
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const deleteTier = async (tier: MarketplaceAdTier) => {
        if (!confirm(`Excluir modalidade "${tier.name}"?`)) return

        await supabase.from('marketplace_ad_tiers').delete().eq('id', tier.id)
        toast.success('Modalidade excluída')
        loadData()
    }

    // ===== AD HANDLERS =====
    const updateAdStatus = async (ad: MarketplaceAd, newStatus: string) => {
        const updates: any = { status: newStatus, updated_at: new Date().toISOString() }

        if (newStatus === 'sold') {
            updates.sold_at = new Date().toISOString()
        }

        await supabase.from('marketplace_ads').update(updates).eq('id', ad.id)
        toast.success('Status atualizado')
        loadData()
    }

    const deleteAd = async (ad: MarketplaceAd) => {
        if (!confirm(`Excluir anúncio "${ad.title}"?`)) return

        await supabase.from('marketplace_ads').delete().eq('id', ad.id)
        toast.success('Anúncio excluído')
        loadData()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-impact text-primary">Gestão do Marketplace</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie categorias, modalidades e anúncios
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Categorias</div>
                    <div className="text-2xl font-bold text-primary mt-1">{categories.length}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Modalidades</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">{tiers.length}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Anúncios Ativos</div>
                    <div className="text-2xl font-bold text-green-500 mt-1">{activeAds}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Vendidos</div>
                    <div className="text-2xl font-bold text-amber-500 mt-1">{soldAds}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Valor Total</div>
                    <div className="text-2xl font-bold text-purple-500 mt-1">
                        {formatCurrency(totalValue)}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                    <TabsTrigger value="anuncios">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Anúncios ({ads.length})
                    </TabsTrigger>
                    <TabsTrigger value="categorias">
                        <Tag className="w-4 h-4 mr-2" />
                        Categorias
                    </TabsTrigger>
                    <TabsTrigger value="modalidades">
                        <Crown className="w-4 h-4 mr-2" />
                        Modalidades
                    </TabsTrigger>
                </TabsList>

                {/* ===== ANÚNCIOS TAB ===== */}
                <TabsContent value="anuncios" className="mt-6 space-y-4">
                    {/* Filters */}
                    <div className="glass-strong p-4 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">Todas categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">Todos status</option>
                                <option value="active">Ativo</option>
                                <option value="pending_payment">Aguardando Pagamento</option>
                                <option value="expired">Expirado</option>
                                <option value="sold">Vendido</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="glass-strong rounded-lg border border-primary/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary/10 border-b border-primary/20">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Anúncio</th>
                                        <th className="text-left p-4 font-semibold">Vendedor</th>
                                        <th className="text-right p-4 font-semibold">Preço</th>
                                        <th className="text-center p-4 font-semibold">Status</th>
                                        <th className="text-center p-4 font-semibold">Expira</th>
                                        <th className="text-center p-4 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAds.map(ad => (
                                        <tr key={ad.id} className="border-b border-primary/10 hover:bg-primary/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {ad.ad_tier?.tier_level === 'lendario' && <Crown className="w-4 h-4 text-amber-500" />}
                                                    {ad.ad_tier?.tier_level === 'elite' && <Star className="w-4 h-4 text-green-500" />}
                                                    <div>
                                                        <div className="font-medium text-primary">{ad.title}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {(ad.category as any)?.name} • {ad.ad_tier?.name || 'Básico'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">{(ad.user as any)?.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{(ad.user as any)?.email}</div>
                                            </td>
                                            <td className="p-4 text-right font-semibold text-green-600">
                                                {formatCurrency(ad.price)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Badge variant={
                                                    ad.status === 'active' ? 'default' :
                                                        ad.status === 'sold' ? 'secondary' :
                                                            ad.status === 'expired' ? 'destructive' : 'outline'
                                                }>
                                                    {AD_STATUS_LABELS[ad.status]?.label || ad.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-center text-sm">
                                                {ad.expires_at ? formatDaysRemaining(ad.expires_at) : '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1 justify-center">
                                                    {ad.status === 'active' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-amber-600"
                                                            onClick={() => updateAdStatus(ad, 'sold')}
                                                            title="Marcar como Vendido"
                                                        >
                                                            <CheckCircle className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive"
                                                        onClick={() => deleteAd(ad)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredAds.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                Nenhum anúncio encontrado
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ===== CATEGORIAS TAB ===== */}
                <TabsContent value="categorias" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={openNewCategory} className="glow-orange bg-secondary hover:bg-secondary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Categoria
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => {
                            const catAds = ads.filter(a => a.category_id === cat.id).length
                            const catTiers = tiers.filter(t => t.category_id === cat.id).length

                            return (
                                <div key={cat.id} className="glass-strong p-5 rounded-lg border border-primary/20 hover:border-primary/40 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10 text-primary">
                                                {getIcon(cat.icon)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-primary">{cat.name}</h3>
                                                <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                                            </div>
                                        </div>
                                        <Badge variant={cat.is_active ? "default" : "secondary"}>
                                            {cat.is_active ? 'Ativa' : 'Inativa'}
                                        </Badge>
                                    </div>

                                    <div className="mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-secondary" />
                                        <span className="text-sm font-semibold text-secondary">
                                            Expira em {cat.duration_days} dias
                                        </span>
                                    </div>

                                    <div className="flex gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Anúncios: </span>
                                            <span className="font-semibold text-blue-500">{catAds}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Modalidades: </span>
                                            <span className="font-semibold text-purple-500">{catTiers}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-primary/10">
                                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditCategory(cat)}>
                                            <Edit2 className="w-3 h-3 mr-1" />
                                            Editar
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteCategory(cat)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </TabsContent>

                {/* ===== MODALIDADES TAB ===== */}
                <TabsContent value="modalidades" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={openNewTier} className="glow-orange bg-secondary hover:bg-secondary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Modalidade
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tiers.map(tier => {
                            const tierCategory = categories.find(c => c.id === tier.category_id)

                            return (
                                <div
                                    key={tier.id}
                                    className={`
                                        glass-strong p-5 rounded-lg border-2 transition-all
                                        ${tier.tier_level === 'lendario' ? 'border-amber-500/50' :
                                            tier.tier_level === 'elite' ? 'border-green-500/50' : 'border-primary/20'}
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {tier.tier_level === 'lendario' && <Crown className="w-5 h-5 text-amber-500" />}
                                            {tier.tier_level === 'elite' && <Star className="w-5 h-5 text-green-500" />}
                                            <div>
                                                <h3 className="font-bold text-lg text-primary">{tier.name}</h3>
                                                <span className="text-xs text-muted-foreground">{tierCategory?.name}</span>
                                            </div>
                                        </div>
                                        <Badge variant={tier.is_active ? "default" : "secondary"}>
                                            {tier.is_active ? 'Ativa' : 'Inativa'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            <span className="text-lg font-bold text-green-500">
                                                {tier.price === 0 ? 'Grátis' : formatCurrency(tier.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-secondary" />
                                            <span className="text-sm text-secondary">{tier.duration_days} dias online</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Boost: +{tier.position_boost}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-primary/10">
                                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditTier(tier)}>
                                            <Edit2 className="w-3 h-3 mr-1" />
                                            Editar
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteTier(tier)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ===== CATEGORY DIALOG ===== */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome *</Label>
                            <Input
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm(prev => ({
                                    ...prev,
                                    name: e.target.value,
                                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                }))}
                                placeholder="Ex: Veículos"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={categoryForm.slug}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                                placeholder="veiculos"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ícone (Lucide)</Label>
                            <Input
                                value={categoryForm.icon}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                                placeholder="Car, Home, Package..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duração Padrão (dias)</Label>
                            <Input
                                type="number"
                                value={categoryForm.duration_days}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 30 }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Ativa</Label>
                            <Switch
                                checked={categoryForm.is_active}
                                onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={saveCategory} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== TIER DIALOG ===== */}
            <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedTier ? 'Editar Modalidade' : 'Nova Modalidade'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Categoria *</Label>
                            <select
                                value={tierForm.category_id}
                                onChange={(e) => setTierForm(prev => ({ ...prev, category_id: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nome *</Label>
                            <Input
                                value={tierForm.name}
                                onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Veículos Elite"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nível</Label>
                            <select
                                value={tierForm.tier_level}
                                onChange={(e) => setTierForm(prev => ({ ...prev, tier_level: e.target.value as any }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="basico">Básico (Grátis)</option>
                                <option value="elite">Elite</option>
                                <option value="lendario">Lendário</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Preço (R$)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={tierForm.price}
                                    onChange={(e) => setTierForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duração (dias)</Label>
                                <Input
                                    type="number"
                                    value={tierForm.duration_days}
                                    onChange={(e) => setTierForm(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 30 }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Boost de Posição</Label>
                            <Input
                                type="number"
                                value={tierForm.position_boost}
                                onChange={(e) => setTierForm(prev => ({ ...prev, position_boost: parseInt(e.target.value) || 0 }))}
                                placeholder="0 = normal, 50 = elite, 100 = topo"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Ativa</Label>
                            <Switch
                                checked={tierForm.is_active}
                                onCheckedChange={(checked) => setTierForm(prev => ({ ...prev, is_active: checked }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setTierDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={saveTier} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
