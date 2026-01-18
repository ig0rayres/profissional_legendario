'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Link2, Loader2, Check, X, UserPlus, Clock, CheckCircle2, XCircle, Unlink } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

interface ConnectionButtonProps {
    targetUserId: string
    targetUserName: string
}

// Limites por plano
const PLAN_LIMITS: Record<string, { max: number, label: string }> = {
    'recruta': { max: 10, label: 'Recruta' },
    'veterano': { max: 100, label: 'Veterano' },
    'elite': { max: 999, label: 'Elite (Ilimitado)' }
}

export function ConnectionButton({ targetUserId, targetUserName }: ConnectionButtonProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'sent'>('none')
    const [error, setError] = useState<string | null>(null)
    const [canAdd, setCanAdd] = useState(true)
    const [connectionsUsed, setConnectionsUsed] = useState(0)
    const [connectionsMax, setConnectionsMax] = useState(10)
    const [userPlan, setUserPlan] = useState('recruta')

    // Estados do modal
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)

    const supabase = createClient()

    // Verificar status da conexão ao carregar
    useEffect(() => {
        if (!user) return
        checkConnectionStatus()
        checkLimits()
    }, [user, targetUserId])

    async function checkConnectionStatus() {
        if (!user) return

        console.log('[ConnectionButton] Checking connection between', user.id, 'and', targetUserId)

        const { data, error } = await supabase
            .from('user_connections')
            .select('status, requester_id, addressee_id')
            .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
            .single()

        console.log('[ConnectionButton] Connection result:', { data, error })

        if (data) {
            if (data.status === 'accepted') {
                console.log('[ConnectionButton] Status: ACCEPTED (ambos são amigos)')
                setStatus('accepted')
            } else if (data.status === 'pending') {
                const isSender = data.requester_id === user.id
                console.log('[ConnectionButton] Status: PENDING, isSender:', isSender)
                setStatus(isSender ? 'sent' : 'pending')
            }
        } else {
            console.log('[ConnectionButton] No connection found')
        }
    }

    async function checkLimits() {
        if (!user) return

        try {
            // Buscar plano do usuário DIRETAMENTE da tabela subscriptions
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('plan_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            const planId = subscription?.plan_id || 'recruta'
            setUserPlan(planId)

            const planLimit = PLAN_LIMITS[planId] || PLAN_LIMITS['recruta']
            setConnectionsMax(planLimit.max)

            // Contar conexões existentes
            const { count } = await supabase
                .from('user_connections')
                .select('*', { count: 'exact', head: true })
                .eq('requester_id', user.id)
                .in('status', ['pending', 'accepted'])

            const used = count || 0
            setConnectionsUsed(used)
            setCanAdd(used < planLimit.max)
        } catch (err) {
            console.warn('[ConnectionButton] checkLimits failed:', err)
            setCanAdd(true)
        }
    }

    function handleCreateEloClick() {
        if (!canAdd) {
            setError('Limite de conexões atingido')
            return
        }
        setShowConfirmModal(true)
    }

    async function confirmSendConnection() {
        if (!user) return

        setLoading(true)
        setError(null)
        setShowConfirmModal(false)

        try {
            const { error: insertError } = await supabase
                .from('user_connections')
                .insert({
                    requester_id: user.id,
                    addressee_id: targetUserId,
                    status: 'pending'
                })

            if (insertError) {
                console.error('[ConnectionButton] Insert error:', insertError)
                if (insertError.code === '23505') {
                    setStatus('sent')
                    setShowSuccessModal(true)
                } else {
                    setError(insertError.message || 'Erro ao enviar convite')
                }
            } else {
                setStatus('sent')
                setConnectionsUsed(prev => prev + 1)
                setShowSuccessModal(true)
            }
        } catch (err: any) {
            console.error('[ConnectionButton] sendConnection error:', err)
            setError(err.message || 'Erro inesperado')
        } finally {
            setLoading(false)
        }
    }

    async function respondConnection(accept: boolean) {
        if (!user) return

        setLoading(true)

        const { error: updateError } = await supabase
            .from('user_connections')
            .update({
                status: accept ? 'accepted' : 'rejected',
                updated_at: new Date().toISOString()
            })
            .eq('requester_id', targetUserId)
            .eq('addressee_id', user.id)

        if (!updateError) {
            setStatus(accept ? 'accepted' : 'none')
        }

        setLoading(false)
    }

    async function removeConnection() {
        if (!user) return

        setLoading(true)
        console.log('[ConnectionButton] Removing connection between', user.id, 'and', targetUserId)

        // Deletar conexão em ambas direções (requester ou addressee)
        const { error, count } = await supabase
            .from('user_connections')
            .delete()
            .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)

        console.log('[ConnectionButton] Delete result:', { error, count })

        if (error) {
            console.error('[ConnectionButton] Delete error:', error)
            alert('Erro ao romper elo: ' + error.message)
        } else {
            setStatus('none')
            setConnectionsUsed(prev => Math.max(0, prev - 1))
        }

        setLoading(false)
    }

    // Não mostrar botão se for o próprio usuário
    if (user?.id === targetUserId) return null

    // Não mostrar se não estiver logado
    if (!user) {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-primary/30">
                <Link2 className="w-3 h-3 mr-1" />
                CRIAR ELO
            </Button>
        )
    }

    // Já são amigos - Elo ligado (hover para romper)
    if (status === 'accepted') {
        return (
            <>
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowRemoveModal(true)}
                    className="font-bold text-[10px] h-7 px-2 bg-primary text-white hover:bg-secondary transition-all group shadow-md"
                >
                    <Check className="w-3 h-3 mr-1 group-hover:hidden" />
                    <Unlink className="w-3 h-3 mr-1 hidden group-hover:block" />
                    <span className="group-hover:hidden">ELO LIGADO</span>
                    <span className="hidden group-hover:block">ROMPER</span>
                </Button>

                {/* Modal de Romper Elo */}
                <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
                    <DialogContent className="sm:max-w-md bg-white border-red-500/20 shadow-2xl">
                        <DialogHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 rounded-full bg-red-500/10">
                                    <Unlink className="w-8 h-8 text-red-500" />
                                </div>
                            </div>
                            <DialogTitle className="text-center text-xl font-black uppercase tracking-wide text-slate-800">
                                Deseja Romper o Elo?
                            </DialogTitle>
                            <DialogDescription className="text-center text-sm text-slate-600 mt-2">
                                Tem certeza que deseja remover o Elo com <span className="font-bold text-slate-800">{targetUserName}</span>?
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex gap-2 sm:justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowRemoveModal(false)}
                                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Não
                            </Button>
                            <Button
                                onClick={() => {
                                    removeConnection()
                                    setShowRemoveModal(false)
                                }}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Unlink className="w-4 h-4 mr-2" />
                                )}
                                Sim, Romper
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    // Convite enviado, aguardando resposta
    if (status === 'sent') {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30 text-secondary">
                <Clock className="w-3 h-3 mr-1" />
                ELO ENVIADO
            </Button>
        )
    }

    // Convite recebido, pode aceitar ou recusar
    if (status === 'pending') {
        return (
            <div className="flex gap-1">
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => respondConnection(true)}
                    disabled={loading}
                    className="font-bold text-[10px] h-7 px-2 bg-primary hover:bg-primary/90"
                >
                    <Check className="w-3 h-3 mr-1" />
                    ACEITAR
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => respondConnection(false)}
                    disabled={loading}
                    className="font-bold text-[10px] h-7 px-2 border-destructive/30 text-destructive"
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>
        )
    }

    // Pode criar elo
    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={handleCreateEloClick}
                disabled={loading || !canAdd}
                className="font-bold text-[10px] h-7 px-2 border-primary/30 hover:bg-primary/10 hover:scale-105 hover:border-primary transition-all shadow-sm"
                title={!canAdd ? `Limite: ${connectionsUsed}/${connectionsMax} elos` : undefined}
            >
                {loading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                    <UserPlus className="w-3 h-3 mr-1" />
                )}
                CRIAR ELO
            </Button>

            {/* Modal de Confirmação */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md bg-white border-primary/20 shadow-2xl">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-full bg-primary/10">
                                <Link2 className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-black uppercase tracking-wide text-slate-800">
                            Enviar Convite de Elo?
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 mt-2">
                            Você está convidando <span className="font-bold text-slate-800">{targetUserName}</span> para criar um Elo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center my-4">
                        <div className="px-4 py-2 rounded-lg bg-slate-100 border border-primary/20">
                            <p className="text-sm text-slate-600">
                                Você tem: <span className="font-bold text-primary">{connectionsUsed}</span>
                                <span className="text-slate-600">/{connectionsMax === 999 ? '∞' : connectionsMax}</span>
                                <span className="ml-1 text-xs text-slate-500">({PLAN_LIMITS[userPlan]?.label || 'Recruta'})</span>
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmModal(false)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Não
                        </Button>
                        <Button
                            onClick={confirmSendConnection}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Sim, Enviar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Sucesso */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md bg-white border-green-500/20 shadow-2xl">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-full bg-green-500/10">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-black uppercase tracking-wide text-green-500">
                            Convite Enviado!
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 mt-2">
                            <span className="font-bold text-slate-800">{targetUserName}</span> receberá uma notificação sobre seu convite de Elo.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex sm:justify-center mt-4">
                        <Button
                            onClick={() => setShowSuccessModal(false)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Remover Elo */}
            <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
                <DialogContent className="sm:max-w-md bg-white border-red-500/20 shadow-2xl">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-full bg-red-500/10">
                                <Unlink className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-black uppercase tracking-wide text-slate-800">
                            Deseja Romper o Elo?
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 mt-2">
                            Tem certeza que deseja remover o Elo com <span className="font-bold text-slate-800">{targetUserName}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex gap-2 sm:justify-center mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowRemoveModal(false)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Não
                        </Button>
                        <Button
                            onClick={() => {
                                removeConnection()
                                setShowRemoveModal(false)
                            }}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Unlink className="w-4 h-4 mr-2" />
                            )}
                            Sim, Romper
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
