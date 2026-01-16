import Link from 'next/link'
import { MapPin, Car, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { MarketplaceItem } from '@/lib/data/marketplace'
import { Badge } from '@/components/ui/badge'

interface MarketplaceCardProps {
    item: MarketplaceItem
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    return (
        <Link href={`/marketplace/item/${item.id}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 hover:bg-black/80 text-white backdrop-blur-sm">
                            {item.condition === 'new' ? 'Novo' : 'Usado'}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-bold text-primary">
                            {formatPrice(item.price)}
                        </span>
                    </div>

                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[3rem]">
                        {item.title}
                    </h3>

                    <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.location}</span>
                    </div>

                    {item.category === 'Veículos' && item.vehicle_details && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/10">
                            <span className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded">
                                <Car className="w-3 h-3" />
                                {item.vehicle_details.year}
                            </span>
                            <span className="bg-primary/5 px-2 py-1 rounded">
                                {item.vehicle_details.km.toLocaleString()} km
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
