// ============================================
// Page: Convites Pendentes
// /elo-da-rota/confraria/pendentes
// ============================================

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Send, Inbox } from 'lucide-react'
import { ConfraternityInviteCard } from '@/components/confraternity/ConfraternityInviteCard'

export const metadata = {
    title: 'Convites Pendentes | Elo da Rota',
    description: 'Gerenciar convites de confraternização'
}

async function getInvites(userId: string) {
    const supabase = await createClient()

    // Convites recebidos
    const { data: received } = await supabase
        .from('confraternity_invites')
        .select(`
            *,
            sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('receiver_id', userId)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })

    // Convites enviados
    const { data: sent } = await supabase
        .from('confraternity_invites')
        .select(`
            *,
            receiver:profiles!receiver_id(id, full_name, avatar_url)
        `)
        .eq('sender_id', userId)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })

    return {
        received: received || [],
        sent: sent || []
    }
}

export default async function ConfraternitiesPendingPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { received, sent } = await getInvites(user.id)

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Calendar className="h-10 w-10 text-primary" />
                    Convites de Confraria
                </h1>
                <p className="text-muted-foreground text-lg">
                    Gerencie suas solicitações de confraternização
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="received" className="flex items-center gap-2">
                        <Inbox className="h-4 w-4" />
                        Recebidos ({received.length})
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Enviados ({sent.length})
                    </TabsTrigger>
                </TabsList>

                {/* Recebidos */}
                <TabsContent value="received">
                    {received.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Inbox className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                                <p className="text-muted-foreground text-center">
                                    Você não tem convites pendentes
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {received.map((invite) => (
                                <ConfraternityInviteCard
                                    key={invite.id}
                                    invite={invite}
                                    type="received"
                                    currentUserId={user.id}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Enviados */}
                <TabsContent value="sent">
                    {sent.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Send className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                                <p className="text-muted-foreground text-center">
                                    Você ainda não enviou convites
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {sent.map((invite) => (
                                <ConfraternityInviteCard
                                    key={invite.id}
                                    invite={invite}
                                    type="sent"
                                    currentUserId={user.id}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
