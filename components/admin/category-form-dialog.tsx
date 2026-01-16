'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ServiceCategory } from '@/lib/data/mock'

interface CategoryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: ServiceCategory | null
    onSave?: (category: Partial<ServiceCategory>) => void
}

// Default values for auto-generated fields
const DEFAULT_ICON = 'Tag'
const DEFAULT_COLOR = '#8B5CF6'
const DEFAULT_DESCRIPTION = 'Categoria de serviço'

export function CategoryFormDialog({ open, onOpenChange, category, onSave }: CategoryFormDialogProps) {
    const [name, setName] = useState(category?.name || '')

    // Update name when category changes
    useEffect(() => {
        setName(category?.name || '')
    }, [category])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Auto-generate slug from name
        const slug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        const newCategory: Partial<ServiceCategory> = {
            id: category?.id || Date.now().toString(),
            name,
            slug,
            description: DEFAULT_DESCRIPTION,
            icon: DEFAULT_ICON,
            color: DEFAULT_COLOR,
            active: true,
            userCount: category?.userCount || 0,
            projectCount: category?.projectCount || 0,
            createdAt: category?.createdAt || new Date().toISOString()
        }

        if (onSave) {
            onSave(newCategory)
        }

        // Reset form
        setName('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-2 border-primary/30 shadow-2xl">
                <DialogHeader className="border-b border-primary/20 pb-4">
                    <DialogTitle className="text-2xl text-primary font-bold">
                        {category ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {category ? 'Atualize o nome da categoria' : 'Digite o nome da nova categoria de serviço'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Nome da Categoria *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Marketing Digital, Fotografia, Consultoria..."
                            required
                            autoFocus
                            className="text-lg h-12"
                        />
                        <p className="text-xs text-muted-foreground">
                            Este será o nome exibido em toda a plataforma
                        </p>
                    </div>

                    <DialogFooter className="border-t border-primary/20 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="glow-orange bg-secondary hover:bg-secondary/90">
                            {category ? 'Salvar' : 'Criar Categoria'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
