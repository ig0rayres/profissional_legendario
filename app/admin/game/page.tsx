'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Trophy, Medal, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'

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
}

export default function GameAdminPage() {
    const [ranks, setRanks] = useState<Rank[]>([])
    const [medals, setMedals] = useState<MedalType[]>([])
    const [loading, setLoading] = useState(true)
    const [editingRank, setEditingRank] = useState<Rank | null>(null)
    const [editingMedal, setEditingMedal] = useState<MedalType | null>(null)
    const [isCreatingRank, setIsCreatingRank] = useState(false)
    const [isCreatingMedal, setIsCreatingMedal] = useState(false)
    const [processing, setProcessing] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        const [ranksResult, medalsResult] = await Promise.all([
            supabase.from('ranks').select('*').order('rank_level'),
            supabase.from('medals').select('*').order('points_reward', { ascending: false })
        ])

        if (ranksResult.data) setRanks(ranksResult.data)
        if (medalsResult.data) setMedals(medalsResult.data)

        setLoading(false)
    }

    async function handleSaveRank(rank: Partial<Rank>) {
        setProcessing(true)
        try {
            if (editingRank) {
                // Update
                const { error } = await supabase
                    .from('ranks')
                    .update(rank)
                    .eq('id', editingRank.id)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('ranks')
                    .insert([rank])

                if (error) throw error
            }

            await loadData()
            setEditingRank(null)
            setIsCreatingRank(false)
        } catch (error: any) {
            alert('Erro ao salvar patente: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteRank(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta patente?')) return

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('ranks')
                .delete()
                .eq('id', id)

            if (error) throw error
            await loadData()
        } catch (error: any) {
            alert('Erro ao excluir patente: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleSaveMedal(medal: Partial<MedalType>) {
        setProcessing(true)
        try {
            if (editingMedal) {
                // Update
                const { error } = await supabase
                    .from('medals')
                    .update(medal)
                    .eq('id', editingMedal.id)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('medals')
                    .insert([medal])

                if (error) throw error
            }

            await loadData()
            setEditingMedal(null)
            setIsCreatingMedal(false)
        } catch (error: any) {
            alert('Erro ao salvar medalha: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    async function handleDeleteMedal(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta medalha?')) return

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('medals')
                .delete()
                .eq('id', id)

            if (error) throw error
            await loadData()
        } catch (error: any) {
            alert('Erro ao excluir medalha: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

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
                <h2 className="text-3xl font-bold tracking-tight">Gerenciar Gamificação</h2>
                <p className="text-muted-foreground">
                    Central de controle de patentes e medalhas do sistema
                </p>
            </div>

            <Tabs defaultValue="ranks" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="ranks">
                        <Trophy className="w-4 h-4 mr-2" />
                        Patentes ({ranks.length})
                    </TabsTrigger>
                    <TabsTrigger value="medals">
                        <Medal className="w-4 h-4 mr-2" />
                        Medalhas ({medals.length})
                    </TabsTrigger>
                </TabsList>

                {/* PATENTES */}
                <TabsContent value="ranks" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Gerencie as patentes hierárquicas do sistema
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
                                    <TableHead>Descrição</TableHead>
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
                                        <TableCell>{rank.points_required} pts</TableCell>
                                        <TableCell className="max-w-md truncate">{rank.description}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingRank(rank)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteRank(rank.id)}
                                                >
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

                {/* MEDALHAS */}
                <TabsContent value="medals" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Gerencie as medalhas e conquistas do sistema
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
                                            <MedalBadge medalId={medal.id} size="sm" variant="icon-only" />
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">{medal.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{medal.points_reward} pts</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge>{medal.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingMedal(medal)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteMedal(medal.id)}
                                                >
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

            {/* DIALOG PARA EDITAR/CRIAR PATENTE */}
            <RankDialog
                rank={editingRank}
                isOpen={!!editingRank || isCreatingRank}
                onClose={() => {
                    setEditingRank(null)
                    setIsCreatingRank(false)
                }}
                onSave={handleSaveRank}
                processing={processing}
            />

            {/* DIALOG PARA EDITAR/CRIAR MEDALHA */}
            <MedalDialog
                medal={editingMedal}
                isOpen={!!editingMedal || isCreatingMedal}
                onClose={() => {
                    setEditingMedal(null)
                    setIsCreatingMedal(false)
                }}
                onSave={handleSaveMedal}
                processing={processing}
            />
        </div>
    )
}

// Dialog de Patente
function RankDialog({ rank, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        rank_level: 1,
        points_required: 0,
        icon: '🔰',
        color: '#94a3b8',
        description: ''
    })

    useEffect(() => {
        if (rank) {
            setFormData(rank)
        } else {
            setFormData({
                id: '',
                name: '',
                rank_level: 1,
                points_required: 0,
                icon: '🔰',
                color: '#94a3b8',
                description: ''
            })
        }
    }, [rank])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{rank ? 'Editar Patente' : 'Nova Patente'}</DialogTitle>
                    <DialogDescription>
                        Configure os detalhes da patente hierárquica
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            placeholder="novato"
                            disabled={!!rank}
                        />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Novato"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Nível</Label>
                            <Input
                                type="number"
                                value={formData.rank_level}
                                onChange={(e) => setFormData({ ...formData, rank_level: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>Vigor Necessário</Label>
                            <Input
                                type="number"
                                value={formData.points_required}
                                onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ícone (emoji)</Label>
                            <Input
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🔰"
                            />
                        </div>
                        <div>
                            <Label>Cor (hex)</Label>
                            <Input
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="#94a3b8"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição da patente"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Dialog de Medalha
function MedalDialog({ medal, isOpen, onClose, onSave, processing }: any) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        icon: '🏅',
        points_reward: 0,
        category: 'profile'
    })

    useEffect(() => {
        if (medal) {
            setFormData(medal)
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                icon: '🏅',
                points_reward: 0,
                category: 'profile'
            })
        }
    }, [medal])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{medal ? 'Editar Medalha' : 'Nova Medalha'}</DialogTitle>
                    <DialogDescription>
                        Configure os detalhes da medalha
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>ID (slug)</Label>
                        <Input
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            placeholder="primeira_venda"
                            disabled={!!medal}
                        />
                    </div>
                    <div>
                        <Label>Nome</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Primeira Venda"
                        />
                    </div>
                    <div>
                        <Label>Descrição</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Realize sua primeira venda"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ícone (emoji)</Label>
                            <Input
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🏅"
                            />
                        </div>
                        <div>
                            <Label>Pontos de Vigor</Label>
                            <Input
                                type="number"
                                value={formData.points_reward}
                                onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Categoria</Label>
                        <Input
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="profile, contracts, etc"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onSave(formData)} disabled={processing}>
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
