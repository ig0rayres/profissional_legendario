'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, ShieldAlert, MessageSquare, Info, Star, Clock, Link2, CheckCheck, Briefcase, CheckCircle2, XCircle, Swords, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { getActionPoints } from '@/lib/services/point-actions-service'

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

export function NotificationCenter() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [responseModal, setResponseModal] = useState<{ open: boolean, accepted: boolean, userName: string, type: 'connection' | 'confraternity' }>({ open: false, accepted: false, userName: '', type: 'connection' })

    useEffect(() => {
        if (user) {
            loadNotifications()
            // Subscrever a mudanças em tempo real
            const channel = supabase
                .channel('notifications')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev])
                })
                .subscribe()

            return () => {
                channel.unsubscribe()
            }
        }
    }, [user])

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read_at).length)
    }, [notifications])

    async function loadNotifications() {
        if (!user) return

        setLoading(true)
        const { data: notificationsData, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.warn('[Notifications] Error loading:', error.message)
            setLoading(false)
            return
        }

        let validNotifications = notificationsData || []

        // 🧹 SANITY CHECK: Verificar se solicitações de conexão/confraria ainda estão pendentes
        // Isso evita mostrar botões "Aceitar" para coisas já resolvidas em outro lugar
        if (validNotifications.length > 0) {
            const connectionRequests = validNotifications.filter(n => n.type === 'connection_request' && n.metadata?.from_user_id)
            const confraternityInvites = validNotifications.filter(n => n.type === 'confraternity_invite' && n.metadata?.invite_id)

            // 1. Verificar Conexões
            if (connectionRequests.length > 0) {
                const requesterIds = connectionRequests.map(n => n.metadata.from_user_id)

                // Buscar conexões que JÁ foram processadas (accepted ou rejected)
                const { data: processedConnections } = await supabase
                    .from('user_connections')
                    .select('requester_id, status')
                    .eq('addressee_id', user.id)
                    .in('requester_id', requesterIds)
                    .neq('status', 'pending') // Só queremos as que NÃO são pending

                // Remover notificações dessas conexões processadas
                if (processedConnections && processedConnections.length > 0) {
                    const processedRequesterIds = processedConnections.map(c => c.requester_id)
                    // Filtrar LOCALMENTE (não deletamos do banco aqui para performance, apenas escondemos)
                    // O ideal seria marcar como lido também, mas esconder já resolve a UX imediata
                    validNotifications = validNotifications.filter(n => {
                        if (n.type === 'connection_request') {
                            return !processedRequesterIds.includes(n.metadata.from_user_id)
                        }
                        return true
                    })
                }
            }

            // 2. Verificar Convites de Confraria
            if (confraternityInvites.length > 0) {
                const inviteIds = confraternityInvites.map(n => n.metadata.invite_id)

                // Buscar convites que JÁ foram processados
                const { data: processedInvites } = await supabase
                    .from('confraternity_invites')
                    .select('id, status')
                    .in('id', inviteIds)
                    .neq('status', 'pending')

                if (processedInvites && processedInvites.length > 0) {
                    const processedInviteIds = processedInvites.map(i => i.id)
                    validNotifications = validNotifications.filter(n => {
                        if (n.type === 'confraternity_invite') {
                            return !processedInviteIds.includes(n.metadata.invite_id)
                        }
                        return true
                    })
                }
            }
        }

        setNotifications(validNotifications)
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

    // Responder a solicitação de conexão
    const respondToConnection = async (notification: Notification, accept: boolean) => {
        const connectionId = notification.metadata?.connection_id
        const fromUserId = notification.metadata?.from_user_id

        // Extrair nome do remetente da notificação
        const senderName = notification.body.split(' deseja')[0] || 'Usuário'

        if (!connectionId && !fromUserId) {
            setResponseModal({ open: true, accepted: false, userName: 'Erro: dados não encontrados', type: 'connection' })
            return
        }

        try {
            // Atualizar status da conexão
            const { error } = await supabase
                .from('user_connections')
                .update({
                    status: accept ? 'accepted' : 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('requester_id', fromUserId)
                .eq('addressee_id', user?.id)

            if (error) {
                console.error('[Notifications] respondToConnection error:', error)
                setResponseModal({ open: true, accepted: false, userName: 'Erro: ' + error.message, type: 'connection' })
                return
            }

            // 🎮 GAMIFICAÇÃO: +5 XP por ACEITAR elo
            if (accept && user && fromUserId) {
                console.log('[Notifications] Gamificação: Aceitou elo, adicionando XP...')
                try {
                    const { awardPoints, awardBadge, checkEloPointsAlreadyAwarded } = await import('@/lib/api/gamification')

                    // Verificar se já recebeu pontos por este elo (anti-farming)
                    const alreadyAwarded = await checkEloPointsAlreadyAwarded(user.id, fromUserId, 'elo_accepted')

                    if (!alreadyAwarded) {
                        // Dar pontos ao usuário que aceitou
                        const points = await getActionPoints('elo_accepted')
                        const result = await awardPoints(
                            user.id,
                            points,
                            'elo_accepted',
                            `Aceitou elo com ${senderName}`,
                            { target_user_id: fromUserId } // Para verificação de duplicação
                        )
                        console.log('[Notifications] awardPoints (aceite elo) resultado:', result)

                        // Verificar se é o primeiro elo (medalha "presente")
                        const { count } = await supabase
                            .from('user_connections')
                            .select('*', { count: 'exact', head: true })
                            .eq('addressee_id', user.id)
                            .eq('status', 'accepted')

                        if (count === 1) {
                            await awardBadge(user.id, 'presente')
                            console.log('[Notifications] Medalha "Presente" concedida!')
                        }
                    } else {
                        console.log('[Notifications] Pontos de aceite já creditados para este par de usuários')
                    }
                } catch (gamifError) {
                    console.error('[Notifications] Erro de gamificação:', gamifError)
                }
            }

            // Marcar notificação como lida e remover
            await markAsRead(notification.id)
            setNotifications(prev => prev.filter(n => n.id !== notification.id))

            // Mostrar modal de sucesso
            setResponseModal({ open: true, accepted: accept, userName: senderName, type: 'connection' })
        } catch (err: any) {
            console.error('[Notifications] respondToConnection error:', err)
            setResponseModal({ open: true, accepted: false, userName: 'Erro inesperado', type: 'connection' })
        }
    }

    const getIcon = (type: string, priority: string) => {
        if (priority === 'critical') return <ShieldAlert className="w-5 h-5 text-red-500" />

        switch (type) {
            case 'badge_earned': return <Award className="w-5 h-5 text-yellow-500" />
            case 'connection_request': return <Link2 className="w-5 h-5 text-secondary" />
            case 'connection_accepted': return <Link2 className="w-5 h-5 text-green-500" />
            case 'confraternity_invite': return <Swords className="w-5 h-5 text-primary" />
            case 'confraternity_reminder': return <Clock className="w-5 h-5 text-orange-500" />
            case 'withdrawal_approved': return <CheckCircle2 className="w-5 h-5 text-green-600" />
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />
            case 'rating': return <Star className="w-5 h-5 text-yellow-500" />
            case 'project': return <Briefcase className="w-5 h-5 text-purple-500" />
            case 'security': return <ShieldAlert className="w-5 h-5 text-red-500" />
            case 'promo': return <Clock className="w-5 h-5 text-amber-500" />
            default: return <Info className="w-5 h-5 text-primary" />
        }
    }

    // Responder a convite de confraria
    const respondToConfraternity = async (notification: Notification, accept: boolean) => {
        const inviteId = notification.metadata?.invite_id
        const senderName = notification.metadata?.from_user_name || 'Usuário'
        const senderId = notification.metadata?.from_user_id

        if (!inviteId) {
            setResponseModal({ open: true, accepted: false, userName: 'Erro: convite não encontrado', type: 'confraternity' })
            return
        }

        try {
            // IMPORTANTE: Verificar se o convite ainda está pendente (anti-farming)
            const { data: currentInvite, error: checkError } = await supabase
                .from('confraternity_invites')
                .select('status')
                .eq('id', inviteId)
                .single()

            if (checkError || !currentInvite) {
                console.log('[Confraternity] Convite não encontrado, removendo notificação...')
                // Convite não existe mais, remover notificação silenciosamente
                setNotifications(prev => prev.filter(n => n.id !== notification.id))
                await supabase.from('notifications').delete().eq('id', notification.id)
                return
            }

            if (currentInvite.status !== 'pending') {
                console.log('[Confraternity] Convite já foi processado (status:', currentInvite.status, '), removendo notificação...')
                // Convite já foi aceito/rejeitado, remover notificação sem dar pontos
                setNotifications(prev => prev.filter(n => n.id !== notification.id))
                await supabase.from('notifications').delete().eq('id', notification.id)
                // Mostrar mensagem informativa
                setResponseModal({
                    open: true,
                    accepted: currentInvite.status === 'accepted',
                    userName: `Convite já ${currentInvite.status === 'accepted' ? 'aceito' : 'processado'}`,
                    type: 'confraternity'
                })
                return
            }

            // Convite está pendente, processar normalmente
            const { error } = await supabase
                .from('confraternity_invites')
                .update({
                    status: accept ? 'accepted' : 'rejected',
                    accepted_at: accept ? new Date().toISOString() : null
                })
                .eq('id', inviteId)
                .eq('receiver_id', user?.id)
                .eq('status', 'pending') // Só atualizar se ainda estiver pendente

            if (error) {
                console.error('[Notifications] respondToConfraternity error:', error)
                setResponseModal({ open: true, accepted: false, userName: 'Erro: ' + error.message, type: 'confraternity' })
                return
            }

            // Se aceite, dar pontos ao receptor
            if (accept && user) {
                // Dar pontos ao receptor (quem aceitou) - 10 XP base
                console.log('[Confraternity] Iniciando gamificação para receptor:', user.id)
                try {
                    const { awardPoints } = await import('@/lib/api/gamification')
                    console.log('[Confraternity] awardPoints importado, chamando...')
                    const points = await getActionPoints('confraternity_accepted')
                    const result = await awardPoints(user.id, points, 'confraternity_accepted', 'Aceitou convite de confraria')
                    console.log('[Confraternity] Points result:', JSON.stringify(result))

                    if (!result.success) {
                        console.error('[Confraternity] Falha ao dar pontos:', result.error)
                    }
                } catch (e) {
                    console.error('[Confraternity] Error awarding points to receiver:', e)
                }
            } else {
                console.log('[Confraternity] Condição não atendida - accept:', accept, 'user:', !!user)
            }

            // Remover notificação IMEDIATAMENTE do estado local (evitar farming)
            setNotifications(prev => prev.filter(n => n.id !== notification.id))

            // Marcar como lida e deletar do banco para evitar reuso
            await markAsRead(notification.id)
            await supabase.from('notifications').delete().eq('id', notification.id)

            // Mostrar modal de sucesso
            setResponseModal({ open: true, accepted: accept, userName: senderName, type: 'confraternity' })
        } catch (err: any) {
            console.error('[Notifications] respondToConfraternity error:', err)
            // Mesmo com erro, remover a notificação para evitar farming
            setNotifications(prev => prev.filter(n => n.id !== notification.id))
            setResponseModal({ open: true, accepted: false, userName: 'Erro inesperado', type: 'confraternity' })
        }
    }

    if (!user) return null

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-white/10 transition-colors group"
                        data-notification-trigger
                    >
                        <Bell className="w-5 h-5 text-accent fill-accent/20 group-hover:text-accent transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white glow-orange animate-in zoom-in">
                                {unreadCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 bg-white dark:bg-slate-900 border border-border shadow-2xl mr-4" align="end">
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Notificações</h3>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                                    {unreadCount} novas
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-8 text-[10px] font-black uppercase text-primary hover:bg-primary/10 tracking-wider"
                            >
                                <CheckCheck className="w-3 h-3 mr-1" /> Marcar todas
                            </Button>
                        )}
                    </div>

                    <ScrollArea className="h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card/20 opacity-50">
                                <Bell className="w-12 h-12 mb-4 text-slate-400 opacity-20" />
                                <p className="text-sm font-medium text-slate-400">Silêncio no campo de batalha.</p>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Nenhuma notificação</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "p-4 transition-all hover:bg-muted/50 relative group cursor-pointer",
                                            !notification.read_at && "bg-primary/5 border-l-2 border-primary"
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
                                                    <span className="text-[10px] font-bold text-muted-foreground flex-shrink-0 uppercase tracking-tighter">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-foreground/80 leading-relaxed break-words">
                                                    {notification.body}
                                                </p>

                                                {/* Botões de Aceitar/Recusar para solicitações de conexão - SEMPRE visíveis até interagir */}
                                                {notification.type === 'connection_request' && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); respondToConnection(notification, true) }}
                                                            className="h-7 px-3 text-[10px] font-bold uppercase bg-green-500 hover:bg-green-600 text-white"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Aceitar
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); respondToConnection(notification, false) }}
                                                            className="h-7 px-3 text-[10px] font-bold uppercase border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" /> Recusar
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Botões de Aceitar/Recusar para convites de CONFRARIA */}
                                                {notification.type === 'confraternity_invite' && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); respondToConfraternity(notification, true) }}
                                                            className="h-7 px-3 text-[10px] font-bold uppercase bg-primary hover:bg-primary/80 text-white"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Aceitar
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); respondToConfraternity(notification, false) }}
                                                            className="h-7 px-3 text-[10px] font-bold uppercase border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" /> Recusar
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Botões padrão para outras notificações */}
                                                {notification.type !== 'connection_request' && notification.type !== 'confraternity_invite' && (
                                                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.read_at && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); markAsRead(notification.id) }}
                                                                className="h-7 px-2 text-[10px] font-bold uppercase text-primary hover:bg-primary/10 border border-primary/20"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" /> Marcar lido
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }}
                                                            className="h-7 px-2 text-[10px] font-bold uppercase text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" /> Excluir
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Dot for unread */}
                                        {!notification.read_at && (
                                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-3 border-t border-primary/10 bg-card/50">
                        <Button
                            variant="outline"
                            className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-white border-white/5 bg-white/2 h-9 tracking-[0.1em]"
                            onClick={() => router.push('/dashboard/notifications')}
                        >
                            Ver Histórico Completo
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Modal de Resposta de Conexão */}
            <Dialog open={responseModal.open} onOpenChange={(open) => setResponseModal(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-md bg-white border-primary/20 shadow-2xl">
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
                        <DialogTitle className={`text-center text-xl font-black uppercase tracking-wide ${responseModal.accepted ? 'text-green-600' : 'text-slate-700'}`}>
                            {responseModal.type === 'confraternity'
                                ? (responseModal.accepted ? '⚔️ Confraria Aceita!' : 'Convite Recusado')
                                : (responseModal.accepted ? '🔗 Elo Criado!' : 'Solicitação Recusada')
                            }
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 mt-2">
                            {responseModal.type === 'confraternity'
                                ? (responseModal.accepted
                                    ? `Você aceitou a confraria com ${responseModal.userName}! Pra cima, Valente! 🏹`
                                    : `O convite de ${responseModal.userName} foi recusado.`)
                                : (responseModal.accepted
                                    ? `Você e ${responseModal.userName} agora estão conectados!`
                                    : `A solicitação de ${responseModal.userName} foi recusada.`)
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex sm:justify-center mt-4">
                        <Button
                            onClick={() => {
                                setResponseModal(prev => ({ ...prev, open: false }))
                                // Recarregar página se aceitou para atualizar pontos e elos
                                if (responseModal.accepted) {
                                    window.location.reload()
                                }
                            }}
                            className={responseModal.accepted ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-slate-500 hover:bg-slate-600 text-white'}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
