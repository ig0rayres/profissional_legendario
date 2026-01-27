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
import {
    Save, Settings, Users, Wallet, Clock, CheckCircle, XCircle,
    AlertCircle, DollarSign, Link2, TrendingUp, Loader2, RefreshCw,
    Eye, Check, X
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

    const loadStats = async () => {
        // Buscar estatísticas agregadas
        const { data: commissions } = await supabase
            .from('referral_commissions')
            .select('status, commission_amount')

        if (commissions) {
            const stats: CommissionStats = {
                total_referrals: 0,
                total_commissions: commissions.length,
                pending_commissions: commissions.filter(c => c.status === 'pending').length,
                available_commissions: commissions.filter(c => c.status === 'available').length,
                total_amount: commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0),
                pending_amount: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.commission_amount), 0),
                available_amount: commissions.filter(c => c.status === 'available').reduce((sum, c) => sum + Number(c.commission_amount), 0)
            }

            // Contar referrals
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

            // Limpa cache para propagar alterações
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
            default:
                return <Badge variant="outline">{status}</Badge>
        }
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
                <TabsList>
                    <TabsTrigger value="config" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Configurações
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals" className="gap-2">
                        <Wallet className="w-4 h-4" />
                        Saques
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
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{withdrawal.user?.full_name || 'Usuário'}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>PIX: {withdrawal.pix_key}</span>
                                                        <span>•</span>
                                                        <span>{new Date(withdrawal.created_at).toLocaleDateString('pt-BR')}</span>
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
