'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Store,
    Plus,
    Eye,
    MessageCircle,
    Clock,
    Check,
    AlertCircle,
    MoreVertical,
    Edit,
    Trash2,
    RefreshCw,
    Loader2,
    Crown,
    Star,
    ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { MarketplaceAd, formatDaysRemaining } from '@/lib/data/marketplace'
import { toast } from 'sonner'

export default function MeusAnunciosPage() {
    const { user } = useAuth()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [ads, setAds] = useState<MarketplaceAd[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [adToDelete, setAdToDelete] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            loadAds()
        }
    }, [user])

    async function loadAds() {
        setLoading(true)

        const { data, error } = await supabase
            .from('marketplace_ads')
            .select(`
                *,
                category:marketplace_categories(id, name, slug, icon),
                ad_tier:marketplace_ad_tiers(id, name, tier_level, highlight_color)
            `)
            .eq('user_id', user?.id)
            .neq('status', 'deleted')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao carregar anúncios:', error)
            toast.error('Erro ao carregar seus anúncios')
        } else {
            setAds(data || [])
        }

        setLoading(false)
    }

    async function handleMarkAsSold(adId: string) {
        const { error } = await supabase
            .from('marketplace_ads')
            .update({ status: 'sold', sold_at: new Date().toISOString() })
            .eq('id', adId)

        if (error) {
            toast.error('Erro ao marcar como vendido')
        } else {
            toast.success('Anúncio marcado como vendido!')

            // Processar gamificação (medalhas e proezas)
            if (user?.id) {
                try {
                    const { processMarketplaceSaleGamification } = await import('@/lib/gamification/marketplace')
                    await processMarketplaceSaleGamification(user.id)
                } catch (error) {
                    console.error('Erro ao processar gamificação:', error)
                    // Não bloqueia o fluxo principal
                }
            }

            loadAds()
        }
    }

    async function handleRenew(adId: string) {
        // Buscar dados do anúncio para calcular nova data de expiração
        const ad = ads.find(a => a.id === adId)
        if (!ad) return

        // Por padrão, renovar por 30 dias
        const newExpiration = new Date()
        newExpiration.setDate(newExpiration.getDate() + 30)

        const { error } = await supabase
            .from('marketplace_ads')
            .update({
                status: 'active',
                expires_at: newExpiration.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', adId)

        if (error) {
            toast.error('Erro ao renovar anúncio')
        } else {
            toast.success('Anúncio renovado por mais 30 dias!')
            loadAds()
        }
    }

    async function handleDelete(adId: string) {
        const { error } = await supabase
            .from('marketplace_ads')
            .update({ status: 'deleted' })
            .eq('id', adId)

        if (error) {
            toast.error('Erro ao excluir anúncio')
        } else {
            toast.success('Anúncio excluído')
            setDeleteDialogOpen(false)
            setAdToDelete(null)
            loadAds()
        }
    }

    function formatPrice(value: number) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Ativo</Badge>
            case 'expired':
                return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Expirado</Badge>
            case 'sold':
                return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Vendido</Badge>
            case 'pending_payment':
                return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Aguardando Pagamento</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    // Filtrar anúncios por status
    const activeAds = ads.filter(a => a.status === 'active')
    const expiredAds = ads.filter(a => a.status === 'expired')
    const soldAds = ads.filter(a => a.status === 'sold')

    if (!user) {
        return (
            <div className="min-h-screen bg-adventure pt-20 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
                        <p className="text-muted-foreground mb-4">
                            Faça login para ver seus anúncios
                        </p>
                        <Link href="/auth/login">
                            <Button>Fazer Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure pt-20 pb-10">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                                <Store className="w-7 h-7 text-primary" />
                                Meus Anúncios
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Gerencie seus anúncios no Rota Marketplace
                            </p>
                        </div>
                    </div>

                    <Link href="/marketplace/create">
                        <Button className="glow-orange">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Anúncio
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{ads.length}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-500">{activeAds.length}</div>
                            <div className="text-xs text-muted-foreground">Ativos</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-500">{expiredAds.length}</div>
                            <div className="text-xs text-muted-foreground">Expirados</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-500">{soldAds.length}</div>
                            <div className="text-xs text-muted-foreground">Vendidos</div>
                        </CardContent>
                    </Card>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Carregando seus anúncios...</p>
                    </div>
                ) : ads.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum anúncio ainda</h3>
                            <p className="text-muted-foreground mb-6">
                                Crie seu primeiro anúncio e comece a vender!
                            </p>
                            <Link href="/marketplace/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Primeiro Anúncio
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">Todos ({ads.length})</TabsTrigger>
                            <TabsTrigger value="active">Ativos ({activeAds.length})</TabsTrigger>
                            <TabsTrigger value="expired">Expirados ({expiredAds.length})</TabsTrigger>
                            <TabsTrigger value="sold">Vendidos ({soldAds.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <AdsList
                                ads={ads}
                                formatPrice={formatPrice}
                                getStatusBadge={getStatusBadge}
                                onMarkAsSold={handleMarkAsSold}
                                onRenew={handleRenew}
                                onDelete={(id) => { setAdToDelete(id); setDeleteDialogOpen(true) }}
                            />
                        </TabsContent>

                        <TabsContent value="active">
                            <AdsList
                                ads={activeAds}
                                formatPrice={formatPrice}
                                getStatusBadge={getStatusBadge}
                                onMarkAsSold={handleMarkAsSold}
                                onRenew={handleRenew}
                                onDelete={(id) => { setAdToDelete(id); setDeleteDialogOpen(true) }}
                            />
                        </TabsContent>

                        <TabsContent value="expired">
                            <AdsList
                                ads={expiredAds}
                                formatPrice={formatPrice}
                                getStatusBadge={getStatusBadge}
                                onMarkAsSold={handleMarkAsSold}
                                onRenew={handleRenew}
                                onDelete={(id) => { setAdToDelete(id); setDeleteDialogOpen(true) }}
                            />
                        </TabsContent>

                        <TabsContent value="sold">
                            <AdsList
                                ads={soldAds}
                                formatPrice={formatPrice}
                                getStatusBadge={getStatusBadge}
                                onMarkAsSold={handleMarkAsSold}
                                onRenew={handleRenew}
                                onDelete={(id) => { setAdToDelete(id); setDeleteDialogOpen(true) }}
                            />
                        </TabsContent>
                    </Tabs>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Anúncio</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => adToDelete && handleDelete(adToDelete)}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

// Componente de lista de anúncios
interface AdsListProps {
    ads: MarketplaceAd[]
    formatPrice: (value: number) => string
    getStatusBadge: (status: string) => JSX.Element
    onMarkAsSold: (id: string) => void
    onRenew: (id: string) => void
    onDelete: (id: string) => void
}

function AdsList({ ads, formatPrice, getStatusBadge, onMarkAsSold, onRenew, onDelete }: AdsListProps) {
    if (ads.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Nenhum anúncio nesta categoria
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {ads.map(ad => {
                const isLendario = ad.ad_tier?.tier_level === 'lendario'
                const isElite = ad.ad_tier?.tier_level === 'elite'
                const mainImage = ad.images?.[0] || '/placeholder-product.jpg'

                return (
                    <Card
                        key={ad.id}
                        className={`
                            overflow-hidden transition-all
                            ${isLendario ? 'border-amber-500/30' : isElite ? 'border-green-500/30' : ''}
                        `}
                    >
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Imagem */}
                                <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                                    <Image
                                        src={mainImage}
                                        alt={ad.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {(isLendario || isElite) && (
                                        <div className={`
                                            absolute top-0 left-0 px-2 py-1 text-xs font-bold
                                            ${isLendario ? 'bg-amber-500 text-black' : 'bg-green-600 text-white'}
                                        `}>
                                            {isLendario ? <Crown className="w-3 h-3 inline mr-1" /> : <Star className="w-3 h-3 inline mr-1" />}
                                            {isLendario ? 'LENDÁRIO' : 'ELITE'}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getStatusBadge(ad.status)}
                                                <span className="text-xs text-muted-foreground">
                                                    {(ad.category as any)?.name}
                                                </span>
                                            </div>

                                            <Link href={`/marketplace/${ad.id}`}>
                                                <h3 className="font-semibold text-lg hover:text-primary transition line-clamp-1">
                                                    {ad.title}
                                                </h3>
                                            </Link>

                                            <div className="text-xl font-bold text-primary mt-1">
                                                {formatPrice(ad.price)}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {ad.views_count} views
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4" />
                                                    {ad.contacts_count} contatos
                                                </span>
                                                {ad.expires_at && ad.status === 'active' && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDaysRemaining(ad.expires_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/marketplace/${ad.id}`}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver Anúncio
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/marketplace/edit/${ad.id}`}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Editar
                                                    </Link>
                                                </DropdownMenuItem>
                                                {ad.status === 'active' && (
                                                    <DropdownMenuItem onClick={() => onMarkAsSold(ad.id)}>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Marcar como Vendido
                                                    </DropdownMenuItem>
                                                )}
                                                {ad.status === 'expired' && (
                                                    <DropdownMenuItem onClick={() => onRenew(ad.id)}>
                                                        <RefreshCw className="w-4 h-4 mr-2" />
                                                        Renovar (30 dias)
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(ad.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
