'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, ShieldAlert, MessageSquare, Info, Star, Clock, Link2, CheckCheck, Briefcase, CheckCircle2, XCircle, Swords, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    body: string
    priority: string
    action_url?: string
    metadata?: any
    read_at?: string
    created_at: string
}

export default function NotificationsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [responseModal, setResponseModal] = useState<{ open: boolean, accepted: boolean, userName: string, type: 'connection' | 'confraternity' }>({ open: false, accepted: false, userName: '', type: 'connection' })

    const unreadCount = notifications.filter(n => !n.read_at).length

    useEffect(() => {
        if (user) {
            loadNotifications()
        }
    }, [user])

    async function loadNotifications() {
        if (!user) return

        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.warn('[Notifications] Error loading:', error.message)
        } else {
            setNotifications(data || [])
        }
        setLoading(false)
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            )
        }
    }

    const markAllAsRead = async () => {
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .is('read_at', null)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            )
        }
    }

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id)
        if (notification.action_url) {
            router.push(notification.action_url)
        }
    }

    const respondToConnection = async (notification: Notification, accept: boolean) => {
        const fromUserId = notification.metadata?.from_user_id
        const senderName = notification.body.split(' deseja')[0] || 'Usuário'

        try {
            const { error } = await supabase
                .from('user_connections')
                .update({
                    status: accept ? 'accepted' : 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('requester_id', fromUserId)
                .eq('addressee_id', user?.id)

            if (error) {
                setResponseModal({ open: true, accepted: false, userName: 'Erro: ' + error.message, type: 'connection' })
                return
            }

            await markAsRead(notification.id)
            setNotifications(prev => prev.filter(n => n.id !== notification.id))
            setResponseModal({ open: true, accepted: accept, userName: senderName, type: 'connection' })
        } catch (err: any) {
            setResponseModal({ open: true, accepted: false, userName: 'Erro inesperado', type: 'connection' })
        }
    }

    const respondToConfraternity = async (notification: Notification, accept: boolean) => {
        const inviteId = notification.metadata?.invite_id
        const senderName = notification.metadata?.from_user_name || 'Usuário'

        if (!inviteId) {
            setResponseModal({ open: true, accepted: false, userName: 'Erro: convite não encontrado', type: 'confraternity' })
            return
        }

        try {
            const { error } = await supabase
                .from('confraternity_invites')
                .update({
                    status: accept ? 'accepted' : 'rejected',
                    accepted_at: accept ? new Date().toISOString() : null
                })
                .eq('id', inviteId)
                .eq('receiver_id', user?.id)

            if (error) {
                setResponseModal({ open: true, accepted: false, userName: 'Erro: ' + error.message, type: 'confraternity' })
                return
            }

            setNotifications(prev => prev.filter(n => n.id !== notification.id))
            await markAsRead(notification.id)
            await supabase.from('notifications').delete().eq('id', notification.id)
            setResponseModal({ open: true, accepted: accept, userName: senderName, type: 'confraternity' })
        } catch (err: any) {
            setNotifications(prev => prev.filter(n => n.id !== notification.id))
            setResponseModal({ open: true, accepted: false, userName: 'Erro inesperado', type: 'confraternity' })
        }
    }

    const getIcon = (type: string, priority: string) => {
        if (priority === 'critical') return <ShieldAlert className="w-5 h-5 text-red-500" />

        switch (type) {
            case 'connection_request': return <Link2 className="w-5 h-5 text-secondary" />
            case 'connection_accepted': return <Link2 className="w-5 h-5 text-green-500" />
            case 'confraternity_invite': return <Swords className="w-5 h-5 text-primary" />
            case 'confraternity_reminder': return <Clock className="w-5 h-5 text-orange-500" />
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />
            case 'rating': return <Star className="w-5 h-5 text-yellow-500" />
            case 'project': return <Briefcase className="w-5 h-5 text-purple-500" />
            case 'security': return <ShieldAlert className="w-5 h-5 text-red-500" />
            default: return <Info className="w-5 h-5 text-primary" />
        }
    }

    if (!user) {
        return (
            <div className="container mx-auto py-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                        <Bell className="w-6 h-6 text-secondary" />
                        Notificações
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações lidas'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Marcar todas
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Bell className="w-16 h-16 mb-4 text-muted-foreground/20" />
                            <p className="text-lg font-medium text-muted-foreground">Silêncio no campo de batalha.</p>
                            <p className="text-sm text-muted-foreground mt-1">Nenhuma notificação por enquanto.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "p-4 transition-all hover:bg-muted/50 relative group cursor-pointer",
                                        !notification.read_at && "bg-primary/5 border-l-4 border-primary"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-lg bg-muted border border-border flex-shrink-0",
                                            notification.priority === 'critical' ? 'bg-red-500/10 border-red-500/20' : ''
                                        )}>
                                            {getIcon(notification.type, notification.priority)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className={cn(
                                                    "text-sm font-bold truncate pr-6",
                                                    notification.priority === 'critical' ? 'text-red-600' : 'text-foreground'
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                {notification.body}
                                            </p>

                                            {/* Botões de ação */}
                                            {notification.type === 'connection_request' && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); respondToConnection(notification, true) }}
                                                        className="bg-green-500 hover:bg-green-600 text-white"
                                                    >
                                                        <Check className="w-4 h-4 mr-1" /> Aceitar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); respondToConnection(notification, false) }}
                                                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" /> Recusar
                                                    </Button>
                                                </div>
                                            )}

                                            {notification.type === 'confraternity_invite' && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); respondToConfraternity(notification, true) }}
                                                        className="bg-primary hover:bg-primary/80 text-white"
                                                    >
                                                        <Check className="w-4 h-4 mr-1" /> Aceitar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); respondToConfraternity(notification, false) }}
                                                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" /> Recusar
                                                    </Button>
                                                </div>
                                            )}

                                            {notification.type !== 'connection_request' && notification.type !== 'confraternity_invite' && (
                                                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.read_at && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); markAsRead(notification.id) }}
                                                            className="text-xs text-primary hover:bg-primary/10"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Marcar lido
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }}
                                                        className="text-xs text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" /> Excluir
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Resposta */}
            <Dialog open={responseModal.open} onOpenChange={(open) => setResponseModal(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${responseModal.accepted ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                {responseModal.accepted ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-500" />
                                )}
                            </div>
                        </div>
                        <DialogTitle className={`text-center text-xl font-black ${responseModal.accepted ? 'text-green-600' : 'text-slate-700'}`}>
                            {responseModal.type === 'confraternity'
                                ? (responseModal.accepted ? '⚔️ Confraria Aceita!' : 'Convite Recusado')
                                : (responseModal.accepted ? '🔗 Elo Criado!' : 'Solicitação Recusada')
                            }
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
                            {responseModal.type === 'confraternity'
                                ? (responseModal.accepted
                                    ? `Você aceitou a confraria com ${responseModal.userName}!`
                                    : `O convite de ${responseModal.userName} foi recusado.`)
                                : (responseModal.accepted
                                    ? `Você e ${responseModal.userName} agora estão conectados!`
                                    : `A solicitação de ${responseModal.userName} foi recusada.`)
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex sm:justify-center mt-4">
                        <Button onClick={() => setResponseModal(prev => ({ ...prev, open: false }))}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
