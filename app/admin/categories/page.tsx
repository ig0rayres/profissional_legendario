'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_CATEGORIES, ServiceCategory } from '@/lib/data/mock'
import { Badge } from '@/components/ui/badge'
import { CategoryFormDialog } from '@/components/admin/category-form-dialog'
import * as LucideIcons from 'lucide-react'

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [categories, setCategories] = useState<ServiceCategory[]>(MOCK_CATEGORIES)
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSaveCategory = (category: Partial<ServiceCategory>) => {
        if (selectedCategory) {
            // Update existing
            setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, ...category } as ServiceCategory : c))
        } else {
            // Add new
            setCategories(prev => [...prev, category as ServiceCategory])
        }
        setSelectedCategory(null)
    }

    const handleEditClick = (category: ServiceCategory) => {
        setSelectedCategory(category)
        setIsDialogOpen(true)
    }

    const handleNewCategoryClick = () => {
        setSelectedCategory(null)
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (category: ServiceCategory) => {
        if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            setCategories(prev => prev.filter(c => c.id !== category.id))
        }
    }

    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName]
        return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Tag className="w-5 h-5" />
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
            <CategoryFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                category={selectedCategory}
                onSave={handleSaveCategory}
            />

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
                    <div className="text-sm text-muted-foreground">Total de Usuários</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">
                        {categories.reduce((acc, cat) => acc + (cat.userCount || 0), 0)}
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Total de Projetos</div>
                    <div className="text-2xl font-bold text-purple-500 mt-1">
                        {categories.reduce((acc, cat) => acc + (cat.projectCount || 0), 0)}
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
                            {category.description}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-4 mb-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Usuários: </span>
                                <span className="font-semibold text-blue-500">{category.userCount || 0}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Projetos: </span>
                                <span className="font-semibold text-purple-500">{category.projectCount || 0}</span>
                            </div>
                        </div>

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
