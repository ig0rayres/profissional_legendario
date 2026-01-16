'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, ShieldAlert, MessageSquare, Info, Star, Clock, MoreVertical, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MOCK_NOTIFICATIONS, Notification, NotificationType, NotificationPriority } from '@/lib/data/mock'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // In a real app, this would fetch from an API
        setNotifications(MOCK_NOTIFICATIONS)
    }, [])

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read_at).length)
    }, [notifications])

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
        )
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getIcon = (type: NotificationType, priority: NotificationPriority) => {
        if (priority === 'critical') return <ShieldAlert className="w-5 h-5 text-red-500" />

        switch (type) {
            case 'security': return <ShieldAlert className="w-5 h-5 text-red-500" />
            case 'invitation': return <MessageSquare className="w-5 h-5 text-secondary" />
            case 'profile': return <Star className="w-5 h-5 text-primary" />
            case 'promo': return <Clock className="w-5 h-5 text-amber-500" />
            default: return <Info className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10 transition-colors group">
                    <Bell className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white glow-orange animate-in zoom-in">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 glass-strong border-primary/20 shadow-2xl mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-white uppercase tracking-widest text-sm">Notificações</h3>
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
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card/20 opacity-50">
                            <Bell className="w-12 h-12 mb-4 text-slate-400 opacity-20" />
                            <p className="text-sm font-medium text-slate-400">Silêncio no campo de batalha.</p>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {[...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(notification => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-all hover:bg-white/5 relative group cursor-default",
                                        !notification.read_at && "bg-primary/2 border-l-2 border-primary"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-lg bg-card border border-white/5 flex-shrink-0",
                                            notification.priority === 'critical' ? 'bg-red-500/10 border-red-500/20' : ''
                                        )}>
                                            {getIcon(notification.type, notification.priority)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className={cn(
                                                    "text-sm font-bold truncate pr-6",
                                                    notification.priority === 'critical' ? 'text-red-400' : 'text-white'
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-500 flex-shrink-0 uppercase tracking-tighter">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed break-words">
                                                {notification.body}
                                            </p>

                                            <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.read_at && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="h-7 px-2 text-[10px] font-bold uppercase text-primary hover:bg-primary/10 border border-primary/20"
                                                    >
                                                        <Check className="w-3 h-3 mr-1" /> Marcar lido
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="h-7 px-2 text-[10px] font-bold uppercase text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                                                </Button>
                                            </div>
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
                    <Button variant="outline" className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-white border-white/5 bg-white/2 h-9 tracking-[0.1em]">
                        Ver Histórico Completo
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
