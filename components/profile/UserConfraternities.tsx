// ============================================
// Component: UserConfraternities
// Galeria de confraternizações no perfil do usuário
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
    Plus,
    TrendingUp,
    Award
} from 'lucide-react'
import { getUserConfraternities } from '@/lib/api/confraternity'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface UserConfraternitiesProps {
    userId: string
    showHeader?: boolean
    limit?: number
}

export function UserConfraternities({
    userId,
    showHeader = true,
    limit
}: UserConfraternitiesProps) {
    const [confraternities, setConfraternities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadConfraternities()
    }, [userId])

    const loadConfraternities = async () => {
        try {
            const data = await getUserConfraternities(userId)
            setConfraternities(limit ? data.slice(0, limit) : data)
        } catch (error) {
            console.error('Error loading confraternities:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Minhas Confraternizações
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            {showHeader && (
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Minhas Confraternizações
                        </CardTitle>
                        {confraternities.length > 0 && (
                            <Badge variant="secondary">
                                {confraternities.length}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
            )}

            <CardContent className={showHeader ? '' : 'pt-6'}>
                {confraternities.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">
                            Você ainda não tem confraternizações registradas
                        </p>
                        <Link href="/elo-da-rota/confraria">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Solicitar Primeira Confraria
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.map((conf) => (
                            <UserConfraternityItem
                                key={conf.id}
                                confraternity={conf}
                                userId={userId}
                            />
                        ))}

                        {/* Ver todas */}
                        {limit && confraternities.length >= limit && (
                            <Link href="/elo-da-rota/confraria/galeria">
                                <Button variant="ghost" className="w-full">
                                    Ver Todas as Confraternizações
                                </Button>
                            </Link>
                        )}

                        {/* Stats resumidas */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                            <div className="text-center p-3 bg-primary/5 rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {confraternities.length}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Total de Confraternizações
                                </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    +{confraternities.length * 50}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    XP de Networking
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function UserConfraternityItem({
    confraternity,
    userId
}: {
    confraternity: any
    userId: string
}) {
    const otherMember = confraternity.member1_id === userId
        ? confraternity.member2
        : confraternity.member1

    const mainPhoto = confraternity.photos?.[0]

    return (
        <div className="flex gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
            {/* Foto ou Avatar */}
            {mainPhoto ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img
                        src={mainPhoto}
                        alt="Confraternização"
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={otherMember?.avatar_url || ''} />
                    <AvatarFallback>
                        {otherMember?.full_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                    Com {otherMember?.full_name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                        {formatDistanceToNow(new Date(confraternity.date_occurred), {
                            addSuffix: true,
                            locale: ptBR
                        })}
                    </span>
                </div>
                {confraternity.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{confraternity.location}</span>
                    </div>
                )}
            </div>

            {/* Photos count */}
            {confraternity.photos && confraternity.photos.length > 1 && (
                <Badge variant="secondary" className="self-start">
                    {confraternity.photos.length} fotos
                </Badge>
            )}
        </div>
    )
}
