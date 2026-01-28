'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Edit, Globe, Link2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditPostModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    post: {
        id: string
        content: string
        visibility: 'public' | 'connections' | 'private'
    }
    onPostUpdated?: () => void
}

export function EditPostModal({
    open,
    onOpenChange,
    post,
    onPostUpdated
}: EditPostModalProps) {
    const [content, setContent] = useState(post.content)
    const [visibility, setVisibility] = useState(post.visibility)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error('O conteúdo não pode estar vazio')
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    content: content.trim(),
                    visibility,
                    updated_at: new Date().toISOString()
                })
                .eq('id', post.id)

            if (error) throw error

            toast.success('Publicação atualizada!')
            onOpenChange(false)
            onPostUpdated?.()
        } catch (error: any) {
            console.error('Error updating post:', error)
            toast.error('Erro ao atualizar', { description: error.message })
        } finally {
            setSaving(false)
        }
    }

    const visibilityOptions = [
        { value: 'public' as const, icon: Globe, label: 'Público' },
        { value: 'connections' as const, icon: Link2, label: 'Elos' },
        { value: 'private' as const, icon: Lock, label: 'Privado' },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-gray-600" />
                        Editar Publicação
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Textarea
                        placeholder="O que você quer compartilhar?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px] resize-none"
                        disabled={saving}
                    />

                    {/* Visibility Options */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Visibilidade
                        </label>
                        <div className="flex items-center bg-gray-100 rounded p-0.5">
                            {visibilityOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setVisibility(opt.value)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all flex-1 justify-center",
                                        visibility === opt.value
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        💡 Editar não afeta os pontos, medalhas ou proezas já conquistados.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !content.trim()}
                        className="bg-gray-900 hover:bg-gray-800"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            'Salvar Alterações'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
