'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Bell, MessageSquare, Mail, Send, Users, Filter, Search,
    Loader2, CheckCircle2, AlertCircle, ChevronDown, X, Eye,
    MapPin, Tag, CreditCard, User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// ============================================
// TIPOS
// ============================================

interface FilterState {
    pistas: string[]
    categories: string[]
    plans: string[]
    individualUsers: string[]
    sendToAll: boolean
}

interface Pista {
    id: string
    name: string
    slug: string
}

interface Category {
    id: string
    name: string
    slug: string
    icon: string
    color: string
}

interface Plan {
    id: string
    name: string
}

interface UserPreview {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    pista?: string
}

interface MessageHistory {
    id: string
    type: 'notification' | 'chat' | 'email'
    title: string
    body: string
    recipients_count: number
    sent_at: string
    sent_by: string
}

// ============================================
// CONSTANTES
// ============================================

// Planos serão carregados do banco (plan_tiers)

const MESSAGE_CHANNELS = [
    { id: 'notification', name: 'Sino (Notificação)', icon: Bell, description: 'Aparece no sino do topo' },
    { id: 'chat', name: 'Mensagem de Chat', icon: MessageSquare, description: 'Envia como Rota Business' },
    { id: 'email', name: 'Campanha de Email', icon: Mail, description: 'Envia para o email cadastrado' }
] as const

