// ============================================
// Component: FeaturedConfraternities
// Galeria de confraternizações em destaque (Home)
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Calendar,
    MapPin,
    ArrowRight,
    Sparkles,
    TrendingUp
} from 'lucide-react'
import { getPublicConfraternities } from '@/lib/api/confraternity'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export function FeaturedConfraternities() {
    const [confraternities, setConfraternities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadConfraternities()
    }, [])

    const loadConfraternities = async () => {
        try {
            const data = await getPublicConfraternities(6) // Top 6
            setConfraternities(data)
        } catch (error) {
            console.error('Error loading confraternities:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (confraternities.length === 0) {
        return null
    }

    return (
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary" />
                            Confraternizações em Destaque
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Networking que gera resultados reais
                        </p>
                    </div>
                    <Link href="/elo-da-rota/confraria/galeria">
                        <Button variant="outline">
                            Ver Galeria Completa
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Grid de Confraternizações */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {confraternities.map((conf) => (
                        <FeaturedCard key={conf.id} confraternity={conf} />
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-8">
                            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">
                                Faça Parte da Rede
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                Conecte-se com profissionais de elite, participe de confraternizações
                                e expanda sua rede de negócios.
                            </p>
                            <Link href="/auth/register">
                                <Button size="lg">
                                    Começar Agora
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

function FeaturedCard({ confraternity }: { confraternity: any }) {
    const mainPhoto = confraternity.photos?.[0]
    const hasMorePhotos = confraternity.photos?.length > 1

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Foto com overlay */}
            {mainPhoto ? (
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                    <img
                        src={mainPhoto}
                        alt="Confraternização"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {hasMorePhotos && (
                        <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                            +{confraternity.photos.length - 1} fotos
                        </Badge>
                    )}

                    {/* Membros overlaid */}
                    <div className="absolute bottom-3 left-3 flex -space-x-2">
                        <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarImage src={confraternity.member1?.avatar_url || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {confraternity.member1?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarImage src={confraternity.member2?.avatar_url || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {confraternity.member2?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            ) : (
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary/30" />
                </div>
            )}

            <CardContent className="p-4 space-y-3">
                {/* Nomes */}
                <div>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                        {confraternity.member1?.full_name} & {confraternity.member2?.full_name}
                    </h3>
                </div>

                {/* Metadata */}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                            {formatDistanceToNow(new Date(confraternity.date_occurred), {
                                addSuffix: true,
                                locale: ptBR
                            })}
                        </span>
                    </div>
                    {confraternity.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{confraternity.location}</span>
                        </div>
                    )}
                </div>

                {/* Depoimento preview */}
                {(confraternity.description || confraternity.testimonial_member1) && (
                    <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 border-primary/30 pl-3">
                        "{confraternity.description || confraternity.testimonial_member1}"
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
