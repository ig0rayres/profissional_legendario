'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Save, Settings, Users, Wallet, Clock, CheckCircle, XCircle,
    AlertCircle, DollarSign, Link2, TrendingUp, Loader2, RefreshCw,
    Eye, Check, X, ArrowRight, UserPlus, Receipt
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/api/financial'
import { clearReferralConfigCache } from '@/lib/services/referral-service'

interface ReferralConfig {
    id: string
    commission_percentage: number
    commission_type: string
    fixed_commission_amount: number | null
    release_days: number
    require_referred_active: boolean
    min_withdrawal_amount: number
    is_active: boolean
}

interface WithdrawalRequest {
    id: string
    user_id: string
    amount: number
    pix_key: string
    pix_key_type: string
    status: string
    created_at: string
    user?: { full_name: string, avatar_url: string | null }
}

interface Referral {
    id: string
    referrer_id: string
    referred_id: string
    status: string
    referral_code: string | null
    created_at: string
    activated_at: string | null
    referrer?: { full_name: string, avatar_url: string | null, slug: string }
    referred?: { full_name: string, avatar_url: string | null }
}

interface Commission {
    id: string
    referrer_id: string
    referred_id: string
    payment_amount: number
    commission_amount: number
    commission_percentage: number
    status: string
    payment_date: string
    release_date: string | null
    available_at: string | null
    referrer?: { full_name: string, avatar_url: string | null }
    referred?: { full_name: string, avatar_url: string | null }
}

interface CommissionStats {
    total_referrals: number
    total_commissions: number
    pending_commissions: number
    available_commissions: number
    total_amount: number
    pending_amount: number
    available_amount: number
}

