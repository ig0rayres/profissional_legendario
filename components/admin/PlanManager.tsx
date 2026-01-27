'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { formatCurrency } from '@/lib/api/financial'
import { clearPlanCache } from '@/lib/services/plan-service'
import { Save, Edit, Check, X, Zap, Link2, Users, ShoppingBag, Infinity, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
    id: string
    tier: string
    name: string
    price: number
    features: string[]
    xp_multiplier: number
    max_elos: number | null
    max_confraternities_month: number
    can_send_confraternity: boolean
    max_marketplace_ads: number
    can_send_elo: boolean
    is_active: boolean
    display_order: number
    // Campos Stripe
    stripe_product_id?: string | null
    stripe_price_id?: string | null
}

export function PlanManager() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<Plan>>({})
    const supabase = createClient()

    useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('plan_config')
                .select('*')
                .order('display_order')

            if (error) throw error
            setPlans(data || [])
        } catch (error) {
            console.error('Error loading plans:', error)
            toast.error('Erro ao carregar planos', {
                description: 'Tente novamente mais tarde'
            })
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (plan: Plan) => {
        setEditingId(plan.id)
        setEditForm({
            name: plan.name,
            price: plan.price,
            features: plan.features,
            xp_multiplier: plan.xp_multiplier,
            max_elos: plan.max_elos,
            max_confraternities_month: plan.max_confraternities_month,
            can_send_confraternity: plan.can_send_confraternity,
            max_marketplace_ads: plan.max_marketplace_ads,
            is_active: plan.is_active,
            stripe_product_id: plan.stripe_product_id,
            stripe_price_id: plan.stripe_price_id
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const savePlan = async (planId: string) => {
        try {
            const { error } = await supabase
                .from('plan_config')
                .update({
                    name: editForm.name,
                    price: editForm.price,
                    features: editForm.features,
                    xp_multiplier: editForm.xp_multiplier,
                    max_elos: editForm.max_elos,
                    max_confraternities_month: editForm.max_confraternities_month,
                    can_send_confraternity: editForm.can_send_confraternity,
                    max_marketplace_ads: editForm.max_marketplace_ads,
                    is_active: editForm.is_active,
                    stripe_product_id: editForm.stripe_product_id || null,
                    stripe_price_id: editForm.stripe_price_id || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', planId)

            if (error) throw error

            toast.success('Plano atualizado', {
                description: 'As alterações foram salvas com sucesso'
            })

            // Limpa cache para propagar alterações em toda plataforma
            clearPlanCache()

            setEditingId(null)
            setEditForm({})
            loadPlans()
        } catch (error) {
            console.error('Error saving plan:', error)
            toast.error('Erro ao salvar plano', {
                description: 'Tente novamente'
            })
        }
    }

    const toggleActive = async (plan: Plan) => {
        try {
            const { error } = await supabase
                .from('plan_config')
                .update({
                    is_active: !plan.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', plan.id)

            if (error) throw error

            toast.success(plan.is_active ? 'Plano desativado' : 'Plano ativado', {
                description: `O plano ${plan.name} foi ${plan.is_active ? 'desativado' : 'ativado'}`
            })

            loadPlans()
        } catch (error) {
            console.error('Error toggling plan:', error)
            toast.error('Erro ao alterar status', {
                description: 'Tente novamente'
            })
        }
    }

    // Estado para criar novo plano
    const [isCreating, setIsCreating] = useState(false)
    const [featuresText, setFeaturesText] = useState('') // String para textarea
    const [newPlan, setNewPlan] = useState<Partial<Plan>>({
        tier: '',
        name: '',
        price: 0,
        features: [],
        xp_multiplier: 1,
        max_elos: null,
        max_confraternities_month: 0,
        can_send_confraternity: false,
        max_marketplace_ads: 0,
        can_send_elo: false,
        is_active: true,
        display_order: 0
    })

    const createPlan = async () => {
        if (!newPlan.tier || !newPlan.name) {
            toast.error('Preencha tier e nome do plano')
            return
        }

        try {
            // Pegar próximo display_order
            const maxOrder = plans.length > 0 ? Math.max(...plans.map(p => p.display_order)) : 0

            const { error } = await supabase
                .from('plan_config')
                .insert({
                    tier: newPlan.tier?.toLowerCase(),
                    name: newPlan.name,
                    price: newPlan.price || 0,
                    features: featuresText.split('\n').filter(f => f.trim()),
                    xp_multiplier: newPlan.xp_multiplier || 1,
                    max_elos: newPlan.max_elos,
                    max_confraternities_month: newPlan.max_confraternities_month || 0,
                    can_send_confraternity: newPlan.can_send_confraternity || false,
                    max_marketplace_ads: newPlan.max_marketplace_ads || 0,
                    can_send_elo: newPlan.can_send_elo || false,
                    is_active: newPlan.is_active ?? true,
                    display_order: maxOrder + 1,
                    stripe_product_id: null,
                    stripe_price_id: null
                })

            if (error) throw error

            toast.success('Plano criado!', {
                description: `O plano ${newPlan.name} foi criado com sucesso`
            })

            setIsCreating(false)
            setFeaturesText('')
            setNewPlan({
                tier: '',
                name: '',
                price: 0,
                features: [],
                xp_multiplier: 1,
                max_elos: null,
                max_confraternities_month: 0,
                can_send_confraternity: false,
                max_marketplace_ads: 0,
                can_send_elo: false,
                is_active: true,
                display_order: 0
            })
            loadPlans()
        } catch (error) {
            console.error('Error creating plan:', error)
            toast.error('Erro ao criar plano', {
                description: 'Verifique os dados e tente novamente'
            })
        }
    }

    if (loading) {
        return <div className="text-muted-foreground">Carregando planos...</div>
    }

    return (
        <div className="space-y-6">
            {/* Botão Criar Novo Plano */}
            {!isCreating ? (
                <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Criar Novo Plano
                </Button>
            ) : (
                <div className="p-6 border-2 border-green-500/50 rounded-lg bg-green-500/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-green-500">Criar Novo Plano</h3>
                        <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Tier e Nome */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Tier (identificador único)</Label>
                            <Input
                                placeholder="ex: lendario"
                                value={newPlan.tier || ''}
                                onChange={(e) => setNewPlan({ ...newPlan, tier: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Nome do Plano</Label>
                            <Input
                                placeholder="ex: LENDÁRIO"
                                value={newPlan.name || ''}
                                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Preço (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newPlan.price || 0}
                                onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Limites com opção Ilimitado */}
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <Label className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                Multiplicador XP
                            </Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="1"
                                value={newPlan.xp_multiplier || 1}
                                onChange={(e) => setNewPlan({ ...newPlan, xp_multiplier: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label className="flex items-center gap-1">
                                <Link2 className="w-4 h-4 text-blue-500" />
                                Elos Máximos
                            </Label>
                            <Input
                                type="number"
                                placeholder="Vazio = Ilimitado"
                                value={newPlan.max_elos ?? ''}
                                onChange={(e) => setNewPlan({ ...newPlan, max_elos: e.target.value ? parseInt(e.target.value) : null })}
                            />
                        </div>
                        <div>
                            <Label className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-green-500" />
                                Confrarias/Mês
                            </Label>
                            <Input
                                type="number"
                                placeholder="Vazio = Ilimitado"
                                value={newPlan.max_confraternities_month ?? ''}
                                onChange={(e) => setNewPlan({ ...newPlan, max_confraternities_month: e.target.value ? parseInt(e.target.value) : null })}
                            />
                        </div>
                        <div>
                            <Label className="flex items-center gap-1">
                                <ShoppingBag className="w-4 h-4 text-purple-500" />
                                Anúncios Mkt
                            </Label>
                            <Input
                                type="number"
                                placeholder="Vazio = Ilimitado"
                                value={newPlan.max_marketplace_ads ?? ''}
                                onChange={(e) => setNewPlan({ ...newPlan, max_marketplace_ads: e.target.value ? parseInt(e.target.value) : null })}
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={newPlan.can_send_confraternity || false}
                                onCheckedChange={(checked) => setNewPlan({ ...newPlan, can_send_confraternity: checked })}
                            />
                            <Label>Pode criar confraria</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={newPlan.can_send_elo || false}
                                onCheckedChange={(checked) => setNewPlan({ ...newPlan, can_send_elo: checked })}
                            />
                            <Label>Pode enviar elo</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={newPlan.is_active ?? true}
                                onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_active: checked })}
                            />
                            <Label>Ativo</Label>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <Label>Features (uma por linha - pressione Enter para nova linha)</Label>
                        <Textarea
                            placeholder={"Acesso ilimitado a todas as funcionalidades\nSuporte prioritário 24/7\nBadge exclusiva LENDÁRIO"}
                            value={featuresText}
                            onChange={(e) => setFeaturesText(e.target.value)}
                            rows={6}
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2">
                        <Button onClick={createPlan} className="bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4 mr-1" />
                            Criar Plano
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {plans.map((plan) => {
                const isEditing = editingId === plan.id

                return (
                    <div
                        key={plan.id}
                        className="p-6 border border-primary/20 rounded-lg bg-background/50 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        plan.tier === 'elite'
                                            ? 'default'
                                            : plan.tier === 'veterano'
                                                ? 'secondary'
                                                : 'outline'
                                    }
                                    className="text-sm px-3 py-1"
                                >
                                    {plan.tier.toUpperCase()}
                                </Badge>
                                {plan.is_active ? (
                                    <Badge variant="outline" className="border-green-500 text-green-500">
                                        Ativo
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-red-500 text-red-500">
                                        Inativo
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() => savePlan(plan.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Salvar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={cancelEdit}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancelar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => startEdit(plan)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleActive(plan)}
                                        >
                                            {plan.is_active ? 'Desativar' : 'Ativar'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            /* Modo Edição */
                            <div className="grid gap-6">
                                {/* Linha 1: Nome e Preço */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nome do Plano</Label>
                                        <Input
                                            value={editForm.name || ''}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Preço (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editForm.price || 0}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    price: parseFloat(e.target.value)
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Linha 2: Limites */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <Label className="flex items-center gap-1">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            Multiplicador XP
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="10"
                                            value={editForm.xp_multiplier || 1}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    xp_multiplier: parseFloat(e.target.value)
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-1">
                                            <Link2 className="w-4 h-4 text-blue-500" />
                                            Elos Máximos
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="Vazio = Ilimitado"
                                            value={editForm.max_elos ?? ''}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    max_elos: e.target.value ? parseInt(e.target.value) : null
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-1">
                                            <Users className="w-4 h-4 text-green-500" />
                                            Confrarias/Mês
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="Vazio = Ilimitado"
                                            value={editForm.max_confraternities_month ?? ''}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    max_confraternities_month: e.target.value ? parseInt(e.target.value) : null
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-1">
                                            <ShoppingBag className="w-4 h-4 text-purple-500" />
                                            Anúncios Mkt
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="Vazio = Ilimitado"
                                            value={editForm.max_marketplace_ads ?? ''}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    max_marketplace_ads: e.target.value ? parseInt(e.target.value) : null
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Linha 3: Toggles */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={editForm.can_send_confraternity || false}
                                            onCheckedChange={(checked) =>
                                                setEditForm({ ...editForm, can_send_confraternity: checked })
                                            }
                                        />
                                        <Label>Pode enviar confraria</Label>
                                    </div>
                                </div>

                                {/* Linha 4: Integração Stripe */}
                                <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CreditCard className="w-5 h-5 text-orange-500" />
                                        <Label className="text-orange-500 font-semibold">Integração Stripe</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Product ID</Label>
                                            <Input
                                                placeholder="prod_XXXX..."
                                                value={editForm.stripe_product_id || ''}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        stripe_product_id: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Price ID</Label>
                                            <Input
                                                placeholder="price_XXXX..."
                                                value={editForm.stripe_price_id || ''}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        stripe_price_id: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Copie os IDs do Stripe Dashboard → Products
                                    </p>
                                </div>

                                {/* Linha 5: Features */}
                                <div>
                                    <Label>Features (uma por linha)</Label>
                                    <Textarea
                                        value={(editForm.features || []).join('\n')}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                features: e.target.value.split('\n').filter(f => f.trim())
                                            })
                                        }
                                        rows={4}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Modo Visualização */
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-4">
                                    <h3 className="text-2xl font-bold text-primary">
                                        {plan.name}
                                    </h3>
                                    <p className="text-3xl font-black text-primary">
                                        {formatCurrency(plan.price)}
                                        <span className="text-sm text-muted-foreground font-normal">
                                            /mês
                                        </span>
                                    </p>
                                </div>

                                {/* Cards de Limites */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                        <div className="flex items-center gap-2 text-yellow-600 mb-1">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-xs font-medium">Multiplicador XP</span>
                                        </div>
                                        <p className="text-xl font-bold">{plan.xp_multiplier}x</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                                            <Link2 className="w-4 h-4" />
                                            <span className="text-xs font-medium">Elos Máximos</span>
                                        </div>
                                        <p className="text-xl font-bold flex items-center gap-1">
                                            {plan.max_elos === null ? (
                                                <><Infinity className="w-5 h-5" /> Ilimitado</>
                                            ) : (
                                                plan.max_elos
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <div className="flex items-center gap-2 text-green-600 mb-1">
                                            <Users className="w-4 h-4" />
                                            <span className="text-xs font-medium">Confrarias/Mês</span>
                                        </div>
                                        <p className="text-xl font-bold flex items-center gap-1">
                                            {plan.max_confraternities_month === null || plan.max_confraternities_month === 0 ? (
                                                <><Infinity className="w-5 h-5" /> Ilimitado</>
                                            ) : (
                                                plan.max_confraternities_month
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                                            <ShoppingBag className="w-4 h-4" />
                                            <span className="text-xs font-medium">Anúncios Mkt</span>
                                        </div>
                                        <p className="text-xl font-bold flex items-center gap-1">
                                            {plan.max_marketplace_ads === null || plan.max_marketplace_ads === 0 ? (
                                                <><Infinity className="w-5 h-5" /> Ilimitado</>
                                            ) : (
                                                plan.max_marketplace_ads
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Features:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {plan.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="text-sm text-muted-foreground"
                                            >
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })
            }
        </div >
    )
}
