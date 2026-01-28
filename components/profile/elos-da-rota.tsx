'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Users, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AvatarWithRank } from '@/components/ui/avatar-with-rank'
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
    const [pendingCount, setPendingCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadConnections()
        loadPendingRequests()

        // Subscrever a mudanças em tempo real na tabela user_connections
        const channel = supabase
            .channel('elos-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_connections',
                filter: `requester_id=eq.${userId}`
            }, () => {
                loadConnections()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_connections',
                filter: `addressee_id=eq.${userId}`
            }, () => {
                loadConnections()
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
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
            .select('user_id, current_rank_id, ranks:current_rank_id(name)')
            .in('user_id', friendIds)

        // Criar mapa de patentes (rank_id para usar com RankInsignia)
        const rankMap = new Map<string, { rank_id: string, name: string }>()
        gamificationData?.forEach((g: any) => {
            rankMap.set(g.user_id, {
                rank_id: g.current_rank_id || 'novato',
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

    // Carregar solicitações pendentes de elo (onde o usuário é o destinatário)
    async function loadPendingRequests() {
        const { count } = await supabase
            .from('user_connections')
            .select('*', { count: 'exact', head: true })
            .eq('addressee_id', userId)
            .eq('status', 'pending')

        setPendingCount(count || 0)
    }

    // Abrir notificações (simula clique no sininho)
    const openNotifications = () => {
        // Procurar o botão do sininho e clicar nele
        const bellButton = document.querySelector('[data-notification-trigger]') as HTMLButtonElement
        if (bellButton) {
            bellButton.click()
        }
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
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Elos da Rota
                            </h3>
                            <p className="text-xs text-gray-600">
                                {connections.length} conexões
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <button
                            onClick={openNotifications}
                            className="relative p-2 rounded-xl bg-[#D2691E]/10 border border-[#D2691E]/20 hover:bg-[#D2691E]/20 transition-all transform hover:scale-110 duration-300 group/bell"
                            title={`${pendingCount} solicitação(ões) pendente(s) - Clique para ver`}
                        >
                            <Bell className="w-5 h-5 text-[#D2691E] group-hover/bell:animate-bounce" />
                            <span className="absolute top-0 right-0 w-5 h-5 bg-[#D2691E] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
                                {pendingCount}
                            </span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E4D40]"></div>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-[#1E4D40]/30 hover:bg-[#1E4D40]/5 transition-all cursor-pointer">
                        <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                            Ainda não há conexões
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Conecte-se com outros profissionais
                        </p>
                    </div>
                ) : (
                    <>
                        {/* GRID 3 COLUNAS */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {connections.slice(0, 6).map((connection) => (
                                <div
                                    key={connection.id}
                                    className="group flex flex-col items-center text-center"
                                >
                                    <AvatarWithRank
                                        user={{
                                            id: connection.id,
                                            full_name: connection.full_name,
                                            avatar_url: connection.avatar_url,
                                            rank_id: connection.rank_id,
                                            rank_name: connection.rank_name,
                                            slug: connection.slug || undefined,
                                            rota_number: connection.rota_number || undefined
                                        }}
                                        size="md"
                                        showName={true}
                                        linkToProfile={true}
                                        variant="rounded"
                                    />
                                </div>
                            ))}
                        </div>

                        {connections.length > 6 && (
                            <div className="text-center pt-2 border-t border-gray-200">
                                <Link href={`/profile/${userId}/connections`} className="text-xs text-[#1E4D40] hover:underline">
                                    Ver todos ({connections.length})
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
