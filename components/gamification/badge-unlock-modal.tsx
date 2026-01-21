'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { X, Award, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import confetti from 'canvas-confetti'

interface BadgeNotification {
    id: string
    badge_id: string
    badge_name: string
    xp: number
}

/**
 * Componente que exibe modal grande quando usuário ganha medalha
 * Deve ser colocado no layout principal da aplicação
 */
export function BadgeUnlockModal() {
    const { user } = useAuth()
    const [notification, setNotification] = useState<BadgeNotification | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (!user) {
            console.log('[BadgeUnlockModal] Sem usuário, não conectando...')
            return
        }

        console.log('[BadgeUnlockModal] Conectando canal realtime para userId:', user.id)
        const supabase = createClient()

        // Função para processar notificação de medalha
        const processNotification = (notificationData: any) => {
            const badgeData = notificationData.metadata
            console.log('[BadgeUnlockModal] Processando:', notificationData.type, badgeData)

            if (notificationData.type === 'badge_earned' && badgeData) {
                console.log('[BadgeUnlockModal] 🎉 Medalha detectada! Exibindo modal...')
                setNotification({
                    id: notificationData.id,
                    badge_id: badgeData.badge_id,
                    badge_name: badgeData.badge_name,
                    xp: badgeData.xp || 0
                })
                setIsVisible(true)

                // Dispara confetti! 🎉
                setTimeout(() => {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    })
                }, 300)
            }
        }

        // Verificar notificações pendentes (não lidas) ao carregar
        const checkPendingNotifications = async () => {
            const { data: pending } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'badge_earned')
                .is('read_at', null)
                .order('created_at', { ascending: false })
                .limit(1)

            if (pending && pending.length > 0) {
                console.log('[BadgeUnlockModal] 📬 Notificação pendente encontrada:', pending[0])
                processNotification(pending[0])
            }
        }

        // Escutar novas notificações de medalha
        const channel = supabase
            .channel('badge-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('[BadgeUnlockModal] Recebeu notificação realtime:', payload)
                    processNotification(payload.new)
                }
            )
            .subscribe((status) => {
                console.log('[BadgeUnlockModal] Status do canal:', status)
                // Quando conectar, verificar notificações pendentes
                if (status === 'SUBSCRIBED') {
                    checkPendingNotifications()
                }
            })

        return () => {
            console.log('[BadgeUnlockModal] Desconectando canal...')
            supabase.removeChannel(channel)
        }
    }, [user])

    const handleClose = async () => {
        setIsVisible(false)

        // Marcar notificação como lida (usar read_at para consistência)
        if (notification) {
            const supabase = createClient()
            await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notification.id)
            console.log('[BadgeUnlockModal] Notificação marcada como lida:', notification.id)
        }

        setTimeout(() => setNotification(null), 300)
    }

    if (!notification) return null

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal - Estilo Rota Valente */}
            <div className={`relative bg-gradient-to-br from-[#1a2e1a] via-[#243424] to-[#1a2e1a] rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-accent/40 transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'
                }`}>

                {/* Decoração de cantos - estilo militar */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-accent/60 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-accent/60 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-accent/60 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent/60 rounded-br-2xl" />

                {/* Botão fechar */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={handleClose}
                >
                    <X className="w-5 h-5" />
                </Button>

                {/* Ícone central - Escudo épico */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-28 h-28 bg-accent/30 rounded-full blur-xl animate-pulse" />

                        {/* Escudo principal */}
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-accent via-orange-500 to-accent flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.5)] border-4 border-accent/80">
                            <Award className="w-14 h-14 text-white drop-shadow-lg" />
                        </div>

                        {/* Sparkles */}
                        <Sparkles className="absolute -top-2 -right-1 w-7 h-7 text-accent animate-bounce" />
                        <Sparkles className="absolute -bottom-1 -left-2 w-5 h-5 text-accent animate-bounce delay-150" />
                    </div>
                </div>

                {/* Texto */}
                <div className="text-center">
                    <p className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-3">
                        ⚔️ Conquista Desbloqueada ⚔️
                    </p>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide drop-shadow-lg">
                        {notification.badge_name}
                    </h2>
                    <p className="text-white/60 text-sm mb-4 italic">
                        "Pra cima, Valente!"
                    </p>

                    {notification.xp > 0 && (
                        <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-5 py-2 mb-6">
                            <span className="text-accent font-black text-xl">
                                +{notification.xp} VIGOR
                            </span>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-accent to-orange-600 hover:from-orange-500 hover:to-accent text-white font-black uppercase tracking-wider shadow-lg shadow-accent/30 border border-accent/50"
                        onClick={handleClose}
                    >
                        🔥 Continuar a Jornada
                    </Button>
                </div>
            </div>
        </div>
    )
}
