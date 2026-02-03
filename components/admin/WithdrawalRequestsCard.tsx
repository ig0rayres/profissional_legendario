'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DollarSign, Upload, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/api/financial'

interface WithdrawalRequest {
    id: string
    user_id: string
    amount: number
    pix_key: string
    pix_key_type: string
    beneficiary_name: string | null
    beneficiary_cpf: string | null
    status: string
    created_at: string
    user: {
        full_name: string
        avatar_url: string | null
        email: string
    }
}

export function WithdrawalRequestsCard() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState<string | null>(null)
    const [proofUrl, setProofUrl] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null)
    const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
    const [userCommissions, setUserCommissions] = useState<Record<string, any[]>>({})

    const supabase = createClient()

    const loadRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .select(`
                    *,
                    user:profiles!user_id(full_name, avatar_url, email)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests(data || [])
        } catch (error) {
            console.error('[WithdrawalRequests] Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadUserCommissions = async (userId: string) => {
        if (userCommissions[userId]) return // Já carregou

        try {
            const { data, error } = await supabase
                .from('referral_commissions')
                .select(`
                    *,
                    referral:referrals!referral_id(
                        referred:profiles!referred_id(
                            full_name,
                            created_at,
                            last_payment_at
                        )
                    )
                `)
                .eq('referrer_id', userId)
                .eq('status', 'available')
                .order('created_at', { ascending: false })

            if (error) throw error

            setUserCommissions(prev => ({
                ...prev,
                [userId]: data || []
            }))
        } catch (error) {
            console.error('[WithdrawalRequests] Error loading commissions:', error)
        }
    }

    const toggleExpand = async (requestId: string, userId: string) => {
        const newExpanded = new Set(expandedRequests)
        if (newExpanded.has(requestId)) {
            newExpanded.delete(requestId)
        } else {
            newExpanded.add(requestId)
            await loadUserCommissions(userId)
        }
        setExpandedRequests(newExpanded)
    }

    const handleApproveWithReceipt = async () => {
        if (!selectedRequest || !proofUrl.trim()) {
            toast.error('Por favor, insira a URL do comprovante')
            return
        }

        setUploading(selectedRequest.id)
        try {
            // 1. Atualizar status do saque
            const { error: withdrawalError } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'paid',
                    receipt_url: proofUrl,
                    processed_at: new Date().toISOString()
                })
                .eq('id', selectedRequest.id)

            if (withdrawalError) throw withdrawalError

            // 2. Dar baixa nas comissões disponíveis do usuário
            // Atualizar TODAS as comissões 'available' do usuário para 'paid'
            const { data: updatedCommissions, error: commissionError } = await supabase
                .from('referral_commissions')
                .update({
                    status: 'paid',
                    payment_proof_url: proofUrl,
                    paid_at: new Date().toISOString()
                })
                .eq('referrer_id', selectedRequest.user_id)
                .eq('status', 'available')
                .select()

            if (commissionError) {
                console.error('[WithdrawalRequests] Error updating commissions:', commissionError)
                // Não bloquear o fluxo por erro nas comissões
                toast.warning('Saque aprovado, mas houve erro ao atualizar comissões', {
                    description: commissionError.message
                })
            } else {
                console.log(`[WithdrawalRequests] ${updatedCommissions?.length || 0} comissões atualizadas para 'paid'`)
            }

            // 3. Notificar usuário do pagamento
            try {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: selectedRequest.user_id,
                        type: 'withdrawal_approved',
                        title: '💰 Saque Aprovado!',
                        body: `Seu saque de ${formatCurrency(selectedRequest.amount)} foi processado e pago${updatedCommissions?.length ? ` (${updatedCommissions.length} ${updatedCommissions.length === 1 ? 'comissão baixada' : 'comissões baixadas'})` : ''}.`,
                        priority: 'high',
                        action_url: '/dashboard/financeiro',
                        metadata: {
                            withdrawal_id: selectedRequest.id,
                            amount: selectedRequest.amount,
                            commissions_count: updatedCommissions?.length || 0
                        }
                    })
                console.log('[WithdrawalRequests] Notification sent to user:', selectedRequest.user_id)
            } catch (notifError) {
                console.error('[WithdrawalRequests] Error sending notification:', notifError)
            }

            // 4. Gamificação: Pontos por comissões pagas (configurado no admin)
            if (updatedCommissions && updatedCommissions.length > 0) {
                try {
                    const { awardPoints } = await import('@/lib/api/gamification')
                    const { getActionPoints } = await import('@/lib/services/point-actions-service')

                    // Buscar pontos configurados no admin (não hardcode!)
                    const pointsPerSale = await getActionPoints('referral_commission_paid')
                    const totalPoints = updatedCommissions.length * pointsPerSale

                    await awardPoints(
                        selectedRequest.user_id,
                        totalPoints,
                        'referral_commission_paid',
                        `Recebeu ${updatedCommissions.length} ${updatedCommissions.length === 1 ? 'comissão' : 'comissões'}`,
                        { withdrawal_id: selectedRequest.id }
                    )
                    console.log(`[WithdrawalRequests] Awarded ${totalPoints} XP (${pointsPerSale}pts x ${updatedCommissions.length}) for sales`)
                } catch (gamifError) {
                    console.error('[WithdrawalRequests] Error awarding points:', gamifError)
                }
            }

            toast.success('Pagamento confirmado!', {
                description: `Saque de ${formatCurrency(selectedRequest.amount)} marcado como pago${updatedCommissions?.length ? ` (${updatedCommissions.length} comissões baixadas)` : ''}`
            })

            setDialogOpen(false)
            setProofUrl('')
            setSelectedRequest(null)
            loadRequests()
        } catch (error: any) {
            console.error('[WithdrawalRequests] Error approving:', error)
            toast.error('Erro ao confirmar pagamento', {
                description: error.message
            })
        } finally {
            setUploading(null)
        }
    }

    const handleReject = async (requestId: string) => {
        if (!confirm('Deseja realmente rejeitar esta solicitação?')) return

        try {
            const { error } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'rejected',
                    processed_at: new Date().toISOString(),
                    rejection_reason: 'Rejeitado pelo admin'
                })
                .eq('id', requestId)

            if (error) throw error

            toast.success('Solicitação rejeitada')
            loadRequests()
        } catch (error: any) {
            toast.error('Erro ao rejeitar', { description: error.message })
        }
    }

    useEffect(() => {
        loadRequests()
    }, [])

    if (loading) {
        return (
            <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Carregando solicitações...</p>
                </CardContent>
            </Card>
        )
    }

    if (requests.length === 0) return null

    return (
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                        <CardTitle className="text-lg">Solicitações de Saque Pendentes</CardTitle>
                        <Badge variant="outline" className="bg-amber-600 text-white border-amber-600">
                            {requests.length}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {requests.map((request) => {
                    const isExpanded = expandedRequests.has(request.id)
                    const commissions = userCommissions[request.user_id] || []

                    return (
                        <div key={request.id} className="space-y-0">
                            {/* Card principal da solicitação */}
                            <div className="flex items-center justify-between p-4 bg-card rounded-t-lg border border-border hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={request.user.avatar_url || ''} />
                                        <AvatarFallback className="bg-primary/20 text-primary">
                                            {request.user.full_name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{request.user.full_name}</p>

                                        {/* Dados do Favorecido */}
                                        {request.beneficiary_name && (
                                            <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/10">
                                                <div className="grid grid-cols-1 gap-1">
                                                    <div>
                                                        <span className="text-xs font-semibold text-primary">Nome:</span>
                                                        <span className="text-xs ml-1">{request.beneficiary_name}</span>
                                                    </div>
                                                    {request.beneficiary_cpf && (
                                                        <div>
                                                            <span className="text-xs font-semibold text-primary">CPF:</span>
                                                            <span className="text-xs ml-1">{request.beneficiary_cpf}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-xs font-semibold text-primary">Chave:</span>
                                                        <span className="text-xs ml-1 truncate">{request.pix_key}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">({request.pix_key_type})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fallback se não tiver dados de favorecido */}
                                        {!request.beneficiary_name && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span>{request.pix_key_type}</span>
                                                <span>•</span>
                                                <span className="truncate">{request.pix_key}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-lg text-green-600">
                                            {formatCurrency(request.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <Dialog open={dialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                                        setDialogOpen(open)
                                        if (!open) {
                                            setSelectedRequest(null)
                                            setProofUrl('')
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedRequest(request)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Upload className="w-4 h-4 mr-1" />
                                                Comprov.
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Confirmar Pagamento</DialogTitle>
                                                <DialogDescription>
                                                    Insira a URL do comprovante de pagamento para marcar como pago
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Solicitante</Label>
                                                    <p className="text-sm font-medium">{request.user.full_name}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Valor</Label>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {formatCurrency(request.amount)}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Chave PIX</Label>
                                                    <p className="text-sm">{request.pix_key} ({request.pix_key_type})</p>
                                                </div>

                                                {request.beneficiary_name && (
                                                    <div className="space-y-2">
                                                        <Label>Favorecido</Label>
                                                        <p className="text-sm">{request.beneficiary_name}</p>
                                                        {request.beneficiary_cpf && (
                                                            <p className="text-xs text-muted-foreground">CPF: {request.beneficiary_cpf}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label>URL do Comprovante</Label>
                                                    <Input
                                                        placeholder="https://exemplo.com/comprovante.pdf"
                                                        value={proofUrl}
                                                        onChange={(e) => setProofUrl(e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Cole aqui o link do comprovante de transferência PIX
                                                    </p>
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button
                                                    onClick={handleApproveWithReceipt}
                                                    disabled={!!uploading || !proofUrl.trim()}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {uploading ? 'Processando...' : 'Confirmar Pagamento'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReject(request.id)}
                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => toggleExpand(request.id, request.user_id)}
                                        className="text-xs"
                                    >
                                        {expandedRequests.has(request.id) ? (
                                            <>
                                                <ChevronUp className="w-4 h-4 mr-1" />
                                                Ocultar
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4 mr-1" />
                                                Detalhes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Seção expandível com comissões */}
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20 rounded-b-lg border border-t-0">
                                    <p className="text-xs font-semibold text-primary mb-3">Comissões Disponíveis:</p>
                                    {commissions.length > 0 ? (
                                        <div className="space-y-2">
                                            {/* Header da tabela */}
                                            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border/30 text-xs font-semibold text-muted-foreground">
                                                <span>Indicado</span>
                                                <span className="text-center">Data Cadastro</span>
                                                <span className="text-center">Últ. Pgto</span>
                                                <span className="text-right">Valor</span>
                                            </div>

                                            {/* Linhas de comissões */}
                                            {commissions.map((commission) => (
                                                <div key={commission.id} className="grid grid-cols-4 gap-2 py-2 px-2 bg-card rounded text-xs items-center">
                                                    <span className="text-muted-foreground truncate">
                                                        {commission.referral?.referred?.full_name || 'Indicação'}
                                                    </span>
                                                    <span className="text-center text-muted-foreground">
                                                        {commission.referral?.referred?.created_at
                                                            ? new Date(commission.referral.referred.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                                            : '-'
                                                        }
                                                    </span>
                                                    <span className="text-center text-muted-foreground">
                                                        {commission.referral?.referred?.last_payment_at
                                                            ? new Date(commission.referral.referred.last_payment_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                                            : '-'
                                                        }
                                                    </span>
                                                    <span className="font-semibold text-green-600 text-right">
                                                        {formatCurrency(commission.commission_amount)}
                                                    </span>
                                                </div>
                                            ))}

                                            {/* Total */}
                                            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/30 text-xs font-bold">
                                                <span className="col-span-3 text-right">Total Disponível:</span>
                                                <span className="text-green-600 text-right">
                                                    {formatCurrency(commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0))}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Carregando comissões...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card >
    )
}
