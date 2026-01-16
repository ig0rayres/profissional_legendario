'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/api/financial'
import { Save, Edit, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
    id: string
    tier: string
    name: string
    price: number
    features: string[]
    is_active: boolean
    display_order: number
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
            is_active: plan.is_active
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
                    is_active: editForm.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', planId)

            if (error) throw error

            toast.success('Plano atualizado', {
                description: 'As alterações foram salvas com sucesso'
            })

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

    if (loading) {
        return <div className="text-muted-foreground">Carregando planos...</div>
    }

    return (
        <div className="space-y-4">
            {plans.map((plan) => {
                const isEditing = editingId === plan.id

                return (
                    <div
                        key={plan.id}
                        className="p-4 border border-primary/20 rounded-lg bg-background/50 space-y-4"
                    >
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
                                            variant="ghost"
                                            onClick={() => savePlan(plan.id)}
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
                            <div className="space-y-4">
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
                                        rows={6}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-primary">
                                    {plan.name}
                                </h3>
                                <p className="text-2xl font-bold text-primary">
                                    {formatCurrency(plan.price)}
                                    <span className="text-sm text-muted-foreground font-normal">
                                        /mês
                                    </span>
                                </p>
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
            })}
        </div>
    )
}