type ChannelType = typeof MESSAGE_CHANNELS[number]['id']

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MessagesManager() {
    const supabase = createClient()

    // Estados do formulário
    const [selectedChannel, setSelectedChannel] = useState<ChannelType>('notification')
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)

    // Estados dos filtros
    const [filters, setFilters] = useState<FilterState>({
        pistas: [],
        categories: [],
        plans: [],
        individualUsers: [],
        sendToAll: false
    })

    // Dados para seleção
    const [pistas, setPistas] = useState<Pista[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [plans, setPlans] = useState<Plan[]>([])
    const [allUsers, setAllUsers] = useState<UserPreview[]>([])
    const [searchUser, setSearchUser] = useState('')
    const [loading, setLoading] = useState(true)

    // Preview de destinatários
    const [recipientsPreview, setRecipientsPreview] = useState<UserPreview[]>([])
    const [recipientsCount, setRecipientsCount] = useState(0)
    const [loadingPreview, setLoadingPreview] = useState(false)

    // Histórico
    const [history, setHistory] = useState<MessageHistory[]>([])
    const [showHistory, setShowHistory] = useState(false)

    // Dialog de confirmação
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    // ============================================
    // CARREGAR DADOS INICIAIS
    // ============================================

    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        updateRecipientsPreview()
    }, [filters])

    async function loadInitialData() {
        setLoading(true)

        try {
            // Carregar pistas (todas)
            const { data: pistasData } = await supabase
                .from('pistas')
                .select('id, name, slug')
                .order('name')

            if (pistasData) setPistas(pistasData)

            // Carregar categorias
            const { data: categoriesData } = await supabase
                .from('service_categories')
                .select('id, name, slug, icon, color')
                .eq('active', true)
                .order('name')

            if (categoriesData) setCategories(categoriesData)

            // Carregar planos do banco (plan_config tem os 4 planos corretos)
            const { data: plansData } = await supabase
                .from('plan_config')
                .select('id, tier, name')
                .eq('is_active', true)
                .order('display_order')

            // Mapear tier como id para filtros
            if (plansData) setPlans(plansData.map(p => ({ id: p.tier, name: p.name })))

            // Carregar todos os usuários para busca
            const { data: usersData } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url, pista')
                .order('full_name')
                .limit(500)

            if (usersData) setAllUsers(usersData)

        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        }

        setLoading(false)
    }

    // ============================================
    // PREVIEW DE DESTINATÁRIOS
    // ============================================

    async function updateRecipientsPreview() {
        if (filters.sendToAll) {
            // Contar todos os usuários
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .not('email', 'is', null)

            setRecipientsCount(count || 0)
            setRecipientsPreview([])
            return
        }

        // Se nenhum filtro selecionado, zerar
        if (filters.pistas.length === 0 &&
            filters.plans.length === 0 &&
            filters.categories.length === 0 &&
            filters.individualUsers.length === 0) {
            setRecipientsCount(0)
            setRecipientsPreview([])
            return
        }

        setLoadingPreview(true)

        try {
            // Se filtro de planos ativo, buscar user_ids das subscriptions primeiro
            let userIdsFromPlans: string[] = []
            if (filters.plans.length > 0) {
                const { data: subscriptions } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .in('plan_id', filters.plans)
                    .eq('status', 'active')

                userIdsFromPlans = subscriptions?.map(s => s.user_id) || []

                // Se nenhum usuário com esses planos, retornar vazio
                if (userIdsFromPlans.length === 0) {
                    setRecipientsCount(0)
                    setRecipientsPreview([])
                    setLoadingPreview(false)
                    return
                }
            }

            // Se filtro de categorias ativo, buscar user_ids da user_categories
            let userIdsFromCategories: string[] = []
            if (filters.categories.length > 0) {
                const { data: userCats } = await supabase
                    .from('user_categories')
                    .select('user_id')
                    .in('category_id', filters.categories)

                userIdsFromCategories = Array.from(new Set(userCats?.map(uc => uc.user_id) || []))

                // Se nenhum usuário com essas categorias, retornar vazio
                if (userIdsFromCategories.length === 0) {
                    setRecipientsCount(0)
                    setRecipientsPreview([])
                    setLoadingPreview(false)
                    return
                }
            }

            // Combinar filtros de planos e categorias (interseção)
            let combinedUserIds: string[] | null = null
            if (userIdsFromPlans.length > 0 && userIdsFromCategories.length > 0) {
                combinedUserIds = userIdsFromPlans.filter(id => userIdsFromCategories.includes(id))
                if (combinedUserIds.length === 0) {
                    setRecipientsCount(0)
                    setRecipientsPreview([])
                    setLoadingPreview(false)
                    return
                }
            } else if (userIdsFromPlans.length > 0) {
                combinedUserIds = userIdsFromPlans
            } else if (userIdsFromCategories.length > 0) {
                combinedUserIds = userIdsFromCategories
            }

            // Construir query de profiles
            let query = supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url, pista')
                .not('email', 'is', null)

            // Filtro por pista
            if (filters.pistas.length > 0) {
                query = query.in('pista_id', filters.pistas)
            }

            // Filtro por usuários individuais
            if (filters.individualUsers.length > 0) {
                query = query.in('id', filters.individualUsers)
            }

            // Filtro por planos/categorias (via user_ids combinados)
            if (combinedUserIds && combinedUserIds.length > 0) {
                query = query.in('id', combinedUserIds)
            }

            const { data } = await query.limit(10)

            setRecipientsPreview(data || [])

            // Contar total com mesmos filtros
            let countQuery = supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .not('email', 'is', null)

            if (filters.pistas.length > 0) {
                countQuery = countQuery.in('pista_id', filters.pistas)
            }
            if (filters.individualUsers.length > 0) {
                countQuery = countQuery.in('id', filters.individualUsers)
            }
            if (combinedUserIds && combinedUserIds.length > 0) {
                countQuery = countQuery.in('id', combinedUserIds)
            }

            const { count: totalCount } = await countQuery
            setRecipientsCount(totalCount || 0)

        } catch (error) {
            console.error('Erro ao atualizar preview:', error)
        }

        setLoadingPreview(false)
    }

    // ============================================
    // FUNÇÕES DE FILTRO
    // ============================================

    function togglePista(pistaId: string) {
        setFilters(prev => ({
            ...prev,
            sendToAll: false,
            pistas: prev.pistas.includes(pistaId)
                ? prev.pistas.filter(p => p !== pistaId)
                : [...prev.pistas, pistaId]
        }))
    }

    function toggleCategory(categoryId: string) {
        setFilters(prev => ({
            ...prev,
            sendToAll: false,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(c => c !== categoryId)
                : [...prev.categories, categoryId]
        }))
    }

    function togglePlan(planId: string) {
        setFilters(prev => ({
            ...prev,
            sendToAll: false,
            plans: prev.plans.includes(planId)
                ? prev.plans.filter(p => p !== planId)
                : [...prev.plans, planId]
        }))
    }

    function addUser(userId: string) {
        if (!filters.individualUsers.includes(userId)) {
            setFilters(prev => ({
                ...prev,
                sendToAll: false,
                individualUsers: [...prev.individualUsers, userId]
            }))
        }
        setSearchUser('')
    }

    function removeUser(userId: string) {
        setFilters(prev => ({
            ...prev,
            individualUsers: prev.individualUsers.filter(id => id !== userId)
        }))
    }

    function toggleSendToAll() {
        setFilters(prev => ({
            pistas: [],
            categories: [],
            plans: [],
            individualUsers: [],
            sendToAll: !prev.sendToAll
        }))
    }

    function clearFilters() {
        setFilters({
            pistas: [],
            categories: [],
            plans: [],
            individualUsers: [],
            sendToAll: false
        })
    }

    // ============================================
    // ENVIO DE MENSAGENS
    // ============================================

    async function handleSend() {
        if (!title.trim() || !body.trim()) {
            toast.error('Preencha o título e a mensagem')
            return
        }

        if (recipientsCount === 0) {
            toast.error('Selecione pelo menos um destinatário')
            return
        }

        setShowConfirmDialog(true)
    }

    async function confirmSend() {
        setShowConfirmDialog(false)
        setSending(true)
        toast.loading('Enviando mensagens...')

        try {
            // Se filtro de planos ativo, buscar user_ids das subscriptions primeiro
            let userIdsFromPlans: string[] = []
            if (!filters.sendToAll && filters.plans.length > 0) {
                const { data: subscriptions } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .in('plan_id', filters.plans)
                    .eq('status', 'active')

                userIdsFromPlans = subscriptions?.map(s => s.user_id) || []
            }

            // Se filtro de categorias ativo, buscar user_ids da user_categories
            let userIdsFromCategories: string[] = []
            if (!filters.sendToAll && filters.categories.length > 0) {
                const { data: userCats } = await supabase
                    .from('user_categories')
                    .select('user_id')
                    .in('category_id', filters.categories)

                userIdsFromCategories = Array.from(new Set(userCats?.map(uc => uc.user_id) || []))
            }

            // Combinar filtros de planos e categorias
            let combinedUserIds: string[] | null = null
            if (userIdsFromPlans.length > 0 && userIdsFromCategories.length > 0) {
                combinedUserIds = userIdsFromPlans.filter(id => userIdsFromCategories.includes(id))
            } else if (userIdsFromPlans.length > 0) {
                combinedUserIds = userIdsFromPlans
            } else if (userIdsFromCategories.length > 0) {
                combinedUserIds = userIdsFromCategories
            }

            // Buscar IDs dos destinatários
            let query = supabase
                .from('profiles')
                .select('id, email, full_name')
                .not('email', 'is', null)

            if (!filters.sendToAll) {
                if (filters.pistas.length > 0) {
                    query = query.in('pista_id', filters.pistas)
                }
                if (filters.individualUsers.length > 0) {
                    query = query.in('id', filters.individualUsers)
                }
                if (combinedUserIds && combinedUserIds.length > 0) {
                    query = query.in('id', combinedUserIds)
                }
            }

            const { data: recipients } = await query

            if (!recipients || recipients.length === 0) {
                toast.dismiss()
                toast.error('Nenhum destinatário encontrado')
                setSending(false)
                return
            }

            let successCount = 0
            let errorCount = 0

            // Enviar baseado no canal selecionado
            if (selectedChannel === 'notification') {
                // Inserir na tabela notifications
                for (const user of recipients) {
                    const { error } = await supabase
                        .from('notifications')
                        .insert({
                            user_id: user.id,
                            type: 'admin_broadcast',
                            title: title,
                            body: body,
                            priority: 'normal',
                            metadata: { sent_by: 'admin' }
                        })

                    if (error) {
                        errorCount++
                    } else {
                        successCount++
                    }
                }
            } else if (selectedChannel === 'chat') {
                // Usar API de system-message
                for (const user of recipients) {
                    const res = await fetch('/api/system-message', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            message: `**${title}**\n\n${body}`
                        })
                    })

                    if (res.ok) {
                        successCount++
                    } else {
                        errorCount++
                    }
                }
            } else if (selectedChannel === 'email') {
                // Usar API de email (adaptar send-emails)
                const res = await fetch('/api/admin/send-bulk-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipients: recipients.map(r => ({ email: r.email, name: r.full_name })),
                        subject: title,
                        body: body
                    })
                })

                const data = await res.json()
                if (data.success) {
                    successCount = data.emailsSent || recipients.length
                } else {
                    errorCount = recipients.length
                }
            }

            toast.dismiss()

            if (errorCount === 0) {
                toast.success(`${successCount} mensagens enviadas com sucesso!`)
                // Limpar formulário
                setTitle('')
                setBody('')
                clearFilters()
            } else {
                toast.warning(`${successCount} enviadas, ${errorCount} falharam`)
            }

        } catch (error: any) {
            toast.dismiss()
            toast.error(`Erro ao enviar: ${error.message}`)
        }

        setSending(false)
    }

    // ============================================
    // FILTRAR USUÁRIOS PARA BUSCA
    // ============================================

    const filteredUsers = searchUser.length >= 2
        ? allUsers.filter(u =>
            u.full_name.toLowerCase().includes(searchUser.toLowerCase()) &&
            !filters.individualUsers.includes(u.id)
        ).slice(0, 5)
        : []

    const selectedUsers = allUsers.filter(u => filters.individualUsers.includes(u.id))

    // ============================================
    // RENDERIZAÇÃO
    // ============================================

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-impact text-primary">Central de Mensagens</h2>
                <p className="text-muted-foreground">
                    Envie notificações, mensagens de chat e campanhas de email para a comunidade
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Coluna 1: Canal e Mensagem */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Seleção de Canal */}
                    <Card className="glass-strong border-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" />
                                Canal de Envio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-3">
                                {MESSAGE_CHANNELS.map((channel) => {
                                    const Icon = channel.icon
                                    const isSelected = selectedChannel === channel.id
                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => setSelectedChannel(channel.id)}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-primary/20 hover:border-primary/40'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-muted'}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${isSelected ? 'text-primary' : ''}`}>
                                                        {channel.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {channel.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Composição da Mensagem */}
                    <Card className="glass-strong border-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Compor Mensagem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título / Assunto</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Novidades da plataforma!"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="body">Mensagem</Label>
                                <Textarea
                                    id="body"
                                    placeholder="Digite sua mensagem aqui..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={6}
                                />
                            </div>

                            {/* Preview */}
                            {(title || body) && (
                                <div className="p-4 bg-muted/50 rounded-lg border border-primary/10">
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Preview
                                    </p>
                                    {selectedChannel === 'notification' && (
                                        <div className="flex items-start gap-3">
                                            <Bell className="w-5 h-5 text-primary mt-1" />
                                            <div>
                                                <p className="font-semibold text-sm">{title || 'Título'}</p>
                                                <p className="text-sm text-muted-foreground">{body || 'Mensagem'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedChannel === 'chat' && (
                                        <div className="bg-background rounded-lg p-3 max-w-[80%]">
                                            <p className="font-bold text-sm">{title}</p>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">{body}</p>
                                        </div>
                                    )}
                                    {selectedChannel === 'email' && (
                                        <div className="bg-white text-gray-800 rounded-lg overflow-hidden">
                                            <div className="bg-green-800 text-white p-3 text-center">
                                                <p className="font-semibold">{title || 'Assunto'}</p>
                                            </div>
                                            <div className="p-4 text-sm">
                                                <p className="whitespace-pre-wrap">{body || 'Corpo do email'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna 2: Filtros de Destinatários */}
                <div className="space-y-6">
                    {/* Filtros */}
                    <Card className="glass-strong border-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="w-5 h-5 text-primary" />
                                Destinatários
                            </CardTitle>
                            <CardDescription>
                                Selecione quem receberá a mensagem. Filtros são cumulativos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Enviar para Todos */}
                            <div
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${filters.sendToAll
                                    ? 'border-primary bg-primary/10'
                                    : 'border-primary/20 hover:border-primary/40'
                                    }`}
                                onClick={toggleSendToAll}
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox checked={filters.sendToAll} />
                                    <div>
                                        <p className="font-semibold">Todos os Usuários</p>
                                        <p className="text-xs text-muted-foreground">
                                            Enviar para toda a plataforma
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex-1 h-px bg-border"></div>
                                <span>ou filtre por</span>
                                <div className="flex-1 h-px bg-border"></div>
                            </div>

                            {/* Filtro por Pista */}
                            {pistas.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        Pistas
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {pistas.map((pista) => (
                                            <Badge
                                                key={pista.id}
                                                variant={filters.pistas.includes(pista.id) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => togglePista(pista.id)}
                                            >
                                                {pista.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filtro por Plano */}
                            {plans.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm">
                                        <CreditCard className="w-4 h-4" />
                                        Planos
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {plans.map((plan) => (
                                            <Badge
                                                key={plan.id}
                                                variant={filters.plans.includes(plan.id) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => togglePlan(plan.id)}
                                            >
                                                {plan.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filtro por Categoria */}
                            {categories.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm">
                                        <Tag className="w-4 h-4" />
                                        Categorias
                                    </Label>
                                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                        {categories.map((cat) => (
                                            <Badge
                                                key={cat.id}
                                                variant={filters.categories.includes(cat.id) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => toggleCategory(cat.id)}
                                            >
                                                {cat.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Buscar Usuário Individual */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4" />
                                    Usuário Específico
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nome..."
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        className="pl-9"
                                    />
                                    {filteredUsers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-background border rounded-lg mt-1 shadow-lg z-10">
                                            {filteredUsers.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => addUser(user.id)}
                                                    className="w-full p-2 text-left hover:bg-muted flex items-center gap-2"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm">{user.full_name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Usuários selecionados */}
                                {selectedUsers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedUsers.map((user) => (
                                            <Badge key={user.id} variant="default" className="gap-1">
                                                {user.full_name}
                                                <X
                                                    className="w-3 h-3 cursor-pointer"
                                                    onClick={() => removeUser(user.id)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Limpar Filtros */}
                            {(filters.pistas.length > 0 || filters.categories.length > 0 ||
                                filters.plans.length > 0 || filters.individualUsers.length > 0) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Limpar Filtros
                                    </Button>
                                )}
                        </CardContent>
                    </Card>

                    {/* Preview de Destinatários */}
                    <Card className="glass-strong border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Destinatários
                                {loadingPreview && <Loader2 className="w-4 h-4 animate-spin" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <p className="text-4xl font-bold text-primary">{recipientsCount}</p>
                                <p className="text-sm text-muted-foreground">
                                    {recipientsCount === 1 ? 'usuário receberá' : 'usuários receberão'}
                                </p>
                            </div>

                            {recipientsPreview.length > 0 && (
                                <div className="space-y-2 border-t pt-3 mt-3">
                                    <p className="text-xs text-muted-foreground">Prévia:</p>
                                    {recipientsPreview.slice(0, 5).map((user) => (
                                        <div key={user.id} className="flex items-center gap-2 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <span className="truncate">{user.full_name}</span>
                                        </div>
                                    ))}
                                    {recipientsCount > 5 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            e mais {recipientsCount - 5}...
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botão de Envio */}
                    <Button
                        className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                        disabled={sending || !title || !body || recipientsCount === 0}
                        onClick={handleSend}
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        Enviar Mensagem
                    </Button>
                </div>
            </div>

            {/* Dialog de Confirmação */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            Confirmar Envio
                        </DialogTitle>
                        <DialogDescription>
                            Você está prestes a enviar uma mensagem via <strong>{MESSAGE_CHANNELS.find(c => c.id === selectedChannel)?.name}</strong> para <strong>{recipientsCount}</strong> destinatário(s).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold text-sm">{title}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{body}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowConfirmDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmSend}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirmar e Enviar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
