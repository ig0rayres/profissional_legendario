'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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

    // Recruta não pode enviar
    if (userPlan === 'recruta') {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30" title="Upgrade para enviar">
                <Lock className="w-3 h-3 mr-1" />
                CONFRARIA
            </Button>
        )
    }

    // Pode criar confraria
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={requestConfraternity}
            disabled={!canCreate}
            className="font-bold text-[10px] h-7 px-2 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm"
        >
            <Calendar className="w-3 h-3 mr-1" />
            CONFRARIA
        </Button>
    )
}
