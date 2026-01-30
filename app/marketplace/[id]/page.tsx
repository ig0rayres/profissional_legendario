'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Eye,
    MessageCircle,
    Phone,
    Share2,
    Heart,
    Crown,
    Star,
    Car,
    Home,
    Fuel,
    Gauge,
    Palette,
    Settings2,
    BedDouble,
    Bath,
    ParkingCircle,
    Maximize2,
    Check,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { MarketplaceAd, AD_CONDITIONS, formatDaysRemaining } from '@/lib/data/marketplace'
import { toast } from 'sonner'

export default function AdDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const supabase = createClient()

    const [ad, setAd] = useState<MarketplaceAd | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [relatedAds, setRelatedAds] = useState<MarketplaceAd[]>([])

    const adId = params.id as string

    useEffect(() => {
        if (adId) {
            loadAd()
            incrementViews()
        }
    }, [adId])

    async function loadAd() {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('marketplace_ads')
            .select(`
                *,
                category:marketplace_categories(id, name, slug, icon),
                ad_tier:marketplace_ad_tiers(id, name, tier_level, highlight_color, highlight_badge, position_boost),
                user:profiles(id, full_name, avatar_url, slug, rota_number, phone, whatsapp, city, state, pista)
            `)
            .eq('id', adId)
            .maybeSingle()

        if (err) {
            console.error('Erro ao carregar anúncio:', err)
            setError('Erro ao carregar anúncio')
            setLoading(false)
            return
        }

        if (!data) {
            setError('Anúncio não encontrado')
            setLoading(false)
            return
        }

        setAd(data)

        // Carregar anúncios relacionados (mesma categoria)
        const { data: related } = await supabase
            .from('marketplace_ads')
            .select(`
                *,
                category:marketplace_categories(id, name, slug, icon),
                ad_tier:marketplace_ad_tiers(id, name, tier_level, highlight_color)
            `)
            .eq('category_id', data.category_id)
            .eq('status', 'active')
            .neq('id', adId)
            .limit(4)

        if (related) setRelatedAds(related)

        setLoading(false)
    }

    async function incrementViews() {
        // Incrementar visualizações (pode adicionar lógica de rate limiting)
        try {
            await supabase.rpc('increment_ad_views', { ad_id: adId })
        } catch {
            // Silently fail - view count is not critical
        }
    }

    async function handleContact() {
        if (!user) {
            toast.error('Faça login para entrar em contato')
            router.push('/auth/login')
            return
        }

        if (ad?.user_id === user.id) {
            toast.error('Você não pode enviar mensagem para si mesmo')
            return
        }

        // Incrementar contador de contatos
        try {
            await supabase.rpc('increment_ad_contacts', { ad_id: adId })
        } catch {
            // Silently fail
        }

        // Verificar se já existe conversa entre os usuários
        const sellerId = ad?.user_id

        const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
            .maybeSingle()

        let conversationId = existingConv?.id

        // Se não existe conversa, criar uma nova
        if (!conversationId) {
            const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert({
                    participant_1: user.id < sellerId! ? user.id : sellerId,
                    participant_2: user.id < sellerId! ? sellerId : user.id
                })
                .select('id')
                .single()

            if (convError) {
                console.error('Erro ao criar conversa:', convError)
                toast.error('Erro ao iniciar conversa')
                return
            }
            conversationId = newConv?.id
        }

        // Enviar mensagem automática sobre o anúncio
        const message = `Olá! Vi seu anúncio "${ad?.title}" no Rota Marketplace e gostaria de mais informações.\n\n📦 Anúncio: ${ad?.title}\n💰 Preço: ${formatPrice(ad?.price || 0)}\n🔗 Link: ${window.location.href}`

        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: message
            })

        if (msgError) {
            console.error('Erro ao enviar mensagem:', msgError)
            toast.error('Erro ao enviar mensagem')
            return
        }

        // Atualizar last_message na conversa
        await supabase
            .from('conversations')
            .update({
                last_message_at: new Date().toISOString(),
                last_message_preview: message.substring(0, 100)
            })
            .eq('id', conversationId)

        toast.success('Mensagem enviada!')

        // Abrir o chat diretamente usando o evento existente
        window.dispatchEvent(new CustomEvent('openChat', {
            detail: { userId: ad?.user_id }
        }))
    }

    async function handleWhatsApp() {
        // Abrir WhatsApp diretamente
        const phone = (ad?.user as any)?.whatsapp || (ad?.user as any)?.phone
        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '')
            const message = encodeURIComponent(`Olá! Vi seu anúncio "${ad?.title}" no Rota Marketplace e gostaria de mais informações.`)
            window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
        } else {
            toast.error('Este vendedor não possui WhatsApp cadastrado')
        }
    }

    async function handleShare() {
        const url = window.location.href
        if (navigator.share) {
            await navigator.share({
                title: ad?.title,
                text: `Confira este anúncio no Rota Marketplace: ${ad?.title}`,
                url
            })
        } else {
            await navigator.clipboard.writeText(url)
            toast.success('Link copiado!')
        }
    }

    async function handleMarkAsSold() {
        if (!ad || ad.user_id !== user?.id) return

        const { error } = await supabase
            .from('marketplace_ads')
            .update({ status: 'sold', sold_at: new Date().toISOString() })
            .eq('id', ad.id)

        if (error) {
            toast.error('Erro ao marcar como vendido')
        } else {
            toast.success('Anúncio marcado como vendido!')
            setAd({ ...ad, status: 'sold' })

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
        }
    }

    function formatPrice(value: number) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    function getConditionLabel(condition: string | null) {
        return AD_CONDITIONS.find(c => c.value === condition)?.label || 'Não informado'
    }

    // Navegação de imagens
    function nextImage() {
        if (ad?.images && currentImageIndex < ad.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1)
        }
    }

    function prevImage() {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1)
        }
    }

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-adventure pt-20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando anúncio...</p>
                </div>
            </div>
        )
    }

    // Error State
    if (error || !ad) {
        return (
            <div className="min-h-screen bg-adventure pt-20 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">{error || 'Anúncio não encontrado'}</h2>
                        <p className="text-muted-foreground mb-6">
                            Este anúncio pode ter sido removido ou expirado.
                        </p>
                        <Link href="/marketplace">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao Marketplace
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isOwner = user?.id === ad.user_id
    const isLendario = ad.ad_tier?.tier_level === 'lendario'
    const isElite = ad.ad_tier?.tier_level === 'elite'
    const categorySlug = (ad.category as any)?.slug
    const images = ad.images || []
    const mainImage = images[currentImageIndex] || '/placeholder-product.jpg'

    return (
        <div className="min-h-screen bg-adventure pt-20">
            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition disabled:opacity-30"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="max-w-5xl max-h-[90vh] relative">
                        <Image
                            src={mainImage}
                            alt={ad.title}
                            width={1200}
                            height={800}
                            className="object-contain max-h-[90vh]"
                        />
                    </div>

                    <button
                        onClick={nextImage}
                        disabled={currentImageIndex >= images.length - 1}
                        className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition disabled:opacity-30"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                        {currentImageIndex + 1} / {images.length}
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href="/marketplace" className="hover:text-primary transition flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Marketplace
                    </Link>
                    <span>/</span>
                    <span className="capitalize">{(ad.category as any)?.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Badge de Destaque */}
                        {(isLendario || isElite) && (
                            <div className={`
                                rounded-lg py-2 px-4 text-center font-bold text-sm
                                ${isLendario
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black'
                                    : 'bg-green-600 text-white'}
                            `}>
                                {isLendario ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Crown className="w-4 h-4" /> ANÚNCIO LENDÁRIO
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Star className="w-4 h-4" /> ANÚNCIO ELITE
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Galeria de Imagens */}
                        <Card className="overflow-hidden">
                            <div className="relative aspect-video bg-muted">
                                <Image
                                    src={mainImage}
                                    alt={ad.title}
                                    fill
                                    className="object-cover cursor-pointer"
                                    onClick={() => setLightboxOpen(true)}
                                />

                                {/* Navegação */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            disabled={currentImageIndex === 0}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            disabled={currentImageIndex >= images.length - 1}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition disabled:opacity-30"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Contador */}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                                    {currentImageIndex + 1} / {images.length || 1}
                                </div>

                                {/* Zoom */}
                                <button
                                    onClick={() => setLightboxOpen(true)}
                                    className="absolute bottom-2 left-2 p-2 bg-black/70 text-white rounded hover:bg-black/90 transition"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`
                                                relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition
                                                ${idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}
                                            `}
                                        >
                                            <Image src={img} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Título e Info */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                            {ad.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            {ad.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {ad.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Publicado em {formatDate(ad.created_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {ad.views_count} visualizações
                                            </span>
                                        </div>
                                    </div>

                                    <Badge variant={ad.condition === 'new' ? 'default' : 'secondary'} className="flex-shrink-0">
                                        {getConditionLabel(ad.condition)}
                                    </Badge>
                                </div>

                                <Separator className="my-4" />

                                {/* Preço */}
                                <div className={`text-4xl font-bold ${isLendario ? 'text-amber-500' : isElite ? 'text-green-500' : 'text-primary'}`}>
                                    {formatPrice(ad.price)}
                                </div>

                                {ad.expires_at && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {formatDaysRemaining(ad.expires_at)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detalhes Específicos por Categoria */}
                        {categorySlug === 'veiculos' && ad.vehicle_details && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Car className="w-5 h-5 text-primary" />
                                        Detalhes do Veículo
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Ano</p>
                                                <p className="font-semibold">{ad.vehicle_details.year}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Gauge className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Quilometragem</p>
                                                <p className="font-semibold">{ad.vehicle_details.km?.toLocaleString()} km</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Palette className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Cor</p>
                                                <p className="font-semibold">{ad.vehicle_details.color}</p>
                                            </div>
                                        </div>
                                        {ad.vehicle_details.fuel && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Fuel className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Combustível</p>
                                                    <p className="font-semibold">{ad.vehicle_details.fuel}</p>
                                                </div>
                                            </div>
                                        )}
                                        {ad.vehicle_details.transmission && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Settings2 className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Câmbio</p>
                                                    <p className="font-semibold">{ad.vehicle_details.transmission}</p>
                                                </div>
                                            </div>
                                        )}
                                        {(ad.vehicle_details.make || ad.vehicle_details.model) && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Car className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Marca/Modelo</p>
                                                    <p className="font-semibold">{ad.vehicle_details.make} {ad.vehicle_details.model}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {categorySlug === 'imoveis' && ad.property_details && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Home className="w-5 h-5 text-primary" />
                                        Detalhes do Imóvel
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Maximize2 className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Área</p>
                                                <p className="font-semibold">{ad.property_details.area}m²</p>
                                            </div>
                                        </div>
                                        {ad.property_details.bedrooms && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <BedDouble className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Quartos</p>
                                                    <p className="font-semibold">{ad.property_details.bedrooms}</p>
                                                </div>
                                            </div>
                                        )}
                                        {ad.property_details.bathrooms && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Bath className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Banheiros</p>
                                                    <p className="font-semibold">{ad.property_details.bathrooms}</p>
                                                </div>
                                            </div>
                                        )}
                                        {ad.property_details.garage && (
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <ParkingCircle className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Vagas</p>
                                                    <p className="font-semibold">{ad.property_details.garage}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Badge className="mt-4" variant={ad.property_details.type === 'venda' ? 'default' : 'secondary'}>
                                        {ad.property_details.type === 'venda' ? 'À Venda' : 'Para Locação'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        )}

                        {/* Descrição */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Descrição</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {ad.description || 'Sem descrição disponível.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Vendedor e Ações */}
                    <div className="space-y-6">
                        {/* Card do Vendedor */}
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                {/* Status de Vendido */}
                                {ad.status === 'sold' && (
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-center">
                                        <Check className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                        <p className="font-bold text-blue-500">VENDIDO</p>
                                    </div>
                                )}

                                {/* Vendedor */}
                                <div className="flex items-center gap-3 mb-6">
                                    <Link href={`/${(ad.user as any)?.slug}/${(ad.user as any)?.rota_number}`}>
                                        <Avatar className="w-14 h-14 border-2 border-primary">
                                            <AvatarImage src={(ad.user as any)?.avatar_url || ''} />
                                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                {(ad.user as any)?.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1">
                                        <Link
                                            href={`/${(ad.user as any)?.slug}/${(ad.user as any)?.rota_number}`}
                                            className="font-bold hover:text-primary transition"
                                        >
                                            {(ad.user as any)?.full_name || 'Vendedor'}
                                        </Link>
                                        {((ad.user as any)?.city || (ad.user as any)?.state) && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {(ad.user as any)?.city}{(ad.user as any)?.state ? `, ${(ad.user as any)?.state}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Botões de Ação */}
                                <div className="space-y-3">
                                    {!isOwner ? (
                                        <>
                                            <Button
                                                className="w-full glow-orange"
                                                size="lg"
                                                onClick={handleContact}
                                                disabled={ad.status === 'sold'}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                Entrar em Contato
                                            </Button>

                                            {((ad.user as any)?.phone || (ad.user as any)?.whatsapp) && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={handleWhatsApp}
                                                    disabled={ad.status === 'sold'}
                                                >
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    WhatsApp
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {ad.status === 'active' && (
                                                <Button
                                                    className="w-full"
                                                    variant="default"
                                                    onClick={handleMarkAsSold}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Marcar como Vendido
                                                </Button>
                                            )}
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href={`/marketplace/edit/${ad.id}`}>
                                                    Editar Anúncio
                                                </Link>
                                            </Button>
                                        </>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex-1"
                                            onClick={() => setIsFavorite(!isFavorite)}
                                        >
                                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex-1"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {/* Estatísticas */}
                                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <Eye className="w-4 h-4 mx-auto mb-1 text-primary" />
                                        <p className="font-bold">{ad.views_count}</p>
                                        <p className="text-xs text-muted-foreground">Visualizações</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <MessageCircle className="w-4 h-4 mx-auto mb-1 text-primary" />
                                        <p className="font-bold">{ad.contacts_count}</p>
                                        <p className="text-xs text-muted-foreground">Contatos</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Anúncios Relacionados */}
                        {relatedAds.length > 0 && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-bold mb-4">Anúncios Relacionados</h3>
                                    <div className="space-y-3">
                                        {relatedAds.map(related => (
                                            <Link
                                                key={related.id}
                                                href={`/marketplace/${related.id}`}
                                                className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition"
                                            >
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={related.images?.[0] || '/placeholder-product.jpg'}
                                                        alt={related.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm line-clamp-2">{related.title}</p>
                                                    <p className="text-primary font-bold text-sm">{formatPrice(related.price)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
