'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateCouponCode, formatCurrency } from '@/lib/api/financial'
import { Plus, X, Ticket, Calendar, Users as UsersIcon, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
    id: string
    code: string
    name: string
    description?: string
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    applicable_plans?: string[]
    min_purchase_amount?: number
    max_discount_amount?: number
    usage_limit?: number
    usage_limit_per_user: number
    current_usage_count: number
    valid_from?: string
    valid_until?: string
    is_active: boolean
    created_at: string
}

export function CouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed_amount',
        discount_value: 0,
        usage_limit_per_user: 1,
        valid_until: ''
    })
    const supabase = createClient()

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('discount_coupons')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setCoupons(data || [])
        } catch (error) {
            console.error('Error loading coupons:', error)
            toast.error('Erro ao carregar cupons', {
                description: 'Tente novamente mais tarde'
            })
        } finally {
            setLoading(false)
        }
    }

    const createCoupon = async () => {
        try {
            const { error } = await supabase
                .from('discount_coupons')
                .insert({
                    code: formData.code.toUpperCase(),
                    name: formData.name,
                    description: formData.description || null,
                    discount_type: formData.discount_type,
                    discount_value: formData.discount_value,
                    usage_limit_per_user: formData.usage_limit_per_user,
                    valid_until: formData.valid_until || null,
                    is_active: true
                })

            if (error) throw error

            toast.success('Cupom criado', {
                description: `O cupom ${formData.code} foi criado com sucesso`
            })

            setShowCreateForm(false)
            setFormData({
                code: '',
                name: '',
                description: '',
                discount_type: 'percentage',
                discount_value: 0,
                usage_limit_per_user: 1,
                valid_until: ''
            })
            loadCoupons()
        } catch (error: any) {
            console.error('Error creating coupon:', error)
            toast.error('Erro ao criar cupom', {
                description: error.message || 'Tente novamente'
            })
        }
    }

    const toggleCoupon = async (coupon: Coupon) => {
        try {
            const { error } = await supabase
                .from('discount_coupons')
                .update({ is_active: !coupon.is_active })
                .eq('id', coupon.id)

            if (error) throw error

            toast.success(coupon.is_active ? 'Cupom desativado' : 'Cupom ativado', {
                description: `O cupom ${coupon.code} foi ${coupon.is_active ? 'desativado' : 'ativado'}`
            })

            loadCoupons()
        } catch (error) {
            console.error('Error toggling coupon:', error)
            toast.error('Erro ao alterar status', {
                description: 'Tente novamente'
            })
        }
    }

    const generateRandomCode = () => {
        const code = generateCouponCode('PROMO', 6)
        setFormData({ ...formData, code })
    }

    const getCouponStatus = (coupon: Coupon) => {
        if (!coupon.is_active) return { label: 'Inativo', color: 'text-red-500' }
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
            return { label: 'Expirado', color: 'text-orange-500' }
        }
        if (coupon.usage_limit && coupon.current_usage_count >= coupon.usage_limit) {
            return { label: 'Esgotado', color: 'text-yellow-500' }
        }
        return { label: 'Ativo', color: 'text-green-500' }
    }

    if (loading) {
        return <div className="text-muted-foreground">Carregando cupons...</div>
    }

    return (
        <div className="space-y-4">
            {/* Create Button */}
            {!showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Novo Cupom
                </Button>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="p-4 border border-primary/20 rounded-lg bg-background/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-primary">Novo Cupom</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCreateForm(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Código do Cupom *</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                    }
                                    placeholder="PROMO2024"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateRandomCode}
                                >
                                    Gerar
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label>Nome do Cupom *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Promoção de Boas-Vindas"
                            />
                        </div>

                        <div>
                            <Label>Tipo de Desconto *</Label>
                            <Select
                                value={formData.discount_type}
                                onValueChange={(value: 'percentage' | 'fixed_amount') =>
                                    setFormData({ ...formData, discount_type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                    <SelectItem value="fixed_amount">Valor Fixo (R$)</SelectItem>
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
                            <Label>Limite de Uso por Usuário</Label>
                            <Input
                                type="number"
                                value={formData.usage_limit_per_user}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        usage_limit_per_user: parseInt(e.target.value) || 1
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Válido Até</Label>
                            <Input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) =>
                                    setFormData({ ...formData, valid_until: e.target.value })
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
                            placeholder="Descrição opcional do cupom"
                            rows={3}
                        />
                    </div>

                    <Button onClick={createCoupon} className="w-full">
                        Criar Cupom
                    </Button>
                </div>
            )}

            {/* Coupons List */}
            {coupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    Nenhum cupom cadastrado ainda
                </div>
            ) : (
                <div className="space-y-3">
                    {coupons.map((coupon) => {
                        const status = getCouponStatus(coupon)

                        return (
                            <div
                                key={coupon.id}
                                className="p-4 border border-primary/20 rounded-lg bg-background/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-5 h-5 text-primary" />
                                            <code className="text-lg font-bold text-primary">
                                                {coupon.code}
                                            </code>
                                            <Badge variant="outline" className={status.color}>
                                                {status.label}
                                            </Badge>
                                        </div>

                                        <p className="text-sm font-medium">{coupon.name}</p>
                                        {coupon.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {coupon.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span>
                                                    {coupon.discount_type === 'percentage'
                                                        ? `${coupon.discount_value}% de desconto`
                                                        : `${formatCurrency(coupon.discount_value)} de desconto`}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <UsersIcon className="w-4 h-4" />
                                                <span>
                                                    {coupon.current_usage_count} usos
                                                    {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                                                </span>
                                            </div>

                                            {coupon.valid_until && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        Expira:{' '}
                                                        {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleCoupon(coupon)}
                                    >
                                        {coupon.is_active ? 'Desativar' : 'Ativar'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
