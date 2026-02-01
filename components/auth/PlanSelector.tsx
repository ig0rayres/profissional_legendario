'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Sparkles, Shield, Star, Crown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
    id: string
    name: string
    monthly_price: number
    features: string[]
    display_order: number
}

interface PlanSelectorProps {
    plans: Plan[]
    value: string
    onChange: (planId: string) => void
    disabled?: boolean
}

// Configuração de ícones por tier - V6 Home Style (Verde + Laranja Elite)
const TIER_CONFIG: Record<string, {
    icon: any
    description: string
    highlight?: string
}> = {
    recruta: {
        icon: Shield,
        description: 'O início da sua jornada na guilda. Explore os recursos básicos da plataforma.',
    },
    veterano: {
        icon: Sparkles,
        description: 'Para quem já provou seu valor no campo. Amplie suas conexões e oportunidades.',
    },
    elite: {
        icon: Star,
        description: 'A força máxima da elite de negócios. Maximize seu potencial de networking.',
        highlight: 'MAIS POPULAR'
    },
    lendario: {
        icon: Crown,
        description: 'O topo absoluto. Lendas nunca são esquecidas. Acesso ilimitado a tudo.',
    }
}

export function PlanSelector({ plans, value, onChange, disabled }: PlanSelectorProps) {
    if (!plans || plans.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum plano disponível no momento</p>
            </div>
        )
    }

    const selectedPlan = plans.find(p => p.id === value)
    const config = selectedPlan ? (TIER_CONFIG[selectedPlan.id] || TIER_CONFIG.recruta) : null

    return (
        <div className="space-y-4">
            {/* Dropdown de seleção */}
            <Select
                onValueChange={onChange}
                value={value}
                disabled={disabled}
            >
                <SelectTrigger className="w-full h-14 text-base font-medium bg-white border-gray-200">
                    <SelectValue placeholder="Selecione um plano..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    {plans.map((plan) => {
                        const planConfig = TIER_CONFIG[plan.id] || TIER_CONFIG.recruta
                        const Icon = planConfig.icon
                        const isElite = plan.id === 'elite'

                        return (
                            <SelectItem
                                key={plan.id}
                                value={plan.id}
                                className="py-3 cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        isElite
                                            ? "bg-[#D2691E] text-white"
                                            : "bg-[#1E4D40] text-white"
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{plan.name}</span>
                                        {plan.monthly_price === 0 ? (
                                            <span className="text-xs text-gray-500 font-medium">GRÁTIS</span>
                                        ) : (
                                            <span className="text-sm text-gray-600">
                                                R$ {plan.monthly_price.toFixed(0)}/mês
                                            </span>
                                        )}
                                        {planConfig.highlight && isElite && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#D2691E] text-white">
                                                {planConfig.highlight}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>

            {/* Detalhes do plano selecionado */}
            {selectedPlan && config && (
                <Card className={cn(
                    "relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-2",
                    "bg-white border shadow-md",
                    selectedPlan.id === 'elite' && [
                        "border-[#D2691E] border-2 shadow-lg"
                    ],
                    selectedPlan.id !== 'elite' && "border-gray-200"
                )}>
                    {/* Badge de destaque - APENAS ELITE */}
                    {config.highlight && selectedPlan.id === 'elite' && (
                        <div className="absolute -top-1 right-4">
                            <div className="px-3 py-1 text-xs font-bold text-white rounded-b-lg shadow-md bg-[#D2691E]">
                                {config.highlight}
                            </div>
                        </div>
                    )}

                    <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                            {/* Ícone grande */}
                            <div className={cn(
                                "p-4 rounded-2xl shadow-md flex-shrink-0",
                                selectedPlan.id === 'elite'
                                    ? "bg-[#D2691E]"
                                    : "bg-[#1E4D40]"
                            )}>
                                {(() => {
                                    const Icon = config.icon
                                    return <Icon className="w-8 h-8 text-white" />
                                })()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                                    <CardTitle className={cn(
                                        "text-2xl font-bold",
                                        selectedPlan.id === 'elite' ? "text-[#D2691E]" : "text-gray-900"
                                    )}>
                                        {selectedPlan.name.toUpperCase()}
                                    </CardTitle>
                                    <div className="flex items-baseline gap-1 whitespace-nowrap">
                                        <span className={cn(
                                            "text-3xl font-bold",
                                            selectedPlan.id === 'elite' ? "text-[#D2691E]" : "text-gray-900"
                                        )}>
                                            {selectedPlan.monthly_price === 0
                                                ? 'Grátis'
                                                : `R$ ${selectedPlan.monthly_price.toFixed(0)}`
                                            }
                                        </span>
                                        {selectedPlan.monthly_price > 0 && (
                                            <span className="text-sm text-gray-500">/mês</span>
                                        )}
                                    </div>
                                </div>
                                <CardDescription className="text-sm leading-relaxed text-gray-600">
                                    {config.description}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                        {/* Features */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                O que está incluído:
                            </p>
                            <ul className="grid gap-2">
                                {selectedPlan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className={cn(
                                            "mt-0.5 rounded-full flex-shrink-0 p-0.5",
                                            selectedPlan.id === 'elite'
                                                ? "bg-[#D2691E]/10"
                                                : "bg-[#1E4D40]/10"
                                        )}>
                                            <Check className={cn(
                                                "w-4 h-4",
                                                selectedPlan.id === 'elite'
                                                    ? "text-[#D2691E]"
                                                    : "text-[#1E4D40]"
                                            )} />
                                        </div>
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Call to action visual - APENAS ELITE */}
                        {selectedPlan.id === 'elite' && (
                            <div className="mt-6 p-4 bg-[#D2691E]/5 border border-[#D2691E]/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Star className="w-5 h-5 text-[#D2691E] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#D2691E]">
                                            Escolha da Maioria
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            O plano mais vendido entre profissionais de sucesso.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grátis CTA */}
                        {selectedPlan.monthly_price === 0 && (
                            <div className="mt-6 p-4 bg-[#1E4D40]/5 border border-[#1E4D40]/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-[#1E4D40] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#1E4D40]">
                                            Comece agora mesmo
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Sem necessidade de cartão de crédito. Faça upgrade a qualquer momento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Mensagem se nenhum plano selecionado */}
            {!selectedPlan && (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Selecione um plano para ver os detalhes</p>
                </div>
            )}
        </div>
    )
}
