import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Car, Home, Crown, Star, Eye, Search } from 'lucide-react' // 🆕 Search para compra
import { Card, CardContent } from '@/components/ui/card'
import { MarketplaceAd } from '@/lib/data/marketplace'
import { Badge } from '@/components/ui/badge'

interface MarketplaceCardProps {
    ad: MarketplaceAd
}

export function MarketplaceCard({ ad }: MarketplaceCardProps) {
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    // Determinar cor de destaque baseado no tier
    const isLendario = ad.ad_tier?.tier_level === 'lendario'
    const isElite = ad.ad_tier?.tier_level === 'elite'
    const highlightColor = ad.ad_tier?.highlight_color
    const isBuyListing = ad.listing_type === 'buy' // 🆕 Verificar se é PROCURA-SE

    // Pegar primeira imagem
    const mainImage = ad.images?.[0] || '/placeholder-product.jpg'

    // Categoria slug para verificações
    const categorySlug = (ad.category as any)?.slug

    return (
        <Link href={`/marketplace/${ad.id}`}>
            <Card className={`
                h-full overflow-hidden hover:shadow-lg transition-all duration-300 group 
                bg-card/50 backdrop-blur-sm relative
                ${isBuyListing
                    ? 'border-2 border-orange-500/50 hover:border-orange-500 shadow-orange-500/20'
                    : isLendario
                        ? 'border-2 border-amber-500/50 hover:border-amber-500 shadow-amber-500/20'
                        : isElite
                            ? 'border-2 border-green-500/50 hover:border-green-500 shadow-green-500/20'
                            : 'border-primary/10 hover:border-primary/30'
                }
            `}>
                {/* Badge de Destaque */}
                {isBuyListing ? (
                    /* Badge para PROCURA-SE */
                    <div className="absolute top-0 left-0 right-0 z-10 text-center py-1 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                        <span className="flex items-center justify-center gap-1">
                            <Search className="w-3 h-3" /> PROCURA-SE
                        </span>
                    </div>
                ) : (isLendario || isElite) && (
                    /* Badges para Lendário e Elite */
                    <div className={`
                        absolute top-0 left-0 right-0 z-10 text-center py-1 text-xs font-bold
                        ${isLendario ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black' : 'bg-green-600 text-white'}
                    `}>
                        {isLendario ? (
                            <span className="flex items-center justify-center gap-1">
                                <Crown className="w-3 h-3" /> LENDÁRIO
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-1">
                                <Star className="w-3 h-3" /> ELITE
                            </span>
                        )}
                    </div>
                )}

                {/* Imagem */}
                <div className={`relative aspect-square overflow-hidden bg-muted ${(isBuyListing || isLendario || isElite) ? 'mt-6' : ''}`}>
                    <Image
                        src={mainImage}
                        alt={ad.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge de condição */}
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 hover:bg-black/80 text-white backdrop-blur-sm text-xs">
                            {ad.condition === 'new' ? 'Novo' :
                                ad.condition === 'used_like_new' ? 'Seminovo' :
                                    ad.condition === 'used_good' ? 'Usado' : 'Usado'}
                        </Badge>
                    </div>

                    {/* Views */}
                    {ad.views_count > 0 && (
                        <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                {ad.views_count}
                            </Badge>
                        </div>
                    )}
                </div>

                <CardContent className="p-4">
                    {/* Preço */}
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xl font-bold ${isLendario ? 'text-amber-500' : isElite ? 'text-green-500' : 'text-primary'}`}>
                            {formatPrice(ad.price)}
                        </span>
                    </div>

                    {/* Título */}
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[3rem]">
                        {ad.title}
                    </h3>

                    {/* Localização */}
                    {ad.location && (
                        <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{ad.location}</span>
                        </div>
                    )}

                    {/* Detalhes de Veículos */}
                    {categorySlug === 'veiculos' && ad.vehicle_details && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/10">
                            <span className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded">
                                <Car className="w-3 h-3" />
                                {ad.vehicle_details.year}
                            </span>
                            {ad.vehicle_details.km && (
                                <span className="bg-primary/5 px-2 py-1 rounded">
                                    {ad.vehicle_details.km.toLocaleString()} km
                                </span>
                            )}
                        </div>
                    )}

                    {/* Detalhes de Imóveis */}
                    {categorySlug === 'imoveis' && ad.property_details && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/10">
                            <span className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded">
                                <Home className="w-3 h-3" />
                                {ad.property_details.area}m²
                            </span>
                            {ad.property_details.bedrooms && (
                                <span className="bg-primary/5 px-2 py-1 rounded">
                                    {ad.property_details.bedrooms} quartos
                                </span>
                            )}
                            <Badge variant={ad.property_details.type === 'venda' ? 'default' : 'secondary'}>
                                {ad.property_details.type === 'venda' ? 'Venda' : 'Locação'}
                            </Badge>
                        </div>
                    )}

                    {/* Vendedor */}
                    {ad.user && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-primary/10">
                            <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden">
                                {ad.user.avatar_url ? (
                                    <Image
                                        src={ad.user.avatar_url}
                                        alt={ad.user.full_name}
                                        width={24}
                                        height={24}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                                        {ad.user.full_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate">
                                {ad.user.full_name}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
