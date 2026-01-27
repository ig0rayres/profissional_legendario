'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Trophy, Crown, Medal, Award, Wallet, Loader2, Check, X,
    DollarSign, CreditCard, CheckCircle, Clock, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SeasonWinner {
    id: string
    season_id: string
    user_id: string
    position: number
    xp_earned: number
    prize_id: string | null
    prize_value: number
    prize_delivered: boolean
    pix_key: string | null
    pix_key_type: string | null
    payment_status: string
    paid_at: string | null
    created_at: string
    season?: { name: string }
    user?: { full_name: string, avatar_url: string | null, email: string }
    prize?: { title: string, description: string | null }
}

export function PrizePaymentManager() {
    const [loading, setLoading] = useState(true)
    const [winners, setWinners] = useState<SeasonWinner[]>([])
    const [selectedWinner, setSelectedWinner] = useState<SeasonWinner | null>(null)
    const [showPayDialog, setShowPayDialog] = useState(false)
    const [prizeValue, setPrizeValue] = useState('')
    const [pixKey, setPixKey] = useState('')
    const [pixKeyType, setPixKeyType] = useState('cpf')
    const [processing, setProcessing] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadWinners()
    }, [])

    const loadWinners = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('season_winners')
                .select(`
                    *,
                    season:seasons(name),
                    user:profiles!user_id(full_name, avatar_url, email),
                    prize:season_prizes!prize_id(title, description)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setWinners(data || [])
        } catch (error) {
            console.error('Error loading winners:', error)
            toast.error('Erro ao carregar vencedores')
        } finally {
            setLoading(false)
        }
    }

    const openPayDialog = (winner: SeasonWinner) => {
        setSelectedWinner(winner)
        setPrizeValue(winner.prize_value?.toString() || '')
        setPixKey(winner.pix_key || '')
        setPixKeyType(winner.pix_key_type || 'cpf')
        setShowPayDialog(true)
    }

    const savePrizeInfo = async () => {
        if (!selectedWinner) return

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('season_winners')
                .update({
                    prize_value: parseFloat(prizeValue) || 0,
                    pix_key: pixKey,
                    pix_key_type: pixKeyType
                })
                .eq('id', selectedWinner.id)

            if (error) throw error

            toast.success('Dados salvos!')
            setShowPayDialog(false)
            await loadWinners()
        } catch (error) {
            console.error('Error saving:', error)
            toast.error('Erro ao salvar')
        } finally {
            setProcessing(false)
        }
    }

    const markAsPaid = async (winnerId: string) => {
        setProcessing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('season_winners')
                .update({
                    payment_status: 'paid',
                    prize_delivered: true,
                    delivered_at: new Date().toISOString(),
                    paid_at: new Date().toISOString(),
                    paid_by: user?.id
                })
                .eq('id', winnerId)

            if (error) throw error

            // Notificar vencedor
            const winner = winners.find(w => w.id === winnerId)
            if (winner) {
                await supabase.from('notifications').insert({
                    user_id: winner.user_id,
                    type: 'prize_paid',
                    title: '💰 Prêmio Pago!',
                    body: `Seu prêmio de R$ ${winner.prize_value?.toFixed(2)} foi enviado via Pix!`,
                    metadata: { season_id: winner.season_id, position: winner.position }
                })
            }

            toast.success('Marcado como pago!')
            await loadWinners()
        } catch (error) {
            console.error('Error marking paid:', error)
            toast.error('Erro ao marcar como pago')
        } finally {
            setProcessing(false)
        }
    }

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown className="w-5 h-5 text-yellow-500" />
            case 2: return <Medal className="w-5 h-5 text-gray-400" />
            case 3: return <Award className="w-5 h-5 text-amber-600" />
            default: return <span>{position}º</span>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>
            case 'processing':
                return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />Processando</Badge>
            case 'pending':
            default:
                return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>
        }
    }

    const formatPixKey = (key: string | null, type: string | null) => {
        if (!key) return '-'
        if (type === 'cpf') {
            return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')
        }
        return key.length > 20 ? key.substring(0, 17) + '...' : key
    }

    // Estatísticas
    const totalPrizes = winners.reduce((acc, w) => acc + (w.prize_value || 0), 0)
    const paidPrizes = winners.filter(w => w.payment_status === 'paid').reduce((acc, w) => acc + (w.prize_value || 0), 0)
    const pendingPrizes = totalPrizes - paidPrizes

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-primary/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <Trophy className="w-4 h-4" />
                            <span className="text-xs">Vencedores</span>
                        </div>
                        <p className="text-2xl font-bold">{winners.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-green-500 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Prêmios Pagos</span>
                        </div>
                        <p className="text-2xl font-bold text-green-500">
                            R$ {paidPrizes.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-500/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">Pendentes</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-500">
                            R$ {pendingPrizes.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Vencedores */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Pagamento de Prêmios
                    </CardTitle>
                    <CardDescription>
                        Gerencie os pagamentos Pix para vencedores das temporadas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {winners.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum vencedor registrado ainda</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Posição</TableHead>
                                    <TableHead>Vencedor</TableHead>
                                    <TableHead>Temporada</TableHead>
                                    <TableHead>Prêmio</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Pix</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {winners.map((winner) => (
                                    <TableRow key={winner.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getPositionIcon(winner.position)}
                                                <span className="font-bold">{winner.position}º</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={winner.user?.avatar_url || ''} />
                                                    <AvatarFallback>{winner.user?.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{winner.user?.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{winner.user?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{winner.season?.name}</TableCell>
                                        <TableCell>{winner.prize?.title || '-'}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-primary">
                                                R$ {(winner.prize_value || 0).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono">
                                                {formatPixKey(winner.pix_key, winner.pix_key_type)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(winner.payment_status)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPayDialog(winner)}
                                                >
                                                    <CreditCard className="w-4 h-4 mr-1" />
                                                    Editar
                                                </Button>
                                                {winner.payment_status !== 'paid' && winner.pix_key && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => markAsPaid(winner.id)}
                                                        disabled={processing}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Paguei
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de Edição */}
            <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Dados de Pagamento
                        </DialogTitle>
                        <DialogDescription>
                            Configure o valor e chave Pix para o vencedor
                        </DialogDescription>
                    </DialogHeader>

                    {selectedWinner && (
                        <div className="space-y-4 py-4">
                            {/* Info do vencedor */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                {getPositionIcon(selectedWinner.position)}
                                <div>
                                    <p className="font-medium">{selectedWinner.user?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedWinner.season?.name}</p>
                                </div>
                            </div>

                            {/* Valor do prêmio */}
                            <div className="space-y-2">
                                <Label>Valor do Prêmio (R$)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={prizeValue}
                                        onChange={(e) => setPrizeValue(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Tipo de chave Pix */}
                            <div className="space-y-2">
                                <Label>Tipo da Chave Pix</Label>
                                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cpf">CPF</SelectItem>
                                        <SelectItem value="email">E-mail</SelectItem>
                                        <SelectItem value="phone">Telefone</SelectItem>
                                        <SelectItem value="random">Chave Aleatória</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Chave Pix */}
                            <div className="space-y-2">
                                <Label>Chave Pix</Label>
                                <Input
                                    placeholder={
                                        pixKeyType === 'cpf' ? '000.000.000-00' :
                                            pixKeyType === 'email' ? 'email@exemplo.com' :
                                                pixKeyType === 'phone' ? '+55 11 99999-9999' :
                                                    'Chave aleatória'
                                    }
                                    value={pixKey}
                                    onChange={(e) => setPixKey(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPayDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={savePrizeInfo} disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
