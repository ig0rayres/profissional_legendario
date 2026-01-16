'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/api/financial'
import { Plus, X, Target, TrendingUp, Users as UsersIcon, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface Campaign {
    id: string
    name: string
    description?: string
    campaign_type: 'seasonal' | 'launch' | 'retention' | 'win_back'
    discount_type?: 'percentage' | 'fixed_amount' | 'trial_period'
    discount_value?: number
    trial_days?: number
    target_audience: string[]
    target_plans: string[]
    auto_apply: boolean
    goal_conversions?: number
    current_conversions: number
    total_revenue_generated: number
    start_date: string
    end_date: string
    is_active: boolean
}

export function CampaignManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        campaign_type: 'seasonal' as 'seasonal' | 'launch' | 'retention' | 'win_back',
        discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'trial_period',
        discount_value: 0,
        goal_conversions: 100,
        start_date: '',
        end_date: ''
    })
    const supabase = createClient()

    useEffect(() => {
        loadCampaigns()
    }, [])

    const loadCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('promotional_campaigns')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setCampaigns(data || [])
        } catch (error) {
            console.error('Error loading campaigns:', error)
            toast.error('Erro ao carregar campanhas', {
                description: 'Tente novamente mais tarde'
            })
        } finally {
            setLoading(false)
        }
    }

    const createCampaign = async () => {
        try {
            const { error } = await supabase
                .from('promotional_campaigns')
                .insert({
                    name: formData.name,
                    description: formData.description || null,
                    campaign_type: formData.campaign_type,
                    discount_type: formData.discount_type,
                    discount_value: formData.discount_value,
                    goal_conversions: formData.goal_conversions,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    is_active: true,
                    target_audience: [],
                    target_plans: []
                })

            if (error) throw error

            toast.success('Campanha criada', {
                description: `A campanha ${formData.name} foi criada com sucesso`
            })

            setShowCreateForm(false)
            setFormData({
                name: '',
                description: '',
                campaign_type: 'seasonal',
                discount_type: 'percentage',
                discount_value: 0,
                goal_conversions: 100,
                start_date: '',
                end_date: ''
            })
            loadCampaigns()
        } catch (error: any) {
            console.error('Error creating campaign:', error)
            toast.error('Erro ao criar campanha', {
                description: error.message || 'Tente novamente'
            })
        }
    }

    const toggleCampaign = async (campaign: Campaign) => {
        try {
            const { error } = await supabase
                .from('promotional_campaigns')
                .update({ is_active: !campaign.is_active })
                .eq('id', campaign.id)

            if (error) throw error

            toast.success(campaign.is_active ? 'Campanha pausada' : 'Campanha ativada', {
                description: `A campanha ${campaign.name} foi ${campaign.is_active ? 'pausada' : 'ativada'}`
            })

            loadCampaigns()
        } catch (error) {
            console.error('Error toggling campaign:', error)
            toast.error('Erro ao alterar status', {
                description: 'Tente novamente'
            })
        }
    }

    const getCampaignStatus = (campaign: Campaign) => {
        const now = new Date()
        const startDate = new Date(campaign.start_date)
        const endDate = new Date(campaign.end_date)

        if (!campaign.is_active) return { label: 'Pausada', color: 'text-yellow-500' }
        if (now < startDate) return { label: 'Agendada', color: 'text-blue-500' }
        if (now > endDate) return { label: 'Finalizada', color: 'text-gray-500' }
        return { label: 'Ativa', color: 'text-green-500' }
    }

    const campaignTypeLabels = {
        seasonal: 'Sazonal',
        launch: 'Lançamento',
        retention: 'Retenção',
        win_back: 'Reconquista'
    }

    if (loading) {
        return <div className="text-muted-foreground">Carregando campanhas...</div>
    }

    return (
        <div className="space-y-4">
            {/* Create Button */}
            {!showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Nova Campanha
                </Button>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="p-4 border border-primary/20 rounded-lg bg-background/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-primary">Nova Campanha</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCreateForm(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label>Nome da Campanha *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Black Friday 2024"
                            />
                        </div>

                        <div>
                            <Label>Tipo de Campanha *</Label>
                            <Select
                                value={formData.campaign_type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, campaign_type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="seasonal">Sazonal</SelectItem>
                                    <SelectItem value="launch">Lançamento</SelectItem>
                                    <SelectItem value="retention">Retenção</SelectItem>
                                    <SelectItem value="win_back">Reconquista</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Tipo de Desconto *</Label>
                            <Select
                                value={formData.discount_type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, discount_type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                    <SelectItem value="fixed_amount">Valor Fixo (R$)</SelectItem>
                                    <SelectItem value="trial_period">Período de Trial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>
                                Valor do Desconto * {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.discount_value}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discount_value: parseFloat(e.target.value) || 0
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Meta de Conversões</Label>
                            <Input
                                type="number"
                                value={formData.goal_conversions}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        goal_conversions: parseInt(e.target.value) || 0
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Data de Início *</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, start_date: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <Label>Data de Término *</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, end_date: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Descrição</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Descrição da campanha"
                            rows={3}
                        />
                    </div>

                    <Button onClick={createCampaign} className="w-full">
                        Criar Campanha
                    </Button>
                </div>
            )}

            {/* Campaigns List */}
            {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    Nenhuma campanha cadastrada ainda
                </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((campaign) => {
                        const status = getCampaignStatus(campaign)
                        const progress = campaign.goal_conversions
                            ? (campaign.current_conversions / campaign.goal_conversions) * 100
                            : 0

                        return (
                            <div
                                key={campaign.id}
                                className="p-4 border border-primary/20 rounded-lg bg-background/50"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary" />
                                            <h3 className="text-lg font-bold text-primary">
                                                {campaign.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {campaignTypeLabels[campaign.campaign_type]}
                                            </Badge>
                                            <Badge variant="outline" className={status.color}>
                                                {status.label}
                                            </Badge>
                                        </div>

                                        {campaign.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {campaign.description}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleCampaign(campaign)}
                                    >
                                        {campaign.is_active ? 'Pausar' : 'Ativar'}
                                    </Button>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-xs">Conversões</span>
                                        </div>
                                        <p className="text-lg font-bold text-primary">
                                            {campaign.current_conversions}
                                            {campaign.goal_conversions && (
                                                <span className="text-sm text-muted-foreground">
                                                    {' '}/ {campaign.goal_conversions}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-xs">Receita Gerada</span>
                                        </div>
                                        <p className="text-lg font-bold text-primary">
                                            {formatCurrency(campaign.total_revenue_generated)}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Target className="w-4 h-4" />
                                            <span className="text-xs">Progresso</span>
                                        </div>
                                        <p className="text-lg font-bold text-primary">
                                            {Math.round(progress)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {campaign.goal_conversions && (
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="mt-3 text-xs text-muted-foreground">
                                    {new Date(campaign.start_date).toLocaleDateString('pt-BR')} -{' '}
                                    {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
