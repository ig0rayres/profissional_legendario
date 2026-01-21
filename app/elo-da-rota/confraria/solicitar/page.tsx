'use client'

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth/context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Swords, Search, Link2, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { ConfraternityInviteForm } from '@/components/confraternity/ConfraternityInviteForm'

interface EloProfile {
    id: string
    full_name: string
    email: string
    slug: string | null
    rank_id: string
    rank_name: string
}

export default function SolicitarConfrariaPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedId = searchParams.get('invite')

    const [elos, setElos] = useState<EloProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [userPlan, setUserPlan] = useState<string>('recruta')
    const [limitsInfo, setLimitsInfo] = useState<any>(null)
    const [canSendInvites, setCanSendInvites] = useState(false)
    const [userName, setUserName] = useState('')

    // Estado do modal do formulário
    const [showForm, setShowForm] = useState(false)
    const [selectedElo, setSelectedElo] = useState<EloProfile | null>(null)

    const supabase = createClient()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            loadElosOnly()
            checkUserPlanAndLimits()
            loadUserName()
        }
    }, [user, authLoading])

    // Auto-abrir formulário se vier com ?invite=
    useEffect(() => {
        if (preselectedId && elos.length > 0) {
            const preselected = elos.find(e => e.id === preselectedId)
            if (preselected) {
                setSelectedElo(preselected)
                setShowForm(true)
            }
        }
    }, [preselectedId, elos])

    const loadUserName = async () => {
        if (!user) return
        const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
        setUserName(data?.full_name || '')
    }

    // Carregar APENAS usuários que são Elos (conexões aceitas)
    const loadElosOnly = async () => {
        if (!user) return
        setLoading(true)

        // Buscar conexões aceitas
        const { data: connections } = await supabase
            .from('user_connections')
            .select('requester_id, addressee_id')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

        if (!connections || connections.length === 0) {
            setElos([])
            setLoading(false)
            return
        }

        // Pegar IDs dos elos
        const eloIds = connections.map(conn =>
            conn.requester_id === user.id ? conn.addressee_id : conn.requester_id
        )

        // Buscar perfis dos elos
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, slug')
            .in('id', eloIds)

        if (!profiles || profiles.length === 0) {
            setElos([])
            setLoading(false)
            return
        }

        // Buscar patentes
        const { data: gamificationData } = await supabase
            .from('user_gamification')
            .select('user_id, rank_id, ranks(name)')
            .in('user_id', eloIds)

        const rankMap = new Map<string, { rank_id: string, name: string }>()
        gamificationData?.forEach((g: any) => {
            rankMap.set(g.user_id, {
                rank_id: g.rank_id || 'novato',
                name: g.ranks?.name || 'Novato'
            })
        })

        setElos(profiles.map(p => ({
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            slug: p.slug,
            rank_id: rankMap.get(p.id)?.rank_id || 'novato',
            rank_name: rankMap.get(p.id)?.name || 'Novato'
        })))

        setLoading(false)
    }

    const checkUserPlanAndLimits = async () => {
        if (!user) return

        // Buscar plano da subscription
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

        const plan = subscription?.plan_id || 'recruta'
        setUserPlan(plan)

        // Recruta NÃO pode enviar convites de confraria
        if (plan === 'recruta') {
            setCanSendInvites(false)
            setLimitsInfo({
                canSend: false,
                plan: plan,
                maxInvites: 0,
                used: 0,
                message: 'Recrutas não podem enviar convites de confraria. Faça upgrade!'
            })
            return
        }

        // Veterano/Elite podem enviar
        const maxInvites = plan === 'veterano' ? 4 : 10

        // Contar convites ACEITOS este mês
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count } = await supabase
            .from('confraternity_invites')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', user.id)
            .eq('status', 'accepted')
            .gte('accepted_at', startOfMonth.toISOString())

        const used = count || 0
        const canCreate = used < maxInvites

        setCanSendInvites(canCreate)
        setLimitsInfo({
            canSend: canCreate,
            plan: plan,
            maxInvites: maxInvites,
            used: used,
            message: canCreate
                ? `${used}/${maxInvites} convites usados este mês`
                : 'Limite mensal atingido'
        })
    }

    const handleOpenForm = (elo: EloProfile) => {
        setSelectedElo(elo)
        setShowForm(true)
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setSelectedElo(null)

        // Redirecionar para o dashboard após 1 segundo
        setTimeout(() => {
            router.push('/dashboard')
        }, 1000)
    }

    const filteredElos = elos.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-adventure flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-adventure">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <Link href="/elo-da-rota">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Swords className="h-6 w-6 text-primary" />
                            Solicitar Confraria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Info de limites */}
                        {limitsInfo && (
                            <div className={`p-4 rounded-lg ${userPlan === 'recruta'
                                ? 'bg-red-50 dark:bg-red-950/30 border border-red-200'
                                : 'bg-primary/5 border border-primary/20'
                                }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {userPlan === 'recruta' ? (
                                        <Lock className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <Swords className="h-4 w-4 text-primary" />
                                    )}
                                    <p className="text-sm font-bold uppercase">
                                        Plano: {limitsInfo.plan}
                                    </p>
                                </div>
                                <p className={`text-sm ${userPlan === 'recruta' ? 'text-red-600' : 'text-primary'}`}>
                                    {limitsInfo.message}
                                </p>
                                {userPlan === 'recruta' && (
                                    <Link href="/planos">
                                        <Button size="sm" className="mt-2">
                                            Fazer Upgrade
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Aviso: Só Elos */}
                        <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-secondary" />
                            <p className="text-sm">
                                Você só pode convidar usuários que são seus <strong className="text-secondary">Elos</strong>
                            </p>
                        </div>

                        {/* Busca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Buscar Elo por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Elos */}
                <div className="space-y-3">
                    {filteredElos.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="font-medium">Nenhum Elo encontrado</p>
                                <p className="text-sm mt-2">
                                    Você precisa ter Elos (conexões aceitas) para enviar convites de confraria.
                                </p>
                                <Link href="/professionals">
                                    <Button variant="outline" className="mt-4">
                                        Encontrar Profissionais
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredElos.map((elo) => (
                            <Card key={elo.id} className={`transition-all hover:border-primary/30 ${preselectedId === elo.id ? 'ring-2 ring-primary' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar com Patente */}
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-primary">
                                                        {elo.full_name?.[0]?.toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1" title={elo.rank_name}>
                                                    <RankInsignia rankId={elo.rank_id} size="sm" variant="icon-only" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{elo.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{elo.email}</p>
                                                <div className="flex items-center gap-1 text-xs text-primary">
                                                    <Link2 className="h-3 w-3" />
                                                    <span>Elo da Rota</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleOpenForm(elo)}
                                            disabled={!canSendInvites}
                                            size="sm"
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Swords className="h-4 w-4 mr-2" />
                                            Convidar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Modal com Formulário Completo */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {selectedElo && user && (
                        <ConfraternityInviteForm
                            receiverId={selectedElo.id}
                            receiverName={selectedElo.full_name}
                            currentUserId={user.id}
                            currentUserName={userName}
                            remainingInvites={(limitsInfo?.maxInvites || 0) - (limitsInfo?.used || 0)}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setShowForm(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
