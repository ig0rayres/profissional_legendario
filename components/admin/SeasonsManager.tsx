'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Trophy, Crown, Medal, Award, Calendar, Users, Loader2,
    RefreshCw, Edit, Check, Send, Gift, Clock, TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface Season {
    id: string
    name: string
    year: number
    month: number
    start_date: string
    end_date: string
    status: 'upcoming' | 'active' | 'finished'
    created_at: string
    finished_at: string | null
}

interface SeasonPrize {
    id: string
    season_id: string
    position: number
    title: string
    description: string | null
    image_url: string | null
}

interface RankingUser {
    ranking_position: number
    user_id: string
    full_name: string
    avatar_url: string | null
    slug: string
    patente: string
    xp_month: number
}

interface SeasonWinner {
    id: string
    user_id: string
    position: number
    xp_earned: number
    user?: { full_name: string, avatar_url: string | null }
}

export function SeasonsManager() {
    const [loading, setLoading] = useState(true)
    const [seasons, setSeasons] = useState<Season[]>([])
    const [activeSeason, setActiveSeason] = useState<Season | null>(null)
    const [prizes, setPrizes] = useState<SeasonPrize[]>([])
    const [ranking, setRanking] = useState<RankingUser[]>([])
    const [winners, setWinners] = useState<SeasonWinner[]>([])
    const [activeTab, setActiveTab] = useState('current')

    // Edição de prêmio
    const [editingPrize, setEditingPrize] = useState<SeasonPrize | null>(null)
    const [prizeTitle, setPrizeTitle] = useState('')
    const [prizeDescription, setPrizeDescription] = useState('')
    const [savingPrize, setSavingPrize] = useState(false)

    // Encerrar temporada
    const [showFinishDialog, setShowFinishDialog] = useState(false)
    const [finishing, setFinishing] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Carregar temporadas
            const { data: seasonsData } = await supabase
                .from('seasons')
                .select('*')
                .order('year', { ascending: false })
                .order('month', { ascending: false })

            setSeasons(seasonsData || [])

            // Temporada ativa
            const active = seasonsData?.find(s => s.status === 'active')
            setActiveSeason(active || null)

            if (active) {
                await loadSeasonData(active.id)
            }
        } finally {
            setLoading(false)
        }
    }

    const loadSeasonData = async (seasonId: string) => {
        // Prêmios
        const { data: prizesData } = await supabase
            .from('season_prizes')
            .select('*')
            .eq('season_id', seasonId)
            .order('position')

        setPrizes(prizesData || [])

        // Ranking
        const { data: rankingData } = await supabase
            .rpc('get_season_ranking', { p_season_id: seasonId, p_limit: 20 })

        setRanking(rankingData || [])

        // Vencedores (se finalizada)
        const { data: winnersData } = await supabase
            .from('season_winners')
            .select(`*, user:profiles!user_id(full_name, avatar_url)`)
            .eq('season_id', seasonId)
            .order('position')

        setWinners(winnersData || [])
    }

    const openEditPrize = (prize: SeasonPrize) => {
        setEditingPrize(prize)
        setPrizeTitle(prize.title)
        setPrizeDescription(prize.description || '')
    }

    const savePrize = async () => {
        if (!editingPrize) return

        setSavingPrize(true)
        try {
            const { error } = await supabase
                .from('season_prizes')
                .update({
                    title: prizeTitle,
                    description: prizeDescription,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingPrize.id)

            if (error) throw error

            toast.success('Prêmio atualizado!')
            setEditingPrize(null)

            if (activeSeason) {
                await loadSeasonData(activeSeason.id)
            }
        } catch (error) {
            console.error('Error saving prize:', error)
            toast.error('Erro ao salvar')
        } finally {
            setSavingPrize(false)
        }
    }

    const finishSeason = async () => {
        if (!activeSeason || ranking.length < 3) {
            toast.error('Precisa de pelo menos 3 participantes no ranking')
            return
        }

        setFinishing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Registrar vencedores
            const top3 = ranking.slice(0, 3)
            for (const [index, winner] of top3.entries()) {
                const prize = prizes.find(p => p.position === index + 1)

                await supabase
                    .from('season_winners')
                    .insert({
                        season_id: activeSeason.id,
                        user_id: winner.user_id,
                        position: index + 1,
                        xp_earned: winner.xp_month,
                        prize_id: prize?.id
                    })
            }

            // 2. Atualizar status da temporada
            await supabase
                .from('seasons')
                .update({
                    status: 'finished',
                    finished_at: new Date().toISOString(),
                    finished_by: user?.id
                })
                .eq('id', activeSeason.id)

            // 3. Criar próxima temporada
            const nextMonth = activeSeason.month === 12 ? 1 : activeSeason.month + 1
            const nextYear = activeSeason.month === 12 ? activeSeason.year + 1 : activeSeason.year
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

            const startDate = new Date(nextYear, nextMonth - 1, 1)
            const endDate = new Date(nextYear, nextMonth, 0)

            const { data: newSeason } = await supabase
                .from('seasons')
                .insert({
                    name: `${monthNames[nextMonth]} ${nextYear}`,
                    year: nextYear,
                    month: nextMonth,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    status: 'active',
                    created_by: user?.id
                })
                .select()
                .single()

            // 4. Criar prêmios para nova temporada
            if (newSeason) {
                await supabase.from('season_prizes').insert([
                    { season_id: newSeason.id, position: 1, title: '🥇 1º Lugar', description: 'Prêmio a definir' },
                    { season_id: newSeason.id, position: 2, title: '🥈 2º Lugar', description: 'Prêmio a definir' },
                    { season_id: newSeason.id, position: 3, title: '🥉 3º Lugar', description: 'Prêmio a definir' }
                ])
            }

            // 5. Criar notificações para vencedores
            for (const [index, winner] of top3.entries()) {
                await supabase.from('notifications').insert({
                    user_id: winner.user_id,
                    type: 'season_winner',
                    title: `🏆 Parabéns! Você ficou em ${index + 1}º lugar!`,
                    body: `Você conquistou o ${index + 1}º lugar na temporada ${activeSeason.name} com ${winner.xp_month} XP!`,
                    metadata: { season_id: activeSeason.id, position: index + 1 }
                })
            }

            toast.success('Temporada encerrada!', {
                description: 'Vencedores registrados e nova temporada criada'
            })

            setShowFinishDialog(false)
            await loadData()

        } catch (error) {
            console.error('Error finishing season:', error)
            toast.error('Erro ao encerrar temporada')
        } finally {
            setFinishing(false)
        }
    }

    const sendSeasonEmails = async () => {
        try {
            const response = await fetch('/api/seasons/send-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seasonId: activeSeason?.id,
                    type: 'new_season'
                })
            })

            if (response.ok) {
                toast.success('Emails enviados!', {
                    description: 'Toda a base foi notificada'
                })
            } else {
                toast.error('Erro ao enviar emails')
            }
        } catch (error) {
            console.error('Error sending emails:', error)
            toast.error('Erro ao enviar emails')
        }
    }

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown className="w-5 h-5 text-yellow-500" />
            case 2: return <Medal className="w-5 h-5 text-gray-400" />
            case 3: return <Award className="w-5 h-5 text-amber-600" />
            default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>
        }
    }

    const getPositionBg = (position: number) => {
        switch (position) {
            case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
            case 2: return 'bg-gradient-to-r from-gray-300/20 to-gray-300/5 border-gray-400/30'
            case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30'
            default: return 'border-primary/10'
        }
    }

    const getDaysRemaining = () => {
        if (!activeSeason) return 0
        const end = new Date(activeSeason.end_date)
        const now = new Date()
        return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header com stats */}
            {activeSeason && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs">Temporada Atual</span>
                            </div>
                            <p className="text-xl font-bold">{activeSeason.name}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">Dias Restantes</span>
                            </div>
                            <p className="text-xl font-bold text-yellow-500">{getDaysRemaining()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-green-500 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">Participantes</span>
                            </div>
                            <p className="text-xl font-bold text-green-500">{ranking.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs">Líder XP</span>
                            </div>
                            <p className="text-xl font-bold text-primary">
                                {ranking[0]?.xp_month || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="current" className="gap-2">
                        <Trophy className="w-4 h-4" />
                        <span className="hidden sm:inline">Prêmios</span>
                    </TabsTrigger>
                    <TabsTrigger value="ranking" className="gap-2">
                        <Crown className="w-4 h-4" />
                        <span className="hidden sm:inline">Ranking</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Histórico</span>
                    </TabsTrigger>
                </TabsList>

                {/* Prêmios Tab */}
                <TabsContent value="current" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Prêmios da Temporada</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={sendSeasonEmails}>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar Emails
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowFinishDialog(true)}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Encerrar Temporada
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {prizes.map((prize) => (
                            <Card key={prize.id} className={`${getPositionBg(prize.position)}`}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                                                {getPositionIcon(prize.position)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{prize.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {prize.description || 'Sem descrição'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditPrize(prize)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Ranking Tab */}
                <TabsContent value="ranking" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Ranking Atual</h3>
                        <Button variant="outline" size="sm" onClick={() => activeSeason && loadSeasonData(activeSeason.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>

                    {ranking.length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhum participante ainda</p>
                                <p className="text-sm text-muted-foreground">
                                    O ranking será populado quando usuários ganharem XP
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {ranking.map((user, index) => (
                                <Card key={user.user_id} className={`${getPositionBg(index + 1)}`}>
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 flex items-center justify-center">
                                                    {getPositionIcon(index + 1)}
                                                </div>
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={user.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/20 text-primary">
                                                        {user.full_name?.charAt(0) || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.full_name}</p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {user.patente || 'Recruta'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-primary">{user.xp_month}</p>
                                                <p className="text-xs text-muted-foreground">XP no mês</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Histórico Tab */}
                <TabsContent value="history" className="space-y-4">
                    <h3 className="text-lg font-semibold">Temporadas Anteriores</h3>

                    {seasons.filter(s => s.status === 'finished').length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhuma temporada encerrada</p>
                                <p className="text-sm text-muted-foreground">
                                    O histórico aparecerá quando temporadas forem finalizadas
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {seasons.filter(s => s.status === 'finished').map((season) => (
                                <Card key={season.id} className="border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-primary" />
                                            {season.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {new Date(season.start_date).toLocaleDateString('pt-BR')} -
                                            {new Date(season.end_date).toLocaleDateString('pt-BR')}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialog de edição de prêmio */}
            <Dialog open={!!editingPrize} onOpenChange={() => setEditingPrize(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Prêmio</DialogTitle>
                        <DialogDescription>
                            Configure o prêmio para esta posição
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Título do Prêmio</Label>
                            <Input
                                placeholder="Ex: iPhone 15 Pro"
                                value={prizeTitle}
                                onChange={(e) => setPrizeTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                                placeholder="Ex: Modelo 256GB, cor Space Black"
                                value={prizeDescription}
                                onChange={(e) => setPrizeDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPrize(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={savePrize} disabled={savingPrize}>
                            {savingPrize ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de encerrar temporada */}
            <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Encerrar Temporada
                        </DialogTitle>
                        <DialogDescription>
                            Esta ação irá:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <span>Registrar os Top 3 como vencedores</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Send className="w-5 h-5 text-blue-500" />
                            <span>Notificar os vencedores</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-yellow-500" />
                            <span>Criar a próxima temporada automaticamente</span>
                        </div>

                        {ranking.length >= 3 && (
                            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                                <p className="font-medium mb-2">Vencedores:</p>
                                {ranking.slice(0, 3).map((user, i) => (
                                    <div key={user.user_id} className="flex items-center gap-2 mt-1">
                                        {getPositionIcon(i + 1)}
                                        <span>{user.full_name}</span>
                                        <span className="text-muted-foreground">({user.xp_month} XP)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={finishSeason}
                            disabled={finishing || ranking.length < 3}
                        >
                            {finishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirmar Encerramento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
