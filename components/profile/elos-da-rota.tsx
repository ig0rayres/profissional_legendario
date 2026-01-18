'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { getProfileUrl } from '@/lib/profile/utils'

interface Connection {
    id: string
    full_name: string
    avatar_url: string | null
    slug: string | null
    rota_number: string | null
    rank_id: string
    rank_name: string
}

interface ElosDaRotaProps {
    userId: string
}

export function ElosDaRota({ userId }: ElosDaRotaProps) {
    const [connections, setConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadConnections()
    }, [userId])

    async function loadConnections() {
        setLoading(true)

        // Buscar todas as conexões aceitas deste usuário
        const { data: connectionsData, error } = await supabase
            .from('user_connections')
            .select('requester_id, addressee_id')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

        if (!connectionsData || connectionsData.length === 0) {
            setConnections([])
            setLoading(false)
            return
        }

        // Pegar os IDs dos amigos (o outro lado da conexão)
        const friendIds = connectionsData.map(conn =>
            conn.requester_id === userId ? conn.addressee_id : conn.requester_id
        )

        // Buscar perfis dos amigos
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, slug, rota_number, avatar_url')
            .in('id', friendIds)

        if (!profiles || profiles.length === 0) {
            setConnections([])
            setLoading(false)
            return
        }

        // Buscar patentes dos amigos
        const { data: gamificationData } = await supabase
            .from('user_gamification')
            .select('user_id, rank_id, ranks(name)')
            .in('user_id', friendIds)

        // Criar mapa de patentes (rank_id para usar com RankInsignia)
        const rankMap = new Map<string, { rank_id: string, name: string }>()
        gamificationData?.forEach((g: any) => {
            rankMap.set(g.user_id, {
                rank_id: g.rank_id || 'novato',
                name: g.ranks?.name || 'Novato'
            })
        })

        // Combinar dados
        setConnections(profiles.map(p => ({
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            slug: p.slug,
            rota_number: p.rota_number,
            rank_id: rankMap.get(p.id)?.rank_id || 'novato',
            rank_name: rankMap.get(p.id)?.name || 'Novato'
        })))

        setLoading(false)
    }

    // Função para pegar nome + sobrenome
    const getDisplayName = (fullName: string) => {
        const parts = fullName.split(' ')
        if (parts.length >= 2) {
            return `${parts[0]} ${parts[parts.length - 1]}`
        }
        return fullName
    }

    return (
        <Card className="glass-card border-primary/10 shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <Link2 className="w-4 h-4 text-primary" />
                    Elos da Rota
                    {connections.length > 0 && (
                        <span className="ml-auto bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                            {connections.length}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs uppercase tracking-wide">Nenhum elo ainda</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {connections.slice(0, 6).map((connection) => (
                            <Link
                                key={connection.id}
                                href={getProfileUrl({ full_name: connection.full_name, slug: connection.slug, rota_number: connection.rota_number })}
                                className="group flex flex-col items-center text-center"
                            >
                                <div className="relative mb-2">
                                    {connection.avatar_url ? (
                                        <Image
                                            src={connection.avatar_url}
                                            alt={connection.full_name}
                                            width={56}
                                            height={56}
                                            className="rounded-full border-2 border-primary/20 group-hover:border-primary transition-colors"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center group-hover:border-primary transition-colors">
                                            <span className="text-lg font-bold text-primary">
                                                {connection.full_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {/* Ícone da Patente usando RankInsignia com variante 'avatar' para ter fundo */}
                                    <div
                                        className="absolute -bottom-1 -right-1"
                                        title={connection.rank_name}
                                    >
                                        <RankInsignia
                                            rankId={connection.rank_id}
                                            size="sm"
                                            variant="avatar"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] font-medium text-foreground truncate w-full group-hover:text-primary transition-colors leading-tight">
                                    {getDisplayName(connection.full_name)}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}

                {connections.length > 6 && (
                    <div className="mt-4 text-center">
                        <Link href={`/profile/${userId}/connections`} className="text-xs text-primary hover:underline">
                            Ver todos ({connections.length})
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
