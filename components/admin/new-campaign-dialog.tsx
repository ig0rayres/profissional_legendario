'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { NotificationType, NotificationPriority, DeliveryChannel, MOCK_PROFESSIONALS, MOCK_CATEGORIES } from '@/lib/data/mock'

interface CampaignFormData {
    title: string
    type: NotificationType
    priority: NotificationPriority
    channels: DeliveryChannel[]
    subject: string
    body: string
    segmentation: {
        targetMode: 'all' | 'filtered' | 'individual'
        plans: string[]
        categories: string[]
        individualUsers: string[]
    }
    scheduledFor?: string
}

interface NewCampaignDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NewCampaignDialog({ open, onOpenChange }: NewCampaignDialogProps) {
    const [formData, setFormData] = useState<CampaignFormData>({
        title: '',
        type: 'institutional',
        priority: 'normal',
        channels: ['in-app'],
        subject: '',
        body: '',
        segmentation: {
            targetMode: 'all',
            plans: [],
            categories: [],
            individualUsers: []
        }
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [planFilter, setPlanFilter] = useState<string[]>([]) // Filter by subscription plan

    const handleChannelToggle = (channel: DeliveryChannel) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel]
        }))
    }

    // Filter users based on search query and plan filter
    const filteredUsers = MOCK_PROFESSIONALS.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        // For demo purposes, assign plans based on user ID
        // In production, this would come from user.subscription_plan or similar
        const userPlan = user.id === '1' || user.id === '2' ? 'Elite' :
            user.id === '3' || user.id === '4' ? 'Veterano' : 'Recruta'

        const matchesPlan = planFilter.length === 0 || planFilter.includes(userPlan)

        return matchesSearch && matchesPlan
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement actual campaign creation
        console.log('Creating campaign:', formData)

        // Show success message
        alert('Campanha criada com sucesso! (Em breve será salva no banco de dados)')

        // Reset form and close
        setFormData({
            title: '',
            type: 'institutional',
            priority: 'normal',
            channels: ['in-app'],
            subject: '',
            body: '',
            segmentation: {
                targetMode: 'all',
                plans: [],
                categories: [],
                individualUsers: []
            }
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-2 border-primary/30 shadow-2xl">
                <DialogHeader className="border-b border-primary/20 pb-4">
                    <DialogTitle className="text-2xl text-primary font-bold">Nova Campanha de Mensagens</DialogTitle>
                    <DialogDescription className="text-base">
                        Crie uma campanha de notificação para comunicar com os membros da comunidade
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Basic Info */}
                    <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h3 className="text-lg font-semibold text-primary mb-2">Informações Básicas</h3>
                        <div>
                            <Label htmlFor="title">Título da Campanha *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ex: Novo Evento de Networking"
                                required
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">Tipo de Mensagem *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NotificationType }))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="institutional">Institucional</SelectItem>
                                        <SelectItem value="invitation">Convite</SelectItem>
                                        <SelectItem value="profile">Perfil</SelectItem>
                                        <SelectItem value="security">Segurança</SelectItem>
                                        <SelectItem value="promo">Promoção</SelectItem>
                                        <SelectItem value="critical">Crítico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="priority">Prioridade *</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as NotificationPriority }))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="critical">Crítica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h3 className="text-lg font-semibold text-primary mb-2">Conteúdo da Mensagem</h3>
                        <div>
                            <Label htmlFor="subject">Assunto *</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="Assunto da mensagem"
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="body">Corpo da Mensagem *</Label>
                            <Textarea
                                id="body"
                                value={formData.body}
                                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                                placeholder="Digite a mensagem completa aqui. Você pode usar placeholders como {first_name}, {plan}, {vigor}..."
                                rows={5}
                                required
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Dica: Use placeholders para personalizar: {'{first_name}'}, {'{plan}'}, {'{vigor}'}
                            </p>
                        </div>
                    </div>

                    {/* Channels */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h3 className="text-lg font-semibold text-primary mb-3">Canais de Entrega</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {(['in-app', 'email', 'push', 'sms'] as DeliveryChannel[]).map((channel) => (
                                <div key={channel} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={channel}
                                        checked={formData.channels.includes(channel)}
                                        onCheckedChange={() => handleChannelToggle(channel)}
                                    />
                                    <Label htmlFor={channel} className="cursor-pointer capitalize">
                                        {channel === 'in-app' ? 'In-App' : channel.toUpperCase()}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Segmentation */}
                    <div className="space-y-4 border-t border-primary/20 pt-4">
                        <h4 className="font-semibold text-primary">Segmentação de Público</h4>

                        {/* Target Mode Selection */}
                        <div>
                            <Label>Modo de Seleção *</Label>
                            <Select
                                value={formData.segmentation.targetMode}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    segmentation: {
                                        ...prev.segmentation,
                                        targetMode: value as 'all' | 'filtered' | 'individual'
                                    }
                                }))}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Usuários</SelectItem>
                                    <SelectItem value="filtered">Filtrar por Categoria/Plano</SelectItem>
                                    <SelectItem value="individual">Selecionar Individualmente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filtered Mode Options */}
                        {formData.segmentation.targetMode === 'filtered' && (
                            <>
                                {/* Plan Filter */}
                                <div>
                                    <Label>Filtrar por Tipo de Conta</Label>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {['Recruta', 'Veterano', 'Elite', 'Lendário'].map((plan) => (
                                            <div key={plan} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`plan-${plan}`}
                                                    checked={formData.segmentation.plans.includes(plan)}
                                                    onCheckedChange={(checked) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            segmentation: {
                                                                ...prev.segmentation,
                                                                plans: checked
                                                                    ? [...prev.segmentation.plans, plan]
                                                                    : prev.segmentation.plans.filter(p => p !== plan)
                                                            }
                                                        }))
                                                    }}
                                                />
                                                <Label htmlFor={`plan-${plan}`} className="cursor-pointer">
                                                    {plan}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Deixe vazio para incluir todos os tipos de conta
                                    </p>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <Label>Filtrar por Categoria de Serviço</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border border-primary/20 rounded-md">
                                        {MOCK_CATEGORIES.filter(cat => cat.active).map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${category.id}`}
                                                    checked={formData.segmentation.categories.includes(category.name)}
                                                    onCheckedChange={(checked) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            segmentation: {
                                                                ...prev.segmentation,
                                                                categories: checked
                                                                    ? [...prev.segmentation.categories, category.name]
                                                                    : prev.segmentation.categories.filter(c => c !== category.name)
                                                            }
                                                        }))
                                                    }}
                                                />
                                                <Label htmlFor={`cat-${category.id}`} className="cursor-pointer text-sm">
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Deixe vazio para incluir todas as categorias
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Individual Selection Mode */}
                        {formData.segmentation.targetMode === 'individual' && (
                            <div>
                                <Label>Selecionar Usuários</Label>

                                {/* Search Field */}
                                <div className="relative mt-2 mb-3">
                                    <Input
                                        type="text"
                                        placeholder="Pesquisar por nome ou email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Plan Filter */}
                                <div className="mb-3 p-3 bg-muted/20 rounded-md border border-primary/10">
                                    <Label className="text-sm font-semibold mb-2 block">Filtrar por Plano de Assinatura</Label>
                                    <div className="flex gap-3">
                                        {['Recruta', 'Veterano', 'Elite', 'Lendário'].map((plan) => (
                                            <div key={plan} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`plan-filter-${plan}`}
                                                    checked={planFilter.includes(plan)}
                                                    onCheckedChange={(checked) => {
                                                        setPlanFilter(prev =>
                                                            checked
                                                                ? [...prev, plan]
                                                                : prev.filter(p => p !== plan)
                                                        )
                                                    }}
                                                />
                                                <Label htmlFor={`plan-filter-${plan}`} className="cursor-pointer text-sm">
                                                    {plan}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {planFilter.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Filtrando: {planFilter.join(', ')}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-2 max-h-60 overflow-y-auto p-3 border border-primary/20 rounded-md space-y-2 bg-muted/10">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-primary/10 sticky top-0 bg-card">
                                        <Checkbox
                                            id="select-all-users"
                                            checked={formData.segmentation.individualUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    segmentation: {
                                                        ...prev.segmentation,
                                                        individualUsers: checked
                                                            ? filteredUsers.map(p => p.id)
                                                            : []
                                                    }
                                                }))
                                            }}
                                        />
                                        <Label htmlFor="select-all-users" className="cursor-pointer font-semibold">
                                            Selecionar Todos ({filteredUsers.length})
                                        </Label>
                                    </div>
                                    {filteredUsers.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">Nenhum usuário encontrado</p>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div key={user.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`user-${user.id}`}
                                                    checked={formData.segmentation.individualUsers.includes(user.id)}
                                                    onCheckedChange={(checked) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            segmentation: {
                                                                ...prev.segmentation,
                                                                individualUsers: checked
                                                                    ? [...prev.segmentation.individualUsers, user.id]
                                                                    : prev.segmentation.individualUsers.filter(id => id !== user.id)
                                                            }
                                                        }))
                                                    }}
                                                />
                                                <Label htmlFor={`user-${user.id}`} className="cursor-pointer flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{user.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">({user.email})</span>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.segmentation.individualUsers.length} usuário(s) selecionado(s)
                                </p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="scheduled">Agendar Envio (Opcional)</Label>
                            <Input
                                id="scheduled"
                                type="datetime-local"
                                value={formData.scheduledFor || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Deixe vazio para enviar imediatamente
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="glow-orange bg-secondary hover:bg-secondary/90"
                            disabled={!formData.title || !formData.subject || !formData.body || formData.channels.length === 0}
                        >
                            {formData.scheduledFor ? 'Agendar Campanha' : 'Enviar Agora'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
