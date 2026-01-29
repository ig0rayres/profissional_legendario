'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move, Loader2 } from 'lucide-react'

interface ImageCropDialogProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    onCropComplete: (croppedImageUrl: string) => void
    aspectRatio?: number
}

export function ImageCropDialog({
    isOpen,
    onClose,
    imageUrl,
    onCropComplete,
}: ImageCropDialogProps) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [localImageUrl, setLocalImageUrl] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const imgRef = useRef<HTMLImageElement>(null)

    const CROP_SIZE = 250

    // Carregar imagem como base64 para evitar CORS
    useEffect(() => {
        if (isOpen && imageUrl) {
            setLoading(true)
            setScale(1)
            setPosition({ x: 0, y: 0 })

            // Se já é base64 ou blob, usar direto
            if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
                setLocalImageUrl(imageUrl)
                setLoading(false)
                return
            }

            // Fetch imagem e converter para base64
            fetch(imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        setLocalImageUrl(reader.result as string)
                        setLoading(false)
                    }
                    reader.readAsDataURL(blob)
                })
                .catch(err => {
                    console.error('Erro ao carregar imagem:', err)
                    // Fallback: usar URL direta
                    setLocalImageUrl(imageUrl)
                    setLoading(false)
                })
        }
    }, [isOpen, imageUrl])

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleConfirm = () => {
        if (!imgRef.current) {
            onClose()
            return
        }

        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                onClose()
                return
            }

            const img = imgRef.current
            const outputSize = 400
            canvas.width = outputSize
            canvas.height = outputSize

            // Calcular posição da imagem no canvas
            const scaleRatio = img.naturalWidth / img.width
            const cropSizeNatural = (CROP_SIZE / scale) * scaleRatio

            // Centro do crop na imagem natural
            const centerX = (img.naturalWidth / 2) - (position.x * scaleRatio / scale)
            const centerY = (img.naturalHeight / 2) - (position.y * scaleRatio / scale)

            const sourceX = centerX - cropSizeNatural / 2
            const sourceY = centerY - cropSizeNatural / 2

            ctx.drawImage(
                img,
                Math.max(0, sourceX),
                Math.max(0, sourceY),
                cropSizeNatural,
                cropSizeNatural,
                0,
                0,
                outputSize,
                outputSize
            )

            canvas.toBlob((blob) => {
                if (blob) {
                    onCropComplete(URL.createObjectURL(blob))
                }
                onClose()
            }, 'image/png', 1)
        } catch (err) {
            console.error('Erro ao cortar:', err)
            onClose()
        }
    }

    const resetCrop = () => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
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

                    {/* Container de Crop */}
                    <div
                        className="relative mx-auto bg-zinc-800 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                        style={{ width: CROP_SIZE, height: CROP_SIZE }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                            </div>
                        ) : (
                            <img
                                ref={imgRef}
                                src={localImageUrl}
                                alt="Crop"
                                draggable={false}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    maxWidth: 'none',
                                    maxHeight: CROP_SIZE,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }}
                            />
                        )}

                        {/* Frame overlay */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-lg">
                            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
                        </div>
                    </div>

                    {/* Zoom */}
                    <div className="flex items-center gap-4 px-2">
                        <ZoomOut className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[scale * 100]}
                            onValueChange={(value) => setScale(value[0] / 100)}
                            min={50}
                            max={250}
                            step={10}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground w-12">{Math.round(scale * 100)}%</span>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetCrop}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Resetar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                    </Button>
                    <Button size="sm" onClick={handleConfirm} disabled={loading}>
                        <Check className="w-4 h-4 mr-1" />
                        Aplicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
