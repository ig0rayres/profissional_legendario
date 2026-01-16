'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarketplaceCategory } from '@/lib/data/mock'

interface MarketplaceCategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: MarketplaceCategory | null
    onSave?: (category: Partial<MarketplaceCategory>) => void
}

// Default values for auto-generated fields
const DEFAULT_ICON = 'Tag'
const DEFAULT_COLOR = '#8B5CF6'
const DEFAULT_DESCRIPTION = 'Categoria do marketplace'

export function MarketplaceCategoryDialog({ open, onOpenChange, category, onSave }: MarketplaceCategoryDialogProps) {
    const [name, setName] = useState(category?.name || '')
    const [expirationDays, setExpirationDays] = useState<number>(category?.expirationDays || 30)

    // Update state when category changes
    useEffect(() => {
        setName(category?.name || '')
        setExpirationDays(category?.expirationDays || 30)
    }, [category])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Auto-generate slug from name
        const slug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        const newCategory: Partial<MarketplaceCategory> = {
            id: category?.id || Date.now().toString(),
            name,
            slug,
            description: DEFAULT_DESCRIPTION,
            expirationDays,
            icon: DEFAULT_ICON,
            color: DEFAULT_COLOR,
            active: true,
            listingCount: category?.listingCount || 0,
            createdAt: category?.createdAt || new Date().toISOString()
        }

        if (onSave) {
            onSave(newCategory)
        }

        // Reset form
        setName('')
        setExpirationDays(30)
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
                        {category ? 'Atualize o nome e dias de expiração' : 'Crie uma nova categoria do marketplace'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Nome da Categoria *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Imóveis, Veículos, Eletrônicos..."
                            required
                            autoFocus
                            className="text-lg h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiration" className="text-base">Dias para Expiração *</Label>
                        <Input
                            id="expiration"
                            type="number"
                            min="1"
                            max="365"
                            value={expirationDays}
                            onChange={(e) => setExpirationDays(parseInt(e.target.value) || 30)}
                            required
                            className="text-lg h-12"
                        />
                        <p className="text-xs text-muted-foreground">
                            Anúncios serão excluídos automaticamente após este período
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
