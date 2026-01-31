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
    keywords: string[]
    tags: string[]
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
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [viewCategory, setViewCategory] = useState<ServiceCategory | null>(null)

    // Paginação
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(25)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: 'Tag',
        color: '#3B82F6',
        keywords: [] as string[],
        tags: [] as string[],
        active: true
    })

    // Temp inputs para adicionar keywords/tags
    const [keywordInput, setKeywordInput] = useState('')
    const [tagInput, setTagInput] = useState('')

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

    // Paginação
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
            keywords: [],
            tags: [],
            active: true
        })
        setKeywordInput('')
        setTagInput('')
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
            keywords: category.keywords || [],
            tags: category.tags || [],
            active: category.active
        })
        setKeywordInput('')
        setTagInput('')
        setIsDialogOpen(true)
    }

    const handleViewDetails = (category: ServiceCategory) => {
        setViewCategory(category)
        setIsViewDialogOpen(true)
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
                        keywords: formData.keywords,
                        tags: formData.tags,
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
                        keywords: formData.keywords,
                        tags: formData.tags,
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

                        {/* Keywords */}
                        <div className="space-y-2">
                            <Label>Keywords (palavras-chave para busca)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    keywords: [...prev.keywords, keywordInput.trim()]
                                                }))
                                                setKeywordInput('')
                                            }
                                        }
                                    }}
                                    placeholder="Digite e pressione Enter"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
                                            setFormData(prev => ({
                                                ...prev,
                                                keywords: [...prev.keywords, keywordInput.trim()]
                                            }))
                                            setKeywordInput('')
                                        }
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {formData.keywords.map((keyword, i) => (
                                        <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                            {keyword}
                                            <X
                                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        keywords: prev.keywords.filter((_, idx) => idx !== i)
                                                    }))
                                                }}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label>Tags (categorização)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    tags: [...prev.tags, tagInput.trim()]
                                                }))
                                                setTagInput('')
                                            }
                                        }
                                    }}
                                    placeholder="Digite e pressione Enter"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                                            setFormData(prev => ({
                                                ...prev,
                                                tags: [...prev.tags, tagInput.trim()]
                                            }))
                                            setTagInput('')
                                        }
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {formData.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline" className="flex items-center gap-1">
                                            {tag}
                                            <X
                                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        tags: prev.tags.filter((_, idx) => idx !== i)
                                                    }))
                                                }}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
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
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1) // Reset para primeira página ao buscar
                        }}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Paginação */}
            <div className="glass-strong p-4 rounded-lg border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                        }}
                        className="px-3 py-1 border rounded-md text-sm"
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-muted-foreground">por página</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCategories.length)} de {filteredCategories.length}
                    </span>
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabela de Categorias */}
            <div className="glass-strong rounded-lg border border-primary/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-primary/10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Keywords
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Tags
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                            {paginatedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Nenhuma categoria encontrada
                                    </td>
                                </tr>
                            ) : (
                                paginatedCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-sm text-primary">
                                                    {category.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground font-mono">
                                                /{category.slug}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {category.keywords && category.keywords.length > 0 ? (
                                                    category.keywords.slice(0, 2).map((keyword, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {keyword}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                                {category.keywords && category.keywords.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{category.keywords.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {category.tags && category.tags.length > 0 ? (
                                                    category.tags.slice(0, 2).map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                                {category.tags && category.tags.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{category.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={category.active ? "default" : "secondary"}>
                                                {category.active ? 'Ativa' : 'Inativa'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewDetails(category)}
                                                    title="Ver detalhes"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditClick(category)}
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteClick(category)}
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalhes */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Categoria</DialogTitle>
                        <DialogDescription>Informações completas da categoria</DialogDescription>
                    </DialogHeader>
                    {viewCategory && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Nome</Label>
                                    <p className="font-medium">{viewCategory.name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Slug</Label>
                                    <p className="font-mono text-sm">/{viewCategory.slug}</p>
                                </div>
                            </div>

                            {viewCategory.description && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Descrição</Label>
                                    <p className="text-sm">{viewCategory.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Ícone</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getIcon(viewCategory.icon)}
                                        <span className="text-sm">{viewCategory.icon}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Cor</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div
                                            className="w-6 h-6 rounded border"
                                            style={{ backgroundColor: viewCategory.color }}
                                        />
                                        <span className="text-sm font-mono">{viewCategory.color}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Keywords</Label>
                                <div className="flex flex-wrap gap-1">
                                    {viewCategory.keywords && viewCategory.keywords.length > 0 ? (
                                        viewCategory.keywords.map((keyword, i) => (
                                            <Badge key={i} variant="secondary">{keyword}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Nenhuma keyword</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
                                <div className="flex flex-wrap gap-1">
                                    {viewCategory.tags && viewCategory.tags.length > 0 ? (
                                        viewCategory.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline">{tag}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Nenhuma tag</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <p>
                                        <Badge variant={viewCategory.active ? "default" : "secondary"}>
                                            {viewCategory.active ? 'Ativa' : 'Inativa'}
                                        </Badge>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <Label className="text-xs text-muted-foreground">Última Atualização</Label>
                                    <p className="text-sm">
                                        {new Date(viewCategory.updated_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
