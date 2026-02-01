'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move, Loader2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageCropDialogProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    onCropComplete: (croppedImageUrl: string) => void
    aspectRatio?: number
}

interface CroppedAreaPixels {
    x: number
    y: number
    width: number
    height: number
}

export function ImageCropDialog({
    isOpen,
    onClose,
    imageUrl,
    onCropComplete,
}: ImageCropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null)
    const [loading, setLoading] = useState(false)
    const [removingBg, setRemovingBg] = useState(false)
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)

    // Imagem atual (original ou processada)
    const currentImageUrl = processedImageUrl || imageUrl

    const onCropCompleteCallback = useCallback(
        (_croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
            setCroppedAreaPixels(croppedAreaPixels)
        },
        []
    )

    const resetCrop = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setProcessedImageUrl(null)
    }

    // Função para criar imagem cropada
    const createCroppedImage = async (): Promise<string | null> => {
        if (!croppedAreaPixels) return null

        const image = new Image()
        image.crossOrigin = 'anonymous'

        return new Promise((resolve) => {
            image.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(null)
                    return
                }

                // Output size fixo
                const outputSize = 400
                canvas.width = outputSize
                canvas.height = outputSize

                ctx.drawImage(
                    image,
                    croppedAreaPixels.x,
                    croppedAreaPixels.y,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height,
                    0,
                    0,
                    outputSize,
                    outputSize
                )

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(URL.createObjectURL(blob))
                    } else {
                        resolve(null)
                    }
                }, 'image/png', 1)
            }

            image.onerror = () => {
                resolve(null)
            }

            image.src = currentImageUrl
        })
    }

    const handleConfirm = async () => {
        setLoading(true)
        try {
            const croppedUrl = await createCroppedImage()
            if (croppedUrl) {
                onCropComplete(croppedUrl)
            }
            onClose()
        } catch (err) {
            console.error('Erro ao cortar:', err)
            toast.error('Erro ao cortar imagem')
        } finally {
            setLoading(false)
        }
    }

    // Remover fundo com IA
    const handleRemoveBackground = async () => {
        setRemovingBg(true)
        const bgToast = toast.loading('🤖 Removendo fundo com IA...')

        try {
            // Buscar imagem atual
            const response = await fetch(currentImageUrl)
            const blob = await response.blob()
            const file = new File([blob], 'image.png', { type: 'image/png' })

            const formData = new FormData()
            formData.append('image', file)

            const apiResponse = await fetch('/api/remove-bg', {
                method: 'POST',
                body: formData
            })

            const data = await apiResponse.json()

            if (data.success && data.imageBase64) {
                setProcessedImageUrl(data.imageBase64)
                toast.dismiss(bgToast)
                toast.success('Fundo removido!')
            } else {
                toast.dismiss(bgToast)
                toast.error(data.error || 'Erro ao remover fundo')
            }
        } catch (err) {
            console.error('Erro ao remover fundo:', err)
            toast.dismiss(bgToast)
            toast.error('Erro ao remover fundo')
        } finally {
            setRemovingBg(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Move className="w-5 h-5" />
                        Ajustar Imagem
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Arraste para reposicionar • Use o slider para zoom
                    </p>

                    {/* Container de Crop com react-easy-crop */}
                    <div className="relative mx-auto bg-zinc-800 rounded-lg overflow-hidden" style={{ width: 300, height: 300 }}>
                        <Cropper
                            image={currentImageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropCompleteCallback}
                            cropShape="rect"
                            showGrid={false}
                            restrictPosition={false}
                            style={{
                                containerStyle: {
                                    borderRadius: '8px'
                                }
                            }}
                        />
                    </div>

                    {/* Zoom Slider */}
                    <div className="flex items-center gap-4 px-2">
                        <ZoomOut className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[zoom * 100]}
                            onValueChange={(value) => setZoom(value[0] / 100)}
                            min={50}
                            max={300}
                            step={10}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground w-12">{Math.round(zoom * 100)}%</span>
                    </div>

                    {/* Botão Remover Fundo */}
                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={removingBg || loading}
                        onClick={handleRemoveBackground}
                    >
                        {removingBg ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Remover Fundo (IA)
                            </>
                        )}
                    </Button>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetCrop} disabled={loading}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Resetar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                    </Button>
                    <Button size="sm" onClick={handleConfirm} disabled={loading || removingBg}>
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4 mr-1" />
                        )}
                        Aplicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
