'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import { Calendar, Loader2, Link2, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

interface ConfraternityButtonProps {
    targetUserId: string
    targetUserName: string
}

export function ConfraternityButton({ targetUserId, targetUserName }: ConfraternityButtonProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [canCreate, setCanCreate] = useState(false)
    const [isElo, setIsElo] = useState(false)
    const [userPlan, setUserPlan] = useState('recruta')
    const [limitsInfo, setLimitsInfo] = useState<any>(null)
    const [checkingLimits, setCheckingLimits] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        if (user) {
            checkIfElo()
            checkPlanAndLimits()
        }
    }, [user, targetUserId])

    // Verificar se o target é um Elo (conexão aceita)
    async function checkIfElo() {
        if (!user) return

        const { data } = await supabase
            .from('user_connections')
            .select('id')
            .eq('status', 'accepted')
            .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
            .single()

        setIsElo(!!data)
        console.log('[ConfraternityButton] Is Elo:', !!data)
    }

    async function checkPlanAndLimits() {
        if (!user) return
        setCheckingLimits(true)

        console.log('[ConfraternityButton] Checking plan for user:', user.id)

        // Buscar plano - TABELA CORRETA É 'subscriptions'
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

        const plan = subscription?.plan_id || 'recruta'
        setUserPlan(plan)

        console.log('[ConfraternityButton] Plan:', plan)

        // Recruta não pode enviar
        if (plan === 'recruta') {
            setCanCreate(false)
            setLimitsInfo({
                message: 'Faça upgrade para enviar convites'
            })
            setCheckingLimits(false)
            return
        }

        // Verificar limites para Veterano/Elite
        const maxInvites = plan === 'veterano' ? 4 : 10

        // Contar convites ACEITOS este mês (não enviados)
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count } = await supabase
            .from('confraternity_invites')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', user.id)
            .eq('status', 'accepted') // Apenas aceitos contam
            .gte('accepted_at', startOfMonth.toISOString())

        const used = count || 0
        const can = used < maxInvites

        console.log('[ConfraternityButton] Used:', used, 'Max:', maxInvites, 'Can:', can)

        setCanCreate(can)
        setLimitsInfo({
            used,
            max: maxInvites,
            message: can ? `${used}/${maxInvites} este mês` : 'Limite atingido'
        })
        setCheckingLimits(false)
    }

    async function requestConfraternity() {
        if (!user || !canCreate || !isElo) return

        // Redirecionar para página de confraria com destinatário preenchido
        window.location.href = `/elo-da-rota/confraria/solicitar?invite=${targetUserId}`
    }

    // Não mostrar para si mesmo
    if (user?.id === targetUserId) return null

    // Não logado
    if (!user) {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30">
                <Calendar className="w-3 h-3 mr-1" />
                CONFRARIA
            </Button>
        )
    }

    // Carregando
    if (checkingLimits) {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                CONFRARIA
            </Button>
        )
    }

    // Não é Elo - não pode convidar
    if (!isElo) {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30" title="Precisa ser Elo">
                <Calendar className="w-3 h-3 mr-1" />
                CONFRARIA
            </Button>
        )
    }

    // Recruta não pode enviar - MOSTRAR TOOLTIP COM UPGRADE
    if (userPlan === 'recruta') {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-not-allowed inline-block">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="font-bold text-[10px] h-7 px-2 border-secondary/30 opacity-70"
                            >
                                <Lock className="w-3 h-3 mr-1" />
                                CONFRARIA
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border border-white/20 text-white p-3 max-w-[200px] text-center">
                        <p className="font-bold mb-1">Recurso Bloqueado</p>
                        <p className="text-xs text-gray-300 mb-2">Apenas Veteranos e Elites podem agendar Confrarias.</p>
                        <Link href="/planos" className="block mt-1">
                            <p className="text-xs font-bold text-[#D2691E] uppercase tracking-wide hover:underline cursor-pointer hover:text-[#FF7F50] transition-colors">
                                Faça upgrade agora!
                            </p>
                        </Link>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // Se limite atingido (Veterano/Elite) - MOSTRAR TOOLTIP DE LIMITE
    if (!canCreate) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-not-allowed inline-block">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="font-bold text-[10px] h-7 px-2 border-secondary/30 opacity-70"
                            >
                                <Calendar className="w-3 h-3 mr-1" />
                                CONFRARIA
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border border-white/20 text-white p-3 max-w-[200px] text-center">
                        <p className="font-bold mb-1">Limite Atingido</p>
                        <p className="text-xs text-gray-300">{limitsInfo?.message || "Você atingiu seu limite mensal de confrarias."}</p>
                        <p className="text-xs text-gray-400 mt-1">Renova dia 1º.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // Pode criar confraria
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={requestConfraternity}
            className="font-bold text-[10px] h-7 px-2 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm"
        >
            <Calendar className="w-3 h-3 mr-1" />
            CONFRARIA
        </Button>
    )
}
