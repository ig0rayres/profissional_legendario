'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    RefreshCw, Clock, CheckCircle, XCircle, Wallet, Search, Upload, Download
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/api/financial'
import { WithdrawalRequestsCard } from './WithdrawalRequestsCard'

interface Commission {
    id: string
    payment_amount: number
    commission_amount: number
    status: string
    payment_date: string
    release_date: string | null
    payment_proof_url: string | null
}

interface Referral {
    id: string
    created_at: string
    referrer_id: string
    referred_id: string
    referrer?: { full_name: string, avatar_url: string | null }
    referred?: { full_name: string, avatar_url: string | null }
    commission?: Commission | null
    subscription?: { plan_id: string } | null
}

export function ReferralManager() {
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [uploadingId, setUploadingId] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadReferrals()
    }, [])

    const loadReferrals = async () => {
        setLoading(true)
        try {
            const { data: referralsData, error } = await supabase
                .from('referrals')
                .select(`
                    *,
                    referrer:profiles!referrer_id(full_name, avatar_url),
                    referred:profiles!referred_id(full_name, avatar_url)
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error loading referrals:', error)
                return
            }

            const enrichedReferrals = await Promise.all(
                (referralsData || []).map(async (referral) => {
                    // Buscar comissão - pode não existir ainda
                    const { data: commissionData } = await supabase
                        .from('referral_commissions')
                        .select('id, payment_amount, commission_amount, status, payment_date, release_date, payment_proof_url')
                        .eq('referral_id', referral.id)
                        .maybeSingle()

                    // Buscar subscription - pode não existir
                    const { data: subscriptionData } = await supabase
                        .from('subscriptions')
                        .select('plan_id')
                        .eq('user_id', referral.referred_id)
                        .maybeSingle()

                    return {
                        ...referral,
                        commission: commissionData || null,
                        subscription: subscriptionData || null
                    }
                })
            )

            setReferrals(enrichedReferrals)
            console.log('[ReferralManager] Total de indicações carregadas:', enrichedReferrals.length)
            console.log('[ReferralManager] Indicações:', enrichedReferrals.map(r => ({
                referrer: r.referrer?.full_name,
                referred: r.referred?.full_name,
                created_at: r.created_at,
                has_commission: !!r.commission
            })))
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao carregar indicações')
        } finally {
            setLoading(false)
        }
    }

    const handleUploadProof = async (commissionId: string, file: File) => {
        if (!file) return

        setUploadingId(commissionId)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${commissionId}-${Date.now()}.${fileExt}`
            const filePath = `payment-proofs/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('commission-proofs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('commission-proofs')
                .getPublicUrl(filePath)

            if (!urlData?.publicUrl) throw new Error('Failed to get public URL')

            const { error: updateError } = await supabase
                .from('referral_commissions')
                .update({ payment_proof_url: urlData.publicUrl })
                .eq('id', commissionId)

            if (updateError) throw updateError

            toast.success('Comprovante enviado!')
            loadReferrals()
        } catch (error) {
            console.error('Error uploading proof:', error)
            toast.error('Erro ao enviar comprovante')
        } finally {
            setUploadingId(null)
        }
    }

    const handleDownloadProof = (url: string) => {
        window.open(url, '_blank')
    }

    // Aplicar filtros
    const filteredReferrals = referrals.filter(referral => {
        // Filtro de período
        if (startDate || endDate) {
            const createdAt = new Date(referral.created_at)

            if (startDate) {
                const start = new Date(startDate)
                start.setHours(0, 0, 0, 0)
                if (createdAt < start) return false
            }

            if (endDate) {
                // Criar data fim incluindo TODO o dia selecionado
                // Parse da data sem timezone ambiguity
                const [year, month, day] = endDate.split('-').map(Number)
                const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0) // +1 dia, início do próximo

                if (createdAt >= end) return false
            }
        }


        // Filtro de busca
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            return (
                referral.referrer?.full_name?.toLowerCase().includes(search) ||
                referral.referred?.full_name?.toLowerCase().includes(search)
            )
        }

        return true
    })

    // Calcular totalizadores
    const stats = {
        total: filteredReferrals.length,
        totalPlan: filteredReferrals.reduce((sum, r) => sum + (r.commission?.payment_amount || 0), 0),
        totalCommission: filteredReferrals.reduce((sum, r) => sum + (r.commission?.commission_amount || 0), 0),
        pending: filteredReferrals.filter(r => r.commission?.status === 'pending').length,
        available: filteredReferrals.filter(r => r.commission?.status === 'available').length,
        withdrawn: filteredReferrals.filter(r => r.commission?.status === 'withdrawn').length,
    }

    const getPlanName = (planId: string | null) => {
        if (!planId) return 'Grátis'
        const planNames: Record<string, string> = {
            'lendario': 'Lendário',
            'veterano': 'Veterano',
            'recruta': 'Recruta'
        }
        return planNames[planId] || planId
    }

    const getStatusBadge = (status: string | undefined) => {
        if (!status) return <Badge variant="outline" className="text-xs">Aguardando</Badge>

        const badges: Record<string, JSX.Element> = {
            pending: <Badge variant="outline" className="text-xs" style={{ borderColor: '#CC5500', color: '#CC5500', backgroundColor: 'rgba(204, 85, 0, 0.05)' }}>Pendente</Badge>,
            available: <Badge variant="outline" className="text-xs" style={{ borderColor: '#1E4D40', color: '#1E4D40', backgroundColor: 'rgba(30, 77, 64, 0.05)' }}>Disponível</Badge>,
            withdrawn: <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 bg-blue-500/5">Resgatada</Badge>,
            cancelled: <Badge variant="outline" className="text-xs border-red-500 text-red-600 bg-red-500/5">Cancelada</Badge>
        }

        return badges[status] || <Badge variant="outline" className="text-xs">{status}</Badge>
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Card de Solicitações de Saque Pendentes */}
            <WithdrawalRequestsCard />

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Busca */}
                <div className="md:col-span-5">
                    <Label className="text-xs mb-2 block">Buscar por nome</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Digite o nome do indicador ou indicado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>
                </div>

                {/* Data Início */}
                <div className="md:col-span-3">
                    <Label className="text-xs mb-2 block">Data Início</Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-background"
                    />
                </div>

                {/* Data Fim */}
                <div className="md:col-span-3">
                    <Label className="text-xs mb-2 block">Data Fim</Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-background"
                    />
                </div>

                {/* Atualizar */}
                <div className="md:col-span-1 flex items-end">
                    <Button variant="outline" size="icon" onClick={loadReferrals} className="w-full">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Totalizadores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-[#1E4D40]/20 bg-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-1">Total</p>
                        <p className="text-2xl font-bold" style={{ color: '#1E4D40' }}>{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-[#CC5500]/20 bg-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-1">Valor Planos</p>
                        <p className="text-lg font-bold" style={{ color: '#CC5500' }}>{formatCurrency(stats.totalPlan)}</p>
                    </CardContent>
                </Card>
                <Card className="border-[#1E4D40]/20 bg-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-1">Comissões</p>
                        <p className="text-lg font-bold" style={{ color: '#1E4D40' }}>{formatCurrency(stats.totalCommission)}</p>
                    </CardContent>
                </Card>
                <Card className="border-[#CC5500]/20 bg-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <div className="flex gap-1 text-xs font-medium">
                            <span style={{ color: '#CC5500' }}>{stats.pending}P</span>
                            <span className="text-muted-foreground">/</span>
                            <span style={{ color: '#1E4D40' }}>{stats.available}D</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-blue-600">{stats.withdrawn}R</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela */}
            <Card className="border-[#1E4D40]/20 bg-white">
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-muted/30 border-b text-xs font-medium text-muted-foreground">
                        <div className="col-span-1">Data</div>
                        <div className="col-span-2">Indicador</div>
                        <div className="col-span-2">Indicado</div>
                        <div className="col-span-1">Plano</div>
                        <div className="col-span-2 text-right">Valor Plano</div>
                        <div className="col-span-2 text-right">Comissão</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-center">Comprov.</div>
                    </div>

                    {/* Linhas */}
                    {filteredReferrals.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <p className="text-sm">Nenhuma indicação encontrada no período selecionado</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredReferrals.map((referral) => (
                                <div
                                    key={referral.id}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-sm"
                                >
                                    {/* Data */}
                                    <div className="col-span-1 flex items-center">
                                        <span className="text-xs">{formatDate(referral.created_at)}</span>
                                    </div>

                                    {/* Indicador */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Avatar className="w-7 h-7">
                                            <AvatarImage src={referral.referrer?.avatar_url || ''} />
                                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                {referral.referrer?.full_name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium truncate">{referral.referrer?.full_name}</span>
                                    </div>

                                    {/* Indicado */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Avatar className="w-7 h-7">
                                            <AvatarImage src={referral.referred?.avatar_url || ''} />
                                            <AvatarFallback className="bg-green-500/20 text-green-600 text-xs">
                                                {referral.referred?.full_name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium truncate">{referral.referred?.full_name}</span>
                                    </div>

                                    {/* Plano */}
                                    <div className="col-span-1 flex items-center">
                                        <span className="text-xs">{getPlanName(referral.subscription?.plan_id || null)}</span>
                                    </div>

                                    {/* Valor Plano */}
                                    <div className="col-span-2 flex items-center justify-end">
                                        <span className="text-xs font-semibold" style={{ color: '#CC5500' }}>
                                            {referral.commission?.payment_amount
                                                ? formatCurrency(referral.commission.payment_amount)
                                                : '-'}
                                        </span>
                                    </div>

                                    {/* Comissão */}
                                    <div className="col-span-2 flex items-center justify-end">
                                        <span className="text-xs font-bold" style={{ color: '#1E4D40' }}>
                                            {referral.commission?.commission_amount
                                                ? formatCurrency(referral.commission.commission_amount)
                                                : '-'}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1 flex items-center justify-center">
                                        {getStatusBadge(referral.commission?.status)}
                                    </div>

                                    {/* Comprovante */}
                                    <div className="col-span-1 flex items-center justify-center">
                                        {referral.commission?.payment_proof_url ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleDownloadProof(referral.commission!.payment_proof_url!)}
                                            >
                                                <Download className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        ) : referral.commission?.id ? (
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file && referral.commission?.id) {
                                                            handleUploadProof(referral.commission.id, file)
                                                        }
                                                    }}
                                                    disabled={uploadingId === referral.commission.id}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 w-7 p-0"
                                                    disabled={uploadingId === referral.commission.id}
                                                    asChild
                                                >
                                                    <span>
                                                        {uploadingId === referral.commission.id ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </span>
                                                </Button>
                                            </label>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