export function ReferralManager() {
    const [config, setConfig] = useState<ReferralConfig | null>(null)
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [commissions, setCommissions] = useState<Commission[]>([])
    const [stats, setStats] = useState<CommissionStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('config')
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                loadConfig(),
                loadWithdrawals(),
                loadReferrals(),
                loadCommissions(),
                loadStats()
            ])
        } finally {
            setLoading(false)
        }
    }

    const loadConfig = async () => {
        const { data, error } = await supabase
            .from('referral_config')
            .select('*')
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error loading config:', error)
        }
        setConfig(data)
    }

    const loadWithdrawals = async () => {
        const { data, error } = await supabase
            .from('withdrawal_requests')
            .select(`
                *,
                user:profiles!user_id(full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error loading withdrawals:', error)
            return
        }
        setWithdrawals(data || [])
    }

    const loadReferrals = async () => {
        const { data, error } = await supabase
            .from('referrals')
            .select(`
                *,
                referrer:profiles!referrer_id(full_name, avatar_url, slug),
                referred:profiles!referred_id(full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Error loading referrals:', error)
            return
        }
        setReferrals(data || [])
    }

    const loadCommissions = async () => {
        const { data, error } = await supabase
            .from('referral_commissions')
            .select(`
                *,
                referrer:profiles!referrer_id(full_name, avatar_url),
                referred:profiles!referred_id(full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Error loading commissions:', error)
            return
        }
        setCommissions(data || [])
    }

    const loadStats = async () => {
        const { data: commissionsData } = await supabase
            .from('referral_commissions')
            .select('status, commission_amount')

        if (commissionsData) {
            const stats: CommissionStats = {
                total_referrals: 0,
                total_commissions: commissionsData.length,
                pending_commissions: commissionsData.filter(c => c.status === 'pending').length,
                available_commissions: commissionsData.filter(c => c.status === 'available').length,
                total_amount: commissionsData.reduce((sum, c) => sum + Number(c.commission_amount), 0),
                pending_amount: commissionsData.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.commission_amount), 0),
                available_amount: commissionsData.filter(c => c.status === 'available').reduce((sum, c) => sum + Number(c.commission_amount), 0)
            }

            const { count } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })

            stats.total_referrals = count || 0
            setStats(stats)
        }
    }

    const saveConfig = async () => {
        if (!config) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('referral_config')
                .upsert({
                    ...config,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            clearReferralConfigCache()

            toast.success('Configurações salvas!', {
                description: 'As alterações foram aplicadas em toda a plataforma'
            })
        } catch (error) {
            console.error('Error saving config:', error)
            toast.error('Erro ao salvar', {
                description: 'Tente novamente'
            })
        } finally {
            setSaving(false)
        }
    }

    const processWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject', reason?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: action === 'approve' ? 'approved' : 'rejected',
                    processed_by: user?.id,
                    processed_at: new Date().toISOString(),
                    rejection_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', withdrawalId)

            if (error) throw error

            toast.success(action === 'approve' ? 'Saque aprovado!' : 'Saque rejeitado')
            loadWithdrawals()
        } catch (error) {
            console.error('Error processing withdrawal:', error)
            toast.error('Erro ao processar')
        }
    }

    const markAsPaid = async (withdrawalId: string) => {
        try {
            const { error } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('id', withdrawalId)

            if (error) throw error

            toast.success('Marcado como pago!')
            loadWithdrawals()
        } catch (error) {
            console.error('Error marking as paid:', error)
            toast.error('Erro ao atualizar')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
            case 'approved':
                return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>
            case 'paid':
                return <Badge variant="outline" className="border-green-500 text-green-500"><DollarSign className="w-3 h-3 mr-1" />Pago</Badge>
            case 'rejected':
                return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>
            case 'available':
                return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Disponível</Badge>
            case 'withdrawn':
                return <Badge variant="outline" className="border-gray-500 text-gray-500"><Wallet className="w-3 h-3 mr-1" />Sacado</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>
            case 'active':
                return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getReferralStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Aguardando 1º Pagamento</Badge>
            case 'active':
                return <Badge variant="outline" className="border-green-500 text-green-500">Ativo</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="border-red-500 text-red-500">Cancelado</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
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
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">Indicações</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.total_referrals}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs">Total Comissões</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">Pendentes</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.pending_amount)}</p>
                            <p className="text-xs text-muted-foreground">{stats.pending_commissions} comissões</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-green-500 mb-1">
                                <Wallet className="w-4 h-4" />
                                <span className="text-xs">Disponíveis</span>
                            </div>
                            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.available_amount)}</p>
                            <p className="text-xs text-muted-foreground">{stats.available_commissions} comissões</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sub-tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="config" className="gap-2">
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Configurações</span>
                    </TabsTrigger>
                    <TabsTrigger value="referrals" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Indicações</span>
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                            {referrals.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="commissions" className="gap-2">
                        <Receipt className="w-4 h-4" />
                        <span className="hidden sm:inline">Comissões</span>
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                            {commissions.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals" className="gap-2">
                        <Wallet className="w-4 h-4" />
                        <span className="hidden sm:inline">Saques</span>
                        {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                {withdrawals.filter(w => w.status === 'pending').length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Configurações Tab */}
                <TabsContent value="config" className="space-y-6">
                    {config ? (
                        <Card className="border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Configurações do Sistema de Indicação
                                </CardTitle>
                                <CardDescription>
                                    Alterações aqui propagam automaticamente para toda a plataforma
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Status */}
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                                    <div>
                                        <Label className="text-base">Sistema de Indicação</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Ativar/desativar sistema de indicação e comissões
                                        </p>
                                    </div>
                                    <Switch
                                        checked={config.is_active}
                                        onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
                                    />
                                </div>

                                {/* Grid de configurações */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Comissão */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            Porcentagem da Comissão
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={config.commission_percentage}
                                                onChange={(e) => setConfig({ ...config, commission_percentage: parseFloat(e.target.value) || 0 })}
                                            />
                                            <span className="text-muted-foreground">%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            100% = valor total da primeira mensalidade
                                        </p>
                                    </div>

                                    {/* Prazo */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                            Prazo para Liberação
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="365"
                                                value={config.release_days}
                                                onChange={(e) => setConfig({ ...config, release_days: parseInt(e.target.value) || 0 })}
                                            />
                                            <span className="text-muted-foreground">dias</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Dias após pagamento para liberar comissão
                                        </p>
                                    </div>

                                    {/* Valor mínimo saque */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-blue-500" />
                                            Valor Mínimo para Saque
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">R$</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="10"
                                                value={config.min_withdrawal_amount}
                                                onChange={(e) => setConfig({ ...config, min_withdrawal_amount: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Saldo mínimo para solicitar saque
                                        </p>
                                    </div>

                                    {/* Adimplência */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-orange-500" />
                                            Exigir Adimplência
                                        </Label>
                                        <div className="flex items-center gap-2 pt-2">
                                            <Switch
                                                checked={config.require_referred_active}
                                                onCheckedChange={(checked) => setConfig({ ...config, require_referred_active: checked })}
                                            />
                                            <span className="text-sm">
                                                {config.require_referred_active ? 'Sim - Indicado deve estar em dia' : 'Não - Libera mesmo inadimplente'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Se ativo, comissão só é liberada se o indicado estiver adimplente
                                        </p>
                                    </div>
                                </div>

                                {/* Botão Salvar */}
                                <div className="flex justify-end pt-4 border-t">
                                    <Button onClick={saveConfig} disabled={saving}>
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Salvar Configurações
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-yellow-500/20">
                            <CardContent className="py-8 text-center">
                                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                <p className="text-lg font-medium">Configuração não encontrada</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Execute a migration SQL para criar a tabela referral_config
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Indicações Tab */}
                <TabsContent value="referrals" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Todas as Indicações</h3>
                        <Button variant="outline" size="sm" onClick={loadReferrals}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>

                    {referrals.length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhuma indicação registrada</p>
                                <p className="text-sm text-muted-foreground">
                                    As indicações aparecerão aqui quando usuários se cadastrarem via link de indicação
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {referrals.map((referral) => (
                                <Card key={referral.id} className="border-primary/20">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Referrer */}
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={referral.referrer?.avatar_url || ''} />
                                                        <AvatarFallback className="bg-primary/20 text-primary">
                                                            {referral.referrer?.full_name?.charAt(0) || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{referral.referrer?.full_name || 'Indicador'}</p>
                                                        <p className="text-xs text-muted-foreground">Indicador</p>
                                                    </div>
                                                </div>

                                                <ArrowRight className="w-5 h-5 text-muted-foreground" />

                                                {/* Referred */}
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={referral.referred?.avatar_url || ''} />
                                                        <AvatarFallback className="bg-green-500/20 text-green-500">
                                                            {referral.referred?.full_name?.charAt(0) || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{referral.referred?.full_name || 'Indicado'}</p>
                                                        <p className="text-xs text-muted-foreground">Indicado</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {getReferralStatusBadge(referral.status)}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(referral.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Comissões Tab */}
                <TabsContent value="commissions" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Todas as Comissões</h3>
                        <Button variant="outline" size="sm" onClick={loadCommissions}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>

                    {commissions.length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhuma comissão registrada</p>
                                <p className="text-sm text-muted-foreground">
                                    As comissões serão geradas quando indicados fizerem o primeiro pagamento
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {commissions.map((commission) => {
                                const daysRemaining = getDaysRemaining(commission.release_date)

                                return (
                                    <Card key={commission.id} className="border-primary/20">
                                        <CardContent className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {/* Referrer */}
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={commission.referrer?.avatar_url || ''} />
                                                            <AvatarFallback className="bg-primary/20 text-primary">
                                                                {commission.referrer?.full_name?.charAt(0) || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-sm">{commission.referrer?.full_name || 'Indicador'}</p>
                                                            <p className="text-xs text-muted-foreground">vai receber</p>
                                                        </div>
                                                    </div>

                                                    <div className="text-center px-4">
                                                        <p className="text-lg font-bold text-primary">
                                                            {formatCurrency(commission.commission_amount)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {commission.commission_percentage}% de {formatCurrency(commission.payment_amount)}
                                                        </p>
                                                    </div>

                                                    {/* Referred */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right">
                                                            <p className="font-medium text-sm">{commission.referred?.full_name || 'Indicado'}</p>
                                                            <p className="text-xs text-muted-foreground">pagou em {formatDate(commission.payment_date)}</p>
                                                        </div>
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={commission.referred?.avatar_url || ''} />
                                                            <AvatarFallback className="bg-green-500/20 text-green-500">
                                                                {commission.referred?.full_name?.charAt(0) || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {getStatusBadge(commission.status)}
                                                    {commission.status === 'pending' && daysRemaining !== null && (
                                                        <p className="text-xs text-yellow-500 mt-1">
                                                            <Clock className="w-3 h-3 inline mr-1" />
                                                            {daysRemaining} dias restantes
                                                        </p>
                                                    )}
                                                    {commission.available_at && (
                                                        <p className="text-xs text-green-500 mt-1">
                                                            Liberado em {formatDate(commission.available_at)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Saques Tab */}
                <TabsContent value="withdrawals" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Solicitações de Saque</h3>
                        <Button variant="outline" size="sm" onClick={loadWithdrawals}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>

                    {withdrawals.length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhuma solicitação de saque</p>
                                <p className="text-sm text-muted-foreground">
                                    As solicitações aparecerão aqui quando os usuários solicitarem
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {withdrawals.map((withdrawal) => (
                                <Card key={withdrawal.id} className="border-primary/20">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={withdrawal.user?.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/20 text-primary">
                                                        {withdrawal.user?.full_name?.charAt(0) || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{withdrawal.user?.full_name || 'Usuário'}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>PIX: {withdrawal.pix_key}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(withdrawal.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-primary">{formatCurrency(withdrawal.amount)}</p>
                                                    {getStatusBadge(withdrawal.status)}
                                                </div>

                                                {withdrawal.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-green-500 text-green-500 hover:bg-green-500/10"
                                                            onClick={() => processWithdrawal(withdrawal.id, 'approve')}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                                                            onClick={() => processWithdrawal(withdrawal.id, 'reject')}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}

                                                {withdrawal.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => markAsPaid(withdrawal.id)}
                                                    >
                                                        <DollarSign className="w-4 h-4 mr-1" />
                                                        Marcar como Pago
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
