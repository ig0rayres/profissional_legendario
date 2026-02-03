'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Link2, Loader2, Check, X, UserPlus, Clock, CheckCircle2, XCircle, Unlink, Trophy } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { awardPoints, awardBadge, checkEloPointsAlreadyAwarded } from '@/lib/api/gamification'
import { getActionPoints } from '@/lib/services/point-actions-service'

interface ConnectionButtonProps {
    targetUserId: string
    targetUserName: string
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

        // Buscar todas as conexões entre os dois usuários (exceto rejeitadas sobre novas)
        const { data: connections, error } = await supabase
            .from('user_connections')
            .select('status, requester_id, addressee_id')
            .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
            .neq('status', 'rejected') // Ignorar rejeitadas
            .order('created_at', { ascending: false })

        console.log('[ConnectionButton] Connection result:', { connections, error })

        if (connections && connections.length > 0) {
            // Priorizar conexão aceita
            const accepted = connections.find(c => c.status === 'accepted')
            const pending = connections.find(c => c.status === 'pending')

            if (accepted) {
                console.log('[ConnectionButton] Status: ACCEPTED (ambos são amigos)')
                setStatus('accepted')
            } else if (pending) {
                const isSender = pending.requester_id === user.id
                console.log('[ConnectionButton] Status: PENDING, isSender:', isSender)
                setStatus(isSender ? 'sent' : 'pending')
            }
        } else {
            console.log('[ConnectionButton] No active connection found')
        }
    }

    async function checkLimits() {
        if (!user) return

        try {
            // Buscar plano do usuário
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('plan_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            const planId = subscription?.plan_id || 'recruta'
            setUserPlan(planId)

            // BUSCAR DE PLAN_CONFIG (fonte única)
            const { data: planConfig } = await supabase
                .from('plan_config')
                .select('max_elos')
                .eq('tier', planId)
                .single()

            const maxElos = planConfig?.max_elos === -1 ? 999 : (planConfig?.max_elos || 10)
            setConnectionsMax(maxElos)

            // Contar conexões existentes
            const { count } = await supabase
                .from('user_connections')
                .select('*', { count: 'exact', head: true })
                .eq('requester_id', user.id)
                .in('status', ['pending', 'accepted'])

            const used = count || 0
            setConnectionsUsed(used)
            setCanAdd(used < maxElos)
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

                // 🎮 GAMIFICAÇÃO: +10 XP por ENVIAR convite de elo
                console.log('[ConnectionButton] Gamificação: Enviou convite de elo, adicionando XP...')
                try {
                    // Verificar se já recebeu pontos por este elo (anti-farming)
                    const alreadyAwarded = await checkEloPointsAlreadyAwarded(user.id, targetUserId, 'elo_sent')

                    if (!alreadyAwarded) {
                        const points = await getActionPoints('elo_sent')
                        const result = await awardPoints(
                            user.id,
                            points,
                            'elo_sent',
                            `Enviou convite de elo para ${targetUserName}`,
                            { target_user_id: targetUserId } // Para verificação de duplicação
                        )
                        console.log('[ConnectionButton] awardPoints (envio) resultado:', result)
                    } else {
                        console.log('[ConnectionButton] Pontos de envio já creditados para este par de usuários')
                    }
                } catch (gamifError) {
                    console.error('[ConnectionButton] Erro de gamificação (envio):', gamifError)
                }

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

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[ConnectionButton] 🎯 respondConnection CHAMADA')
        console.log('[ConnectionButton] Accept:', accept)
        console.log('[ConnectionButton] User:', user.id)
        console.log('[ConnectionButton] Target:', targetUserId)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

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

            // 🎮 GAMIFICAÇÃO: +5 XP por aceitar elo
            if (accept) {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                console.log('[ConnectionButton] 🎮 INICIANDO GAMIFICAÇÃO DE ACEITE')
                console.log('[ConnectionButton] User ID:', user.id)
                console.log('[ConnectionButton] Target User ID:', targetUserId)
                console.log('[ConnectionButton] Target User Name:', targetUserName)
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

                try {
                    // Verificar se já recebeu pontos por este elo (anti-farming)
                    console.log('[ConnectionButton] 🔍 STEP 1: Verificando anti-farming...')
                    const alreadyAwarded = await checkEloPointsAlreadyAwarded(user.id, targetUserId, 'elo_accepted')
                    console.log('[ConnectionButton] ✓ Anti-farming result:', alreadyAwarded)

                    if (!alreadyAwarded) {
                        console.log('[ConnectionButton] ✅ Pontos não foram creditados antes, prosseguindo...')

                        // Adicionar pontos ao usuário que aceitou
                        console.log('[ConnectionButton] 🔍 STEP 2: Buscando pontos da ação...')
                        const points = await getActionPoints('elo_accepted')
                        console.log('[ConnectionButton] ✓ Pontos obtidos:', points)

                        console.log('[ConnectionButton] 🔍 STEP 3: Chamando API awardPoints...')
                        console.log('[ConnectionButton]    - userId:', user.id)
                        console.log('[ConnectionButton]    - points:', points)
                        console.log('[ConnectionButton]    - actionType: elo_accepted')
                        console.log('[ConnectionButton]    - description:', `Aceitou elo com ${targetUserName}`)

                        const result = await awardPoints(
                            user.id,
                            points,
                            'elo_accepted',
                            `Aceitou elo com ${targetUserName}`,
                            { target_user_id: targetUserId } // Para verificação de duplicação
                        )
                        console.log('[ConnectionButton] ✓ awardPoints resultado:', result)

                        // Verificar se é o primeiro elo (medalha "presente")
                        console.log('[ConnectionButton] 🔍 STEP 4: Verificando se é primeiro elo...')
                        const { count } = await supabase
                            .from('user_connections')
                            .select('*', { count: 'exact', head: true })
                            .eq('addressee_id', user.id)
                            .eq('status', 'accepted')

                        console.log('[ConnectionButton] ✓ Total de elos aceitos:', count)

                        if (count === 1) {
                            console.log('[ConnectionButton] 🏅 É o primeiro elo! Concedendo medalha "Presente"...')
                            await awardBadge(user.id, 'presente')
                            console.log('[ConnectionButton] ✓ Medalha "Presente" concedida!')
                        } else {
                            console.log('[ConnectionButton] ℹ️ Não é o primeiro elo (total:', count, ')')
                        }

                        console.log('[ConnectionButton] ✅ GAMIFICAÇÃO CONCLUÍDA COM SUCESSO')
                    } else {
                        console.log('[ConnectionButton] ⚠️ PONTOS JÁ CREDITADOS - pulando gamificação')
                        console.log('[ConnectionButton] Anti-farming bloqueou duplicação para:', { userId: user.id, targetUserId, action: 'elo_accepted' })
                    }
                } catch (gamifError) {
                    console.error('[ConnectionButton] ❌ ERRO DE GAMIFICAÇÃO:', gamifError)
                    console.error('[ConnectionButton] Stack:', gamifError instanceof Error ? gamifError.stack : 'N/A')
                }

                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

                // Mostrar modal de sucesso
                setShowSuccessModal(true)
            }
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
