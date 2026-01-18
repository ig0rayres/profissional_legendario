'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Loader2, Save, X, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface Pista {
    id: string
    name: string
    city: string
    state: string
    state_name: string | null
    region: string | null
    country: string
    active: boolean
    member_count: number
    created_at: string
    updated_at: string
}

const STATES = [
    { sigla: 'AC', nome: 'Acre', regiao: 'Norte' },
    { sigla: 'AL', nome: 'Alagoas', regiao: 'Nordeste' },
    { sigla: 'AM', nome: 'Amazonas', regiao: 'Norte' },
    { sigla: 'AP', nome: 'Amapá', regiao: 'Norte' },
    { sigla: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
    { sigla: 'CE', nome: 'Ceará', regiao: 'Nordeste' },
    { sigla: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste' },
    { sigla: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste' },
    { sigla: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste' },
    { sigla: 'MA', nome: 'Maranhão', regiao: 'Nordeste' },
    { sigla: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste' },
    { sigla: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste' },
    { sigla: 'PA', nome: 'Pará', regiao: 'Norte' },
    { sigla: 'PB', nome: 'Paraíba', regiao: 'Nordeste' },
    { sigla: 'PE', nome: 'Pernambuco', regiao: 'Nordeste' },
    { sigla: 'PI', nome: 'Piauí', regiao: 'Nordeste' },
    { sigla: 'PR', nome: 'Paraná', regiao: 'Sul' },
    { sigla: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste' },
    { sigla: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste' },
    { sigla: 'RO', nome: 'Rondônia', regiao: 'Norte' },
    { sigla: 'RR', nome: 'Roraima', regiao: 'Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul' },
    { sigla: 'SC', nome: 'Santa Catarina', regiao: 'Sul' },
    { sigla: 'SE', nome: 'Sergipe', regiao: 'Nordeste' },
    { sigla: 'SP', nome: 'São Paulo', regiao: 'Sudeste' },
    { sigla: 'TO', nome: 'Tocantins', regiao: 'Norte' },
]

export default function PistasPage() {
    const supabase = createClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [pistas, setPistas] = useState<Pista[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedPista, setSelectedPista] = useState<Pista | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        city: '',
        state: '',
        active: true
    })

    useEffect(() => {
        loadPistas()
    }, [])

    async function loadPistas() {
        setLoading(true)
        const { data, error } = await supabase
            .from('pistas')
            .select('*')
            .order('state')
            .order('city')

        if (data) {
            setPistas(data)
        }
        setLoading(false)
    }

    const filteredPistas = pistas.filter(pista =>
        pista.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pista.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pista.state.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Agrupar por estado
    const pistasByState = filteredPistas.reduce((acc, pista) => {
        if (!acc[pista.state]) {
            acc[pista.state] = []
        }
        acc[pista.state].push(pista)
        return acc
    }, {} as Record<string, Pista[]>)

    const handleNewPistaClick = () => {
        setSelectedPista(null)
        setFormData({
            city: '',
            state: '',
            active: true
        })
        setIsDialogOpen(true)
    }

    const handleEditClick = (pista: Pista) => {
        setSelectedPista(pista)
        setFormData({
            city: pista.city,
            state: pista.state,
            active: pista.active
        })
        setIsDialogOpen(true)
    }

    const handleSavePista = async () => {
        if (!formData.city || !formData.state) {
            alert('Preencha cidade e estado')
            return
        }

        setSaving(true)

        const stateInfo = STATES.find(s => s.sigla === formData.state)
        const name = `${formData.city}, ${formData.state}`

        try {
            if (selectedPista) {
                // Update
                const { error } = await supabase
                    .from('pistas')
                    .update({
                        name: name,
                        city: formData.city,
                        state: formData.state,
                        state_name: stateInfo?.nome || null,
                        region: stateInfo?.regiao || null,
                        active: formData.active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedPista.id)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('pistas')
                    .insert({
                        name: name,
                        city: formData.city,
                        state: formData.state,
                        state_name: stateInfo?.nome || null,
                        region: stateInfo?.regiao || null,
                        active: formData.active
                    })

                if (error) throw error
            }

            await loadPistas()
            setIsDialogOpen(false)
        } catch (error: any) {
            console.error('Erro ao salvar pista:', error)
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteClick = async (pista: Pista) => {
        if (pista.member_count > 0) {
            alert(`Esta pista tem ${pista.member_count} membros vinculados. Remova os membros primeiro.`)
            return
        }

        if (!confirm(`Tem certeza que deseja excluir "${pista.name}"?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('pistas')
                .delete()
                .eq('id', pista.id)

            if (error) throw error

            await loadPistas()
        } catch (error: any) {
            console.error('Erro ao deletar pista:', error)
            alert('Erro ao deletar: ' + error.message)
        }
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-impact text-primary">Gestão de Pistas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie as localizações disponíveis para os membros
                    </p>
                </div>
                <Button
                    className="glow-orange bg-secondary hover:bg-secondary/90"
                    onClick={handleNewPistaClick}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Pista
                </Button>
            </div>

            {/* Pista Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPista ? 'Editar Pista' : 'Nova Pista'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPista ? 'Atualize os dados da localização' : 'Adicione uma nova localização'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade *</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Nome da cidade"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">Estado *</Label>
                            <Select
                                value={formData.state}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATES.map((state) => (
                                        <SelectItem key={state.sigla} value={state.sigla}>
                                            {state.sigla} - {state.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="active">Pista Ativa</Label>
                            <Switch
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                            />
                        </div>

                        {/* Preview */}
                        {formData.city && formData.state && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span className="font-bold text-primary">
                                        {formData.city}, {formData.state}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSavePista} disabled={saving || !formData.city || !formData.state}>
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Salvar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Total de Pistas</div>
                    <div className="text-2xl font-bold text-primary mt-1">{pistas.length}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Pistas Ativas</div>
                    <div className="text-2xl font-bold text-green-500 mt-1">
                        {pistas.filter(p => p.active).length}
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Estados</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">
                        {Object.keys(pistasByState).length}
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Total de Membros</div>
                    <div className="text-2xl font-bold text-secondary mt-1">
                        {pistas.reduce((sum, p) => sum + p.member_count, 0)}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="glass-strong p-4 rounded-lg border border-primary/20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar pistas por cidade ou estado..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Pistas by State */}
            {Object.entries(pistasByState).sort().map(([state, statePistas]) => (
                <div key={state} className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-primary border-primary/30">
                            {state}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {statePistas.length} {statePistas.length === 1 ? 'cidade' : 'cidades'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statePistas.map((pista) => (
                            <div
                                key={pista.id}
                                className="glass-strong p-4 rounded-lg border border-primary/20 hover:border-primary/40 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-bold text-primary">{pista.city}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{pista.region}</span>
                                            {pista.member_count > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {pista.member_count}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!pista.active && (
                                        <Badge variant="secondary" className="text-xs">
                                            Inativa
                                        </Badge>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEditClick(pista)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteClick(pista)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {filteredPistas.length === 0 && (
                <div className="text-center py-12 glass-strong rounded-lg border border-primary/20">
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Nenhuma pista encontrada</p>
                </div>
            )}
        </div>
    )
}
