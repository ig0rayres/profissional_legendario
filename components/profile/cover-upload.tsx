'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, X, Check, Move } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface CoverUploadProps {
    userId: string
    currentCoverUrl?: string
    onUploadComplete?: (newUrl: string) => void
}

export function CoverUpload({ userId, currentCoverUrl, onUploadComplete }: CoverUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePosition, setImagePosition] = useState(50)
    const [dialogOpen, setDialogOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
            setSelectedFile(file)
            setDialogOpen(true)
        }
        reader.readAsDataURL(file)
    }

    const handleCancel = () => {
        setDialogOpen(false)
        setPreview(null)
        setSelectedFile(null)
        setImagePosition(50)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleConfirm = async () => {
        if (!selectedFile) return

        setUploading(true)

        try {
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `${userId}/cover.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(fileName, selectedFile, { upsert: true })

            if (uploadError) {
                console.error('Erro no upload:', uploadError)
                throw uploadError
            }

            const { data: urlData } = supabase.storage
                .from('covers')
                .getPublicUrl(fileName)

            // Adicionar timestamp e posição para evitar cache e guardar crop
            const coverUrlWithParams = `${urlData.publicUrl}?t=${Date.now()}&pos=${imagePosition}`

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ cover_url: coverUrlWithParams })
                .eq('id', userId)

            if (updateError) throw updateError

            onUploadComplete?.(urlData.publicUrl)
            setDialogOpen(false)
            setPreview(null)
            setSelectedFile(null)
            window.location.reload()

        } catch (error: any) {
            console.error('Erro ao fazer upload:', error)
            alert('❌ Erro ao atualizar capa: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 gap-1 opacity-80 hover:opacity-100"
                onClick={handleButtonClick}
                disabled={uploading}
            >
                <Camera className="w-4 h-4" />
                Mudar Capa
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ajustar Foto de Capa</DialogTitle>
                    </DialogHeader>

                    {/* Preview da imagem */}
                    {preview && (
                        <div className="relative h-40 overflow-hidden rounded-lg bg-muted">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                                style={{ objectPosition: `center ${imagePosition}%` }}
                            />
                            <div className="absolute top-2 right-2 flex items-center gap-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                                <Move className="w-3 h-3" />
                                Arraste o slider para ajustar
                            </div>
                        </div>
                    )}

                    {/* Slider */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                            Posição vertical da imagem
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={imagePosition}
                            onChange={(e) => setImagePosition(Number(e.target.value))}
                            className="w-full accent-secondary h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Topo</span>
                            <span>Centro</span>
                            <span>Base</span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 mt-4">
                        <Button variant="outline" onClick={handleCancel} disabled={uploading}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirm} disabled={uploading}>
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Salvar Capa
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
