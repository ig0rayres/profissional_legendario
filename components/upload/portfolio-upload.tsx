'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, Trash2 } from 'lucide-react'
import { uploadPortfolioImage, compressImage, deleteFile } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PortfolioItem {
    id: string
    title: string
    description?: string
    image_url: string
    image_storage_path: string
    display_order: number
}

interface PortfolioUploadProps {
    userId: string
    items: PortfolioItem[]
    onItemsChange?: (items: PortfolioItem[]) => void
}

export function PortfolioUpload({ userId, items, onItemsChange }: PortfolioUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')

    const supabase = createClient()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null)
        setUploading(true)

        try {
            for (const file of acceptedFiles) {
                // Compress image
                const compressedFile = await compressImage(file, 1920, 0.85)

                // Upload to storage
                const result = await uploadPortfolioImage(userId, compressedFile)

                if (result.error) {
                    setError(result.error)
                    continue
                }

                // Create portfolio item in database
                const { data, error: dbError } = await supabase
                    .from('portfolio_items')
                    .insert({
                        user_id: userId,
                        title: file.name.split('.')[0],
                        image_url: result.url,
                        image_storage_path: result.path,
                        display_order: items.length,
                    })
                    .select()
                    .single()

                if (dbError) {
                    setError(dbError.message)
                    // Clean up uploaded file
                    await deleteFile('portfolio', result.path)
                } else if (data) {
                    onItemsChange?.([...items, data])
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }, [userId, items, onItemsChange, supabase])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
    })

    const handleDelete = async (item: PortfolioItem) => {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return

        try {
            // Delete from storage
            await deleteFile('portfolio', item.image_storage_path)

            // Delete from database
            const { error: dbError } = await supabase
                .from('portfolio_items')
                .delete()
                .eq('id', item.id)

            if (dbError) {
                setError(dbError.message)
            } else {
                onItemsChange?.(items.filter(i => i.id !== item.id))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed')
        }
    }

    const handleEdit = (item: PortfolioItem) => {
        setEditingItem(item.id)
        setEditTitle(item.title)
        setEditDescription(item.description || '')
    }

    const handleSaveEdit = async (itemId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('portfolio_items')
                .update({
                    title: editTitle,
                    description: editDescription || null,
                })
                .eq('id', itemId)

            if (updateError) {
                setError(updateError.message)
            } else {
                onItemsChange?.(
                    items.map(item =>
                        item.id === itemId
                            ? { ...item, title: editTitle, description: editDescription }
                            : item
                    )
                )
                setEditingItem(null)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed')
        }
    }

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-xl p-8 text-center
          transition-all cursor-pointer
          ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-gray-700 hover:border-violet-500'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} disabled={uploading} />

                <div className="flex flex-col items-center gap-4">
                    {uploading ? (
                        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                    ) : (
                        <Upload className="w-12 h-12 text-gray-500" />
                    )}

                    <div>
                        <p className="text-lg font-medium text-gray-300">
                            {isDragActive ? 'Solte as imagens aqui' : 'Adicionar imagens ao portfólio'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Clique ou arraste múltiplas imagens (PNG, JPG, WEBP - máx. 10MB cada)
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 px-4 py-3 rounded-lg">
                    <X className="w-4 h-4" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto underline">
                        Fechar
                    </button>
                </div>
            )}

            {/* Portfolio Grid */}
            {items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700"
                        >
                            <div className="aspect-video relative">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(item)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4">
                                {editingItem === item.id ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Título"
                                            className="bg-gray-900"
                                        />
                                        <Input
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Descrição (opcional)"
                                            className="bg-gray-900"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveEdit(item.id)}
                                                className="flex-1"
                                            >
                                                Salvar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingItem(null)}
                                                className="flex-1"
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => handleEdit(item)} className="cursor-pointer">
                                        <h3 className="font-medium text-gray-200">{item.title}</h3>
                                        {item.description && (
                                            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">Clique para editar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {items.length === 0 && !uploading && (
                <div className="text-center py-12 text-gray-500">
                    <p>Nenhuma imagem no portfólio ainda.</p>
                    <p className="text-sm mt-1">Adicione suas melhores fotos acima!</p>
                </div>
            )}
        </div>
    )
}
