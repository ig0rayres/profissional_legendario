'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import * as LucideIcons from 'lucide-react'

interface ServiceCategory {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string
    color: string
    active: boolean
    created_at: string
    updated_at: string
}

export default function CategoriesPage() {
    const supabase = createClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [categories, setCategories] = useState<ServiceCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: 'Tag',
        color: '#3B82F6',
        active: true
    })

    useEffect(() => {
        loadCategories()
    }, [])

    async function loadCategories() {
        setLoading(true)
        const { data, error } = await supabase
            .from('service_categories')
            .select('*')
            .order('name')

        if (data) {
            setCategories(data)
        }
        setLoading(false)
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    function generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    const handleNewCategoryClick = () => {
        setSelectedCategory(null)
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: 'Tag',
            color: '#3B82F6',
            active: true
        })
        setIsDialogOpen(true)
    }

    const handleEditClick = (category: ServiceCategory) => {
        setSelectedCategory(category)
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            icon: category.icon,
            color: category.color,
            active: category.active
        })
        setIsDialogOpen(true)
    }

    const handleSaveCategory = async () => {
        setSaving(true)

        const slug = formData.slug || generateSlug(formData.name)

        try {
            if (selectedCategory) {
                // Update
                const { error } = await supabase
                    .from('service_categories')
                    .update({
                        name: formData.name,
                        slug: slug,
                        description: formData.description || null,
                        icon: formData.icon,
                        color: formData.color,
                        active: formData.active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedCategory.id)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('service_categories')
                    .insert({
                        name: formData.name,
                        slug: slug,
                        description: formData.description || null,
                        icon: formData.icon,
                        color: formData.color,
                        active: formData.active
                    })

                if (error) throw error
            }

            await loadCategories()
            setIsDialogOpen(false)
        } catch (error: any) {
            console.error('Erro ao salvar categoria:', error)
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteClick = async (category: ServiceCategory) => {
        if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('service_categories')
                .delete()
                .eq('id', category.id)

            if (error) throw error

            await loadCategories()
        } catch (error: any) {
            console.error('Erro ao deletar categoria:', error)
            alert('Erro ao deletar: ' + error.message)
        }
    }

    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName]
        return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Tag className="w-5 h-5" />
    }

    // Lista de ícones disponíveis
    const availableIcons = [
        'Tag', 'Book', 'Users', 'Heart', 'ClipboardList', 'LayoutGrid',
        'TrendingUp', 'Code', 'DollarSign', 'Palette', 'UserCheck',
        'Briefcase', 'Star', 'Zap', 'Shield', 'Award', 'Target',
        'Globe', 'Camera', 'Music', 'Film', 'Mic', 'Plane', 'Car'
    ]

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
                    <h1 className="text-3xl font-bold text-impact text-primary">Gestão de Categorias</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie as categorias de serviços da plataforma
                    </p>
                </div>
                <Button
                    className="glow-orange bg-secondary hover:bg-secondary/90"
                    onClick={handleNewCategoryClick}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                </Button>
            </div>

            {/* Category Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedCategory ? 'Atualize os dados da categoria' : 'Preencha os dados para criar uma nova categoria'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        name: e.target.value,
                                        slug: generateSlug(e.target.value)
                                    }))
                                }}
                                placeholder="Nome da categoria"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                placeholder="slug-da-categoria"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descrição da categoria"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ícone</Label>
                                <div className="flex flex-wrap gap-1 p-2 border rounded-lg max-h-32 overflow-y-auto">
                                    {availableIcons.map((iconName) => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                                            className={`p-2 rounded ${formData.icon === iconName ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                                            title={iconName}
                                        >
                                            {getIcon(iconName)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Cor</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-16 h-10 p-1"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        placeholder="#HEX"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="active">Categoria Ativa</Label>
                            <Switch
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                            />
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-10 h-10 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: formData.color + '20', color: formData.color }}
                                >
                                    {getIcon(formData.icon)}
                                </div>
                                <div>
                                    <p className="font-bold" style={{ color: formData.color }}>{formData.name || 'Nome'}</p>
                                    <p className="text-xs text-muted-foreground">/{formData.slug || 'slug'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveCategory} disabled={saving || !formData.name}>
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
                    <div className="text-sm text-muted-foreground">Total de Categorias</div>
                    <div className="text-2xl font-bold text-primary mt-1">{categories.length}</div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Categorias Ativas</div>
                    <div className="text-2xl font-bold text-green-500 mt-1">
                        {categories.filter(c => c.active).length}
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Categorias Inativas</div>
                    <div className="text-2xl font-bold text-yellow-500 mt-1">
                        {categories.filter(c => !c.active).length}
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Última Atualização</div>
                    <div className="text-lg font-bold text-blue-500 mt-1">
                        {categories[0] ? new Date(categories[0].updated_at).toLocaleDateString('pt-BR') : '-'}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="glass-strong p-4 rounded-lg border border-primary/20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar categorias por nome ou descrição..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                    <div
                        key={category.id}
                        className="glass-strong p-5 rounded-lg border border-primary/20 hover:border-primary/40 transition-all hover:scale-[1.02]"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: category.color + '20', color: category.color }}
                                >
                                    {getIcon(category.icon)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary">{category.name}</h3>
                                    <span className="text-xs text-muted-foreground">/{category.slug}</span>
                                </div>
                            </div>
                            <Badge variant={category.active ? "default" : "secondary"}>
                                {category.active ? 'Ativa' : 'Inativa'}
                            </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {category.description || 'Sem descrição'}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-primary/10">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleEditClick(category)}
                            >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(category)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-12 glass-strong rounded-lg border border-primary/20">
                    <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
                </div>
            )}
        </div>
    )
}
