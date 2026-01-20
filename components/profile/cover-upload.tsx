'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, X, Check, ZoomIn, ZoomOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

interface CoverUploadProps {
    userId: string
    currentCoverUrl?: string
    onUploadComplete?: (newUrl: string) => void
}

// Função para criar imagem a partir de URL
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

// Função para recortar a imagem
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    // Tamanho do canvas = área recortada
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Desenhar a parte recortada
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // Retornar como blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob)
            } else {
                reject(new Error('Canvas is empty'))
            }
        }, 'image/jpeg', 0.95)
    })
}

export function CoverUpload({ userId, currentCoverUrl, onUploadComplete }: CoverUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
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
            setDialogOpen(true)
            setCrop({ x: 0, y: 0 })
            setZoom(1)
        }
        reader.readAsDataURL(file)
    }

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCancel = () => {
        setDialogOpen(false)
        setPreview(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleConfirm = async () => {
        if (!preview || !croppedAreaPixels) return

        setUploading(true)

        try {
            // Recortar a imagem
            const croppedBlob = await getCroppedImg(preview, croppedAreaPixels)

            // Fazer upload
            const fileName = `${userId}/cover.jpg`

            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(fileName, croppedBlob, {
                    upsert: true,
                    contentType: 'image/jpeg'
                })

            if (uploadError) {
                console.error('Erro no upload:', uploadError)
                throw uploadError
            }

            const { data: urlData } = supabase.storage
                .from('covers')
                .getPublicUrl(fileName)

            // Adicionar timestamp para evitar cache
            const coverUrlWithParams = `${urlData.publicUrl}?t=${Date.now()}`

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ cover_url: coverUrlWithParams })
                .eq('id', userId)

            if (updateError) throw updateError

            onUploadComplete?.(urlData.publicUrl)
            setDialogOpen(false)
            setPreview(null)
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

                    {/* Área de Crop */}
                    {preview && (
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground text-center">
                                Arraste para posicionar e use o slider para ajustar o zoom
                            </p>
                            <div className="relative h-64 bg-black rounded-lg overflow-hidden">
                                <Cropper
                                    image={preview}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={16 / 5}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    showGrid={true}
                                    cropShape="rect"
                                />
                            </div>
                        </div>
                    )}

                    {/* Controle de Zoom */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                            <ZoomOut className="w-4 h-4" />
                            Zoom
                            <ZoomIn className="w-4 h-4 ml-auto" />
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-secondary h-2"
                        />
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
