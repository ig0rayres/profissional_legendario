'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Trophy, Medal, Flame, Zap, Target,
    Plus, Edit, Trash2, Loader2, Check, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'

// ============================================
// TIPOS
// ============================================

type Rank = {
    id: string
    name: string
    rank_level: number
    points_required: number
    icon: string
    color: string
    description: string
}

type MedalType = {
    id: string
    name: string
    description: string
    icon: string
    points_reward: number
    category: string
    is_permanent: boolean
}

type Proeza = {
    id: string
    name: string
    description: string
    icon: string
    points_base: number
    category: string
    is_active: boolean
}

type PointAction = {
    id: string
    name: string
    description: string
    points_base: number
    category: string
    max_per_day: number | null
    is_active: boolean
}

type DailyMission = {
    id: string
    name: string
    description: string
    points_base: number
    category: string
    icon: string
    is_active: boolean
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function RotaValenteAdminPage() {
    const [ranks, setRanks] = useState<Rank[]>([])
    const [medals, setMedals] = useState<MedalType[]>([])
    const [proezas, setProezas] = useState<Proeza[]>([])
    const [actions, setActions] = useState<PointAction[]>([])
    const [missions, setMissions] = useState<DailyMission[]>([])
    const [loading, setLoading] = useState(true)

    // Estados de edição
    const [editingRank, setEditingRank] = useState<Rank | null>(null)
    const [editingMedal, setEditingMedal] = useState<MedalType | null>(null)
    const [editingProeza, setEditingProeza] = useState<Proeza | null>(null)
    const [editingAction, setEditingAction] = useState<PointAction | null>(null)
    const [editingMission, setEditingMission] = useState<DailyMission | null>(null)

    // Estados de criação
    const [isCreatingRank, setIsCreatingRank] = useState(false)
    const [isCreatingMedal, setIsCreatingMedal] = useState(false)
    const [isCreatingProeza, setIsCreatingProeza] = useState(false)
    const [isCreatingAction, setIsCreatingAction] = useState(false)
    const [isCreatingMission, setIsCreatingMission] = useState(false)

    const [processing, setProcessing] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        const [ranksResult, medalsResult, proezasResult, actionsResult, missionsResult] = await Promise.all([
            supabase.from('ranks').select('*').order('rank_level'),
            supabase.from('medals').select('*').order('display_order'),
            supabase.from('proezas').select('*').order('display_order'),
            supabase.from('point_actions').select('*').order('category'),
            supabase.from('daily_missions').select('*').order('category')
        ])

        if (ranksResult.data) setRanks(ranksResult.data)
        if (medalsResult.data) setMedals(medalsResult.data)
        if (proezasResult.data) setProezas(proezasResult.data)
        if (actionsResult.data) setActions(actionsResult.data)
        if (missionsResult.data) setMissions(missionsResult.data)

        setLoading(false)
    }

    // ============================================
    // HANDLERS - RANKS
    // ============================================

    async function handleSaveRank(rank: Partial<Rank>) {
        setProcessing(true)
        try {
            if (editingRank) {
                await supabase.from('ranks').update(rank).eq('id', editingRank.id)
            } else {
                await supabase.from('ranks').insert([rank])
            }
            await loadData()
            setEditingRank(null)
            setIsCreatingRank(false)
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteRank(id: string) {
        if (!confirm('Excluir patente?')) return
        setProcessing(true)
        try {
            await supabase.from('ranks').delete().eq('id', id)
            await loadData()
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    // ============================================
    // HANDLERS - MEDALS
    // ============================================

    async function handleSaveMedal(medal: Partial<MedalType>) {
        setProcessing(true)
        try {
            if (editingMedal) {
                await supabase.from('medals').update(medal).eq('id', editingMedal.id)
            } else {
                await supabase.from('medals').insert([{ ...medal, is_permanent: true }])
            }
            await loadData()
            setEditingMedal(null)
            setIsCreatingMedal(false)
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteMedal(id: string) {
        if (!confirm('Excluir medalha?')) return
        setProcessing(true)
        try {
            await supabase.from('medals').delete().eq('id', id)
            await loadData()
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    // ============================================
    // HANDLERS - PROEZAS
    // ============================================

    async function handleSaveProeza(proeza: Partial<Proeza>) {
        setProcessing(true)
        try {
            if (editingProeza) {
                await supabase.from('proezas').update(proeza).eq('id', editingProeza.id)
            } else {
                await supabase.from('proezas').insert([proeza])
            }
            await loadData()
            setEditingProeza(null)
            setIsCreatingProeza(false)
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteProeza(id: string) {
        if (!confirm('Excluir proeza?')) return
        setProcessing(true)
        try {
            await supabase.from('proezas').delete().eq('id', id)
            await loadData()
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleToggleProeza(id: string, isActive: boolean) {
        await supabase.from('proezas').update({ is_active: isActive }).eq('id', id)
        await loadData()
    }

    // ============================================
    // HANDLERS - ACTIONS
    // ============================================

    async function handleSaveAction(action: Partial<PointAction>) {
        setProcessing(true)
        try {
            if (editingAction) {
                await supabase.from('point_actions').update(action).eq('id', editingAction.id)
            } else {
                await supabase.from('point_actions').insert([action])
            }
            await loadData()
            setEditingAction(null)
            setIsCreatingAction(false)
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteAction(id: string) {
        if (!confirm('Excluir ação?')) return
        setProcessing(true)
        try {
            await supabase.from('point_actions').delete().eq('id', id)
            await loadData()
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleToggleAction(id: string, isActive: boolean) {
        await supabase.from('point_actions').update({ is_active: isActive }).eq('id', id)
        await loadData()
    }

    // ============================================
    // HANDLERS - MISSIONS
    // ============================================

    async function handleSaveMission(mission: Partial<DailyMission>) {
        setProcessing(true)
        try {
            if (editingMission) {
                await supabase.from('daily_missions').update(mission).eq('id', editingMission.id)
            } else {
                await supabase.from('daily_missions').insert([mission])
            }
            await loadData()
            setEditingMission(null)
            setIsCreatingMission(false)
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteMission(id: string) {
        if (!confirm('Excluir missão?')) return
        setProcessing(true)
        try {
            await supabase.from('daily_missions').delete().eq('id', id)
            await loadData()
        } catch (error: any) {
            alert('Erro: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleToggleMission(id: string, isActive: boolean) {
        await supabase.from('daily_missions').update({ is_active: isActive }).eq('id', id)
        await loadData()
    }

    // ============================================
    // RENDER
    // ============================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Rota do Valente</h2>
                <p className="text-muted-foreground">
                    Central de controle de gamificação da plataforma
                </p>
            </div>

            <Tabs defaultValue="patentes" className="space-y-4">
                <TabsList className="flex flex-wrap">
                    <TabsTrigger value="patentes">
                        <Trophy className="w-4 h-4 mr-2" />
                        Patentes ({ranks.length})
                    </TabsTrigger>
                    <TabsTrigger value="medalhas">
                        <Medal className="w-4 h-4 mr-2" />
                        Medalhas ({medals.length})
                    </TabsTrigger>
                    <TabsTrigger value="proezas">
                        <Flame className="w-4 h-4 mr-2" />
                        Proezas ({proezas.length})
                    </TabsTrigger>
                    <TabsTrigger value="acoes">
                        <Zap className="w-4 h-4 mr-2" />
                        Ações ({actions.length})
                    </TabsTrigger>
                    <TabsTrigger value="missoes">
                        <Target className="w-4 h-4 mr-2" />
                        Missões Diárias ({missions.length})
                    </TabsTrigger>
                </TabsList>

                {/* ============================================ */}
                {/* TAB: PATENTES */}
                {/* ============================================ */}
                <TabsContent value="patentes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Patentes hierárquicas baseadas em XP total
                        </p>
                        <Button onClick={() => setIsCreatingRank(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Patente
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nível</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Ícone</TableHead>
                                    <TableHead>Vigor Necessário</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ranks.map((rank) => (
                                    <TableRow key={rank.id}>
                                        <TableCell className="font-bold">{rank.rank_level}</TableCell>
                                        <TableCell className="font-medium">{rank.name}</TableCell>
                                        <TableCell>
                                            <RankInsignia rankId={rank.id} size="sm" variant="icon-only" />
                                        </TableCell>
                                        <TableCell>{rank.points_required.toLocaleString()} pts</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setEditingRank(rank)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteRank(rank.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* ============================================ */}
                {/* TAB: MEDALHAS (Permanentes) */}
                {/* ============================================ */}
                <TabsContent value="medalhas" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Medalhas permanentes (Ad Aeternum) - conquistadas 1x na vida
                        </p>
                        <Button onClick={() => setIsCreatingMedal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Medalha
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Ícone</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Pontos</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medals.map((medal) => (
                                    <TableRow key={medal.id}>
                                        <TableCell className="font-medium">{medal.name}</TableCell>
                                        <TableCell>
                                            <span className="text-2xl">{medal.icon}</span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{medal.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{medal.points_reward} pts</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge>{medal.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setEditingMedal(medal)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteMedal(medal.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* ============================================ */}
                {/* TAB: PROEZAS (Mensais) */}
                {/* ============================================ */}
                <TabsContent value="proezas" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Proezas mensais - resetam todo dia 1
                        </p>
                        <Button onClick={() => setIsCreatingProeza(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Proeza
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ativo</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Ícone</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Pontos</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proezas.map((proeza) => (
                                    <TableRow key={proeza.id} className={!proeza.is_active ? 'opacity-50' : ''}>
                                        <TableCell>
                                            <Switch
                                                checked={proeza.is_active}
                                                onCheckedChange={(v) => handleToggleProeza(proeza.id, v)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{proeza.name}</TableCell>
                                        <TableCell>
                                            <span className="text-2xl">{proeza.icon}</span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{proeza.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{proeza.points_base} pts</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{proeza.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setEditingProeza(proeza)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteProeza(proeza.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* ============================================ */}
                {/* TAB: AÇÕES */}
                {/* ============================================ */}
                <TabsContent value="acoes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Ações que concedem pontos diretos
                        </p>
                        <Button onClick={() => setIsCreatingAction(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Ação
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ativo</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Pontos</TableHead>
                                    <TableHead>Limite/Dia</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {actions.map((action) => (
                                    <TableRow key={action.id} className={!action.is_active ? 'opacity-50' : ''}>
                                        <TableCell>
                                            <Switch
                                                checked={action.is_active}
                                                onCheckedChange={(v) => handleToggleAction(action.id, v)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{action.id}</TableCell>
                                        <TableCell className="font-medium">{action.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{action.points_base} pts</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {action.max_per_day ? `${action.max_per_day}/dia` : '∞'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{action.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setEditingAction(action)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteAction(action.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* ============================================ */}
                {/* TAB: MISSÕES DIÁRIAS */}
                {/* ============================================ */}
                <TabsContent value="missoes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Missões diárias - sorteadas e atribuídas todo dia
                        </p>
                        <Button onClick={() => setIsCreatingMission(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Missão
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ativo</TableHead>
                                    <TableHead>Ícone</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Pontos</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {missions.map((mission) => (
                                    <TableRow key={mission.id} className={!mission.is_active ? 'opacity-50' : ''}>
                                        <TableCell>
                                            <Switch
                                                checked={mission.is_active}
                                                onCheckedChange={(v) => handleToggleMission(mission.id, v)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-2xl">{mission.icon}</span>
                                        </TableCell>
                                        <TableCell className="font-medium">{mission.name}</TableCell>
                                        <TableCell className="max-w-xs truncate">{mission.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{mission.points_base} pts</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{mission.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setEditingMission(mission)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteMission(mission.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* ============================================ */}
            {/* DIALOGS */}
            {/* ============================================ */}

            {/* Dialog Patente */}
            <RankDialog
                rank={editingRank}
                isOpen={!!editingRank || isCreatingRank}
                onClose={() => { setEditingRank(null); setIsCreatingRank(false) }}
                onSave={handleSaveRank}
                processing={processing}
            />

            {/* Dialog Medalha */}
            <MedalDialog
                medal={editingMedal}
                isOpen={!!editingMedal || isCreatingMedal}
                onClose={() => { setEditingMedal(null); setIsCreatingMedal(false) }}
                onSave={handleSaveMedal}
                processing={processing}
            />

            {/* Dialog Proeza */}
            <ProezaDialog
                proeza={editingProeza}
                isOpen={!!editingProeza || isCreatingProeza}
                onClose={() => { setEditingProeza(null); setIsCreatingProeza(false) }}
                onSave={handleSaveProeza}
                processing={processing}
            />

            {/* Dialog Ação */}
            <ActionDialog
                action={editingAction}
                isOpen={!!editingAction || isCreatingAction}
                onClose={() => { setEditingAction(null); setIsCreatingAction(false) }}
                onSave={handleSaveAction}
                processing={processing}
            />

            {/* Dialog Missão */}
            <MissionDialog
                mission={editingMission}
                isOpen={!!editingMission || isCreatingMission}
                onClose={() => { setEditingMission(null); setIsCreatingMission(false) }}
                onSave={handleSaveMission}
                processing={processing}
            />
        </div>
    )
}

// ============================================
// DIALOGS DE EDIÇÃO
// ============================================

function RankDialog({ rank, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '', name: '', rank_level: 1, points_required: 0,
        icon: '🔰', color: '#94a3b8', description: ''
    })

    useEffect(() => {
        if (rank) setFormData(rank)
        else setFormData({ id: '', name: '', rank_level: 1, points_required: 0, icon: '🔰', color: '#94a3b8', description: '' })
    }, [rank])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{rank ? 'Editar Patente' : 'Nova Patente'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!rank} />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Nível</Label>
                            <Input type="number" value={formData.rank_level} onChange={(e) => setFormData({ ...formData, rank_level: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <Label>Vigor Necessário</Label>
                            <Input type="number" value={formData.points_required} onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ícone (emoji)</Label>
                            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div>
                            <Label>Cor (hex)</Label>
                            <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MedalDialog({ medal, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '', name: '', description: '', icon: '🏅', points_reward: 0, category: 'profile'
    })

    useEffect(() => {
        if (medal) setFormData(medal)
        else setFormData({ id: '', name: '', description: '', icon: '🏅', points_reward: 0, category: 'profile' })
    }, [medal])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{medal ? 'Editar Medalha' : 'Nova Medalha'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!medal} />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ícone (emoji)</Label>
                            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div>
                            <Label>Pontos de Vigor</Label>
                            <Input type="number" value={formData.points_reward} onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div>
                        <Label>Categoria</Label>
                        <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ProezaDialog({ proeza, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '', name: '', description: '', icon: '🔥', points_base: 0, category: 'general', is_active: true
    })

    useEffect(() => {
        if (proeza) setFormData(proeza)
        else setFormData({ id: '', name: '', description: '', icon: '🔥', points_base: 0, category: 'general', is_active: true })
    }, [proeza])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{proeza ? 'Editar Proeza' : 'Nova Proeza'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!proeza} />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ícone (emoji)</Label>
                            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div>
                            <Label>Pontos Base</Label>
                            <Input type="number" value={formData.points_base} onChange={(e) => setFormData({ ...formData, points_base: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div>
                        <Label>Categoria</Label>
                        <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ActionDialog({ action, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '', name: '', description: '', points_base: 0, category: 'general', max_per_day: null as number | null, is_active: true
    })

    useEffect(() => {
        if (action) setFormData(action)
        else setFormData({ id: '', name: '', description: '', points_base: 0, category: 'general', max_per_day: null, is_active: true })
    }, [action])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{action ? 'Editar Ação' : 'Nova Ação'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!action} />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Pontos Base</Label>
                            <Input type="number" value={formData.points_base} onChange={(e) => setFormData({ ...formData, points_base: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <Label>Limite por Dia (vazio = ilimitado)</Label>
                            <Input
                                type="number"
                                value={formData.max_per_day || ''}
                                onChange={(e) => setFormData({ ...formData, max_per_day: e.target.value ? parseInt(e.target.value) : null })}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Categoria</Label>
                        <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MissionDialog({ mission, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '', name: '', description: '', icon: '✨', points_base: 10, category: 'general', is_active: true
    })

    useEffect(() => {
        if (mission) setFormData(mission)
        else setFormData({ id: '', name: '', description: '', icon: '✨', points_base: 10, category: 'general', is_active: true })
    }, [mission])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mission ? 'Editar Missão' : 'Nova Missão'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!mission} />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ícone (emoji)</Label>
                            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div>
                            <Label>Pontos Base</Label>
                            <Input type="number" value={formData.points_base} onChange={(e) => setFormData({ ...formData, points_base: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div>
                        <Label>Categoria</Label>
                        <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
