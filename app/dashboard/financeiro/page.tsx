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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Copy, Share2, Users, Wallet, Clock, CheckCircle, DollarSign,
    TrendingUp, Loader2, Link2, AlertCircle, Calendar, ArrowRight, XCircle, Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/api/financial'
import {
    getReferralConfig,
    generateReferralLink
} from '@/lib/services/referral-service'

interface Commission {
    id: string
    payment_amount: number
    commission_amount: number
    status: string
    payment_date: string
    release_date: string | null
    available_at: string | null
}

interface ReferralData {
    id: string
    referred_id: string
    status: string
    created_at: string
    referred: {
        full_name: string
        avatar_url: string | null
    }
    commission: Commission | null
}

interface WithdrawalRequest {
    id: string
    amount: number
    status: string
    created_at: string
    pix_key: string
    processed_at: string | null
}

type PeriodFilter = '15days' | '30days' | 'custom' | 'all'

export default function FinanceiroPage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [config, setConfig] = useState<any>(null)
    const [referrals, setReferrals] = useState<ReferralData[]>([])
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])

    // Filtros
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0])

    // Form de saque
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [pixKey, setPixKey] = useState('')
    const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf')
    const [beneficiaryName, setBeneficiaryName] = useState('')
    const [beneficiaryCPF, setBeneficiaryCPF] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Carregar perfil
            const { data: profileData } = await supabase
                .from('profiles')
                .select('id, full_name, slug, avatar_url')
                .eq('id', user.id)
                .single()

            setProfile(profileData)

            // Carregar configuração
            const configData = await getReferralConfig(true)
            setConfig(configData)

            // Carregar indicações com comissões
            const { data: referralsData } = await supabase
                .from('referrals')
                .select(`
                    *,
                    referred:profiles!referred_id(full_name, avatar_url)
                `)
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false })

            if (referralsData) {
                // Buscar comissões para cada referral
                const enrichedReferrals = await Promise.all(
                    referralsData.map(async (referral) => {
                        const { data: commissionData } = await supabase
                            .from('referral_commissions')
                            .select('*')
                            .eq('referral_id', referral.id)
                            .single()

                        return {
                            ...referral,
                            commission: commissionData || null
                        }
                    })
                )
                setReferrals(enrichedReferrals)
            }

            // Carregar solicitações de saque
            const { data: withdrawalsData } = await supabase
                .from('withdrawal_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setWithdrawals(withdrawalsData || [])

        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDateRange = (): { start: Date; end: Date } => {
        const end = new Date()
        end.setHours(23, 59, 59, 999)

        let start = new Date()

        switch (periodFilter) {
            case '15days':
                start.setDate(start.getDate() - 15)
                break
            case '30days':
                start.setDate(start.getDate() - 30)
                break
            case 'custom':
                if (customStartDate) {
                    start = new Date(customStartDate)
                    start.setHours(0, 0, 0, 0)
                }
                if (customEndDate) {
                    end.setTime(new Date(customEndDate).getTime())
                    end.setHours(23, 59, 59, 999)
                }
                break
            case 'all':
            default:
                start = new Date(0) // desde sempre
        }

        return { start, end }
    }

    const filteredReferrals = referrals.filter(referral => {
        const { start, end } = getDateRange()
        const createdAt = new Date(referral.created_at)
        return createdAt >= start && createdAt <= end
    })

    const filteredWithdrawals = withdrawals.filter(withdrawal => {
        const { start, end } = getDateRange()
        const createdAt = new Date(withdrawal.created_at)
        return createdAt >= start && createdAt <= end
    })

    // Calcular totalizadores do período
    const periodStats = {
        // Comissões disponíveis para resgatar
        available: filteredReferrals
            .filter(r => r.commission?.status === 'available')
            .reduce((sum, r) => sum + (r.commission?.commission_amount || 0), 0),

        // Comissões pendentes (ainda não liberadas)
        pending: filteredReferrals
            .filter(r => r.commission?.status === 'pending')
            .reduce((sum, r) => sum + (r.commission?.commission_amount || 0), 0),

        // Comissões já resgatadas
        withdrawn: filteredReferrals
            .filter(r => r.commission?.status === 'withdrawn')
            .reduce((sum, r) => sum + (r.commission?.commission_amount || 0), 0),

        // Total de saques pagos
        paidWithdrawals: filteredWithdrawals
            .filter(w => w.status === 'paid')
            .reduce((sum, w) => sum + w.amount, 0),

        // Total de saques pendentes
        pendingWithdrawals: filteredWithdrawals
            .filter(w => ['pending', 'approved'].includes(w.status))
            .reduce((sum, w) => sum + w.amount, 0),

        // Total de comissões geradas no período
        totalCommissions: filteredReferrals
            .filter(r => r.commission)
            .reduce((sum, r) => sum + (r.commission?.commission_amount || 0), 0),

        // Total de indicações no período
        totalReferrals: filteredReferrals.length
    }

    const copyLink = () => {
        if (!profile?.slug) return
        const link = generateReferralLink(profile.slug)
        navigator.clipboard.writeText(link)
        toast.success('Link copiado!', {
            description: 'Compartilhe com seus contatos'
        })
    }

    const shareWhatsApp = () => {
        if (!profile?.slug) return
        const link = generateReferralLink(profile.slug)
        const text = `🎯 Venha fazer parte do Rota Business Club! Use meu link: ${link}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    const handleWithdrawal = async () => {
        if (!profile?.id) return

        const amount = parseFloat(withdrawAmount)
        if (!amount || !pixKey) {
            toast.error('Preencha todos os campos')
            return
        }

        if (amount > periodStats.available) {
            toast.error('Valor maior que o saldo disponível')
            return
        }

        if (amount < (config?.min_withdrawal_amount || 250)) {
            toast.error('Valor menor que o mínimo permitido')
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('withdrawal_requests')
                .insert({
                    user_id: profile.id,
                    amount,
                    pix_key: pixKey,
                    pix_key_type: pixKeyType,
                    beneficiary_name: beneficiaryName,
                    beneficiary_cpf: beneficiaryCPF,
                    status: 'pending'
                })

            if (error) throw error

            toast.success('Saque solicitado!', {
                description: `Pagamento será processado todo dia ${config?.payment_day || 10}`
            })
            setDialogOpen(false)
            setWithdrawAmount('')
            setPixKey('')
            setBeneficiaryName('')
            setBeneficiaryCPF('')
            loadData()
        } catch (error) {
            console.error('Error requesting withdrawal:', error)
            toast.error('Erro ao solicitar saque')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getCommissionStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
            case 'available':
                return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Disponível</Badge>
            case 'withdrawn':
                return <Badge variant="outline" className="border-blue-500 text-blue-500"><Wallet className="w-3 h-3 mr-1" />Resgatada</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getWithdrawalStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
            case 'approved':
                return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>
            case 'paid':
                return <Badge variant="outline" className="border-green-500 text-green-500"><DollarSign className="w-3 h-3 mr-1" />Pago</Badge>
            case 'rejected':
                return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="w-3 h-3 mr-1" />Recusado</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getDaysRemaining = (releaseDate: string | null) => {
        if (!releaseDate) return null
        const release = new Date(releaseDate)
        const now = new Date()
        const diff = Math.ceil((release.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 0
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const referralLink = profile?.slug ? generateReferralLink(profile.slug) : ''
    const hasPendingWithdrawal = withdrawals.some(w => ['pending', 'approved'].includes(w.status))
    const canWithdraw = periodStats.available >= (config?.min_withdrawal_amount || 250) && !hasPendingWithdrawal

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
                    <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Financeiro</h1>
                    <p className="text-muted-foreground">Gerencie suas indicações e comissões</p>
                </div>
            </div>

            {/* Link de Indicação */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Seu Link de Indicação
                    </CardTitle>
                    <CardDescription>
                        Compartilhe e ganhe {config?.commission_percentage || 100}% da primeira mensalidade de cada indicado
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            value={referralLink}
                            readOnly
                            className="bg-background/50 font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={copyLink}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={copyLink} className="flex-1">
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Link
                        </Button>
                        <Button onClick={shareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Share2 className="w-4 h-4 mr-2" />
                            WhatsApp
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Filtros de Período */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtrar por Período
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label>Período</Label>
                            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os registros</SelectItem>
                                    <SelectItem value="15days">Últimos 15 dias</SelectItem>
                                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {periodFilter === 'custom' && (
                            <>
                                <div className="flex-1">
                                    <Label>Data Inicial</Label>
                                    <Input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label>Data Final</Label>
                                    <Input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Cards de Saldo - Período Selecionado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-500/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-green-500 mb-2">
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-medium">Disponível</span>
                        </div>
                        <p className="text-3xl font-bold text-green-500">
                            {formatCurrency(periodStats.available)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Para resgatar agora
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-500/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-yellow-500 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-medium">Pendente</span>
                        </div>
                        <p className="text-3xl font-bold text-yellow-500">
                            {formatCurrency(periodStats.pending)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Aguardando liberação
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-blue-500/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-blue-500 mb-2">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-sm font-medium">Resgatado</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-500">
                            {formatCurrency(periodStats.withdrawn)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Já sacado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-primary/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-medium">Total</span>
                        </div>
                        <p className="text-3xl font-bold text-primary">
                            {formatCurrency(periodStats.totalCommissions)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {periodStats.totalReferrals} indicações
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Botão de Saque */}
            <Card className="border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                Solicitar Saque
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Mínimo: <span className="font-medium">{formatCurrency(config?.min_withdrawal_amount || 250)}</span>
                                {' • '}Pagamento: <span className="font-medium">Todo dia {config?.payment_day || 10}</span>
                            </p>
                        </div>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    disabled={!canWithdraw}
                                    className="min-w-[200px]"
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Solicitar Saque
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Solicitar Saque</DialogTitle>
                                    <DialogDescription>
                                        Informe o valor e sua chave PIX para receber o pagamento.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    {/* Aviso sobre data de pagamento */}
                                    <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Data de Pagamento</p>
                                            <p className="text-sm text-muted-foreground">
                                                Os pagamentos são processados todo <strong>dia {config?.payment_day || 10}</strong> de cada mês.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Valor do Saque</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">R$</span>
                                            <Input
                                                type="number"
                                                placeholder="0,00"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Disponível: {formatCurrency(periodStats.available)} •
                                            Mínimo: {formatCurrency(config?.min_withdrawal_amount || 250)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipo de Chave PIX</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['cpf', 'email', 'phone', 'random'] as const).map((type) => (
                                                <Button
                                                    key={type}
                                                    type="button"
                                                    variant={pixKeyType === type ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setPixKeyType(type)}
                                                >
                                                    {type === 'cpf' && 'CPF'}
                                                    {type === 'email' && 'Email'}
                                                    {type === 'phone' && 'Celular'}
                                                    {type === 'random' && 'Aleatória'}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Chave PIX</Label>
                                        <Input
                                            placeholder={
                                                pixKeyType === 'cpf' ? '000.000.000-00' :
                                                    pixKeyType === 'email' ? 'seu@email.com' :
                                                        pixKeyType === 'phone' ? '(00) 00000-0000' :
                                                            'Chave aleatória'
                                            }
                                            value={pixKey}
                                            onChange={(e) => setPixKey(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nome do Favorecido</Label>
                                        <Input
                                            placeholder="Nome completo conforme cadastro"
                                            value={beneficiaryName}
                                            onChange={(e) => setBeneficiaryName(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>CPF do Favorecido</Label>
                                        <Input
                                            placeholder="000.000.000-00"
                                            value={beneficiaryCPF}
                                            onChange={(e) => setBeneficiaryCPF(e.target.value)}
                                        />
                                    </div>

                                    {/* Aviso sobre titularidade */}
                                    <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm text-amber-600">Atenção - Mesma Titularidade</p>
                                            <p className="text-sm text-muted-foreground">
                                                O CPF e nome do favorecido devem ser <strong>idênticos</strong> aos cadastrados em sua conta. Não é possível realizar transferências para terceiros.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleWithdrawal} disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <DollarSign className="w-4 h-4 mr-2" />
                                        )}
                                        Confirmar Saque
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {hasPendingWithdrawal && (
                        <div className="mt-4 flex items-center gap-2 text-yellow-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Você já possui uma solicitação de saque pendente
                        </div>
                    )}

                    {!canWithdraw && !hasPendingWithdrawal && (
                        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Saldo insuficiente. Mínimo: {formatCurrency(config?.min_withdrawal_amount || 250)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Histórico de Saques */}
            {filteredWithdrawals.length > 0 && (
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            Histórico de Saques ({filteredWithdrawals.length})
                        </CardTitle>
                        <CardDescription>
                            Solicitações de saque no período selecionado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredWithdrawals.map((withdrawal) => (
                                <div
                                    key={withdrawal.id}
                                    className="flex items-center justify-between p-4 bg-card border border-primary/10 rounded-lg"
                                >
                                    <div>
                                        <p className="font-bold text-lg">{formatCurrency(withdrawal.amount)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Solicitado em {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PIX: {withdrawal.pix_key}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {getWithdrawalStatusBadge(withdrawal.status)}
                                        {withdrawal.processed_at && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(withdrawal.processed_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Indicações */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Suas Indicações ({filteredReferrals.length})
                    </CardTitle>
                    <CardDescription>
                        Indicações no período selecionado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredReferrals.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium">Nenhuma indicação no período</p>
                            <p className="text-sm text-muted-foreground">
                                Ajuste o filtro ou compartilhe seu link para começar a ganhar comissões!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReferrals.map((item) => {
                                const daysRemaining = item.commission?.release_date
                                    ? getDaysRemaining(item.commission.release_date)
                                    : null

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 bg-card border border-primary/10 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={item.referred.avatar_url || ''} />
                                                <AvatarFallback className="bg-primary/20 text-primary">
                                                    {item.referred.full_name?.charAt(0) || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{item.referred.full_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {item.commission ? (
                                                <>
                                                    <p className="font-bold text-primary">
                                                        {formatCurrency(item.commission.commission_amount)}
                                                    </p>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        {getCommissionStatusBadge(item.commission.status)}
                                                        {item.commission.status === 'pending' && daysRemaining !== null && (
                                                            <span className="text-xs text-yellow-500">
                                                                {daysRemaining}d
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Aguardando pagamento
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
