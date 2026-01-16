// ============================================
// Component: ConfraternityGallery
// Galeria de confraternizações
// ============================================

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MapPin, Eye, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'

interface ConfraternityGalleryProps {
    confraternities: Array<{
        id: string
        member1_id: string
        member2_id: string
        date_occurred: string
        location: string | null
        description: string | null
        photos: string[]
        testimonial_member1: string | null
        testimonial_member2: string | null
        visibility: string
        member1?: {
            id: string
            full_name: string
            avatar_url: string | null
        }
        member2?: {
            id: string
            full_name: string
            avatar_url: string | null
        }
    }>
    currentUserId?: string
}

export function ConfraternityGallery({
    confraternities,
    currentUserId
}: ConfraternityGalleryProps) {
    if (confraternities.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                    Nenhuma confraternização registrada ainda
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {confraternities.map((conf) => (
                <ConfraternityCard
                    key={conf.id}
                    confraternity={conf}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    )
}

function ConfraternityCard({
    confraternity,
    currentUserId
}: {
    confraternity: ConfraternityGalleryProps['confraternities'][0]
    currentUserId?: string
}) {
    const isParticipant = currentUserId === confraternity.member1_id ||
        currentUserId === confraternity.member2_id

    const mainPhoto = confraternity.photos[0]
    const hasMorePhotos = confraternity.photos.length > 1

    // Determinar qual depoimento mostrar
    const testimonial = currentUserId === confraternity.member1_id
        ? confraternity.testimonial_member2
        : confraternity.testimonial_member1

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Foto Principal */}
            {mainPhoto && (
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                        src={mainPhoto}
                        alt="Confraternização"
                        className="w-full h-full object-cover"
                    />
                    {hasMorePhotos && (
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                            +{confraternity.photos.length - 1} fotos
                        </Badge>
                    )}
                </div>
            )}

            <CardContent className="p-4 space-y-3">
                {/* Membros */}
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={confraternity.member1?.avatar_url || ''} />
                            <AvatarFallback>
                                {confraternity.member1?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={confraternity.member2?.avatar_url || ''} />
                            <AvatarFallback>
                                {confraternity.member2?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {confraternity.member1?.full_name} & {confraternity.member2?.full_name}
                        </p>
                    </div>
                </div>

                {/* Data e Local */}
                <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                            {formatDistanceToNow(new Date(confraternity.date_occurred), {
                                addSuffix: true,
                                locale: ptBR
                            })}
                        </span>
                    </div>
                    {confraternity.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{confraternity.location}</span>
                        </div>
                    )}
                </div>

                {/* Descrição/Depoimento */}
                {(confraternity.description || testimonial) && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {confraternity.description || testimonial}
                    </p>
                )}

                {/* Visibilidade Badge */}
                <div className="flex items-center gap-2">
                    {confraternity.visibility === 'public' && (
                        <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Público
                        </Badge>
                    )}
                    {isParticipant && (
                        <Badge variant="outline" className="text-xs">
                            Você participou
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
