'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Check, X, ZoomIn, ZoomOut, Move } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface ImageCropDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageSrc: string
    aspectRatio?: number // 1 for square (avatar), 3 for cover
    onCropComplete: (croppedBlob: Blob) => void
    title?: string
}

export function ImageCropDialog({
    open,
    onOpenChange,
    imageSrc,
    aspectRatio = 1,
    onCropComplete,
    title = 'Recortar Imagem'
}: ImageCropDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [isProcessing, setIsProcessing] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // Crop area size (fixed)
    const cropSize = aspectRatio === 1 ? 288 : 400 // Aumentado ~15% (250 -> 288)
    const cropHeight = aspectRatio === 1 ? 288 : 133

    // Reset state when dialog opens/closes or image changes
    useEffect(() => {
        if (open) {
            setScale(1)
            setPosition({ x: 0, y: 0 })
            setImageLoaded(false)
        }
    }, [open, imageSrc])

    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        setImageLoaded(true)
        // Center the image initially
        const img = e.currentTarget
        const containerWidth = containerRef.current?.clientWidth || 400
        const containerHeight = 300

        // Calculate initial position to center
        setPosition({
            x: (containerWidth - img.naturalWidth * scale) / 2,
            y: (containerHeight - img.naturalHeight * scale) / 2
        })
    }, [scale])

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        })
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

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0]
        setIsDragging(true)
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        })
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const touch = e.touches[0]
        setPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        })
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    async function getCroppedImg(): Promise<Blob | null> {
        const image = imgRef.current
        const container = containerRef.current
        if (!image || !container) return null

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        // Output size
        const outputSize = aspectRatio === 1 ? 400 : 1200
        const outputHeight = aspectRatio === 1 ? 400 : 400

        canvas.width = outputSize
        canvas.height = outputHeight

        ctx.imageSmoothingQuality = 'high'

        // Calculate crop area position in container
        const containerRect = container.getBoundingClientRect()
        const cropAreaX = (containerRect.width - cropSize) / 2
        const cropAreaY = (300 - cropHeight) / 2 // 300 is container height

        // Calculate which part of the image is in the crop area
        const imageX = position.x
        const imageY = position.y
        const scaledWidth = image.naturalWidth * scale
        const scaledHeight = image.naturalHeight * scale

        // Source coordinates in natural image pixels
        // AJUSTE PARA LOSANGO: Multiplicar por 2 (margem segura) para garantir que pegamos as pontas do losango
        // O losango visual ocupa mais espaço que o quadrado axis-aligned.
        // Se pegarmos apenas o quadrado, cortamos as pontas (parece zoom).
        const zoomFactor = aspectRatio === 1 ? 1.7 : 1 // 1.7 garante que o losango caiba com folga

        const originalSrcWidth = cropSize / scale
        const originalSrcHeight = cropHeight / scale

        const srcWidth = originalSrcWidth * zoomFactor
        const srcHeight = originalSrcHeight * zoomFactor

        // Recalcular X/Y para centralizar o novo quadrado maior
        // Centro original
        const centerX = ((cropAreaX - imageX) / scale) + (originalSrcWidth / 2)
        const centerY = ((cropAreaY - imageY) / scale) + (originalSrcHeight / 2)

        // Novo X/Y baseado no centro
        const srcX = (centerX - srcWidth / 2) * (image.naturalWidth / image.naturalWidth) // Fator 1 mantido por compatibilidade
        const srcY = (centerY - srcHeight / 2) * (image.naturalHeight / image.naturalHeight)

        ctx.drawImage(
            image,
            srcX,
            srcY,
            srcWidth,
            srcHeight,
            0,
            0,
            canvas.width,
            canvas.height
        )

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => resolve(blob),
                'image/jpeg',
                0.9
            )
        })
    }

    const handleConfirm = async () => {
        setIsProcessing(true)
        try {
            const croppedBlob = await getCroppedImg()
            if (croppedBlob) {
                onCropComplete(croppedBlob)
                onOpenChange(false)
            }
        } catch (error) {
            console.error('Erro ao processar imagem:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <Move className="w-4 h-4" />
                        Arraste a imagem para posicionar e use o zoom para ajustar
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Crop Area */}
                    <div
                        ref={containerRef}
                        className="relative bg-black/90 rounded-lg overflow-hidden cursor-move select-none"
                        style={{ height: 300 }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Image */}
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Imagem para recorte"
                            onLoad={handleImageLoad}
                            draggable={false}
                            style={{
                                position: 'absolute',
                                left: position.x,
                                top: position.y,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                maxWidth: 'none',
                                pointerEvents: 'none'
                            }}
                        />

                        {/* Overlay with crop hole (Diamond Shape) */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                            <div
                                className={`absolute border-2 border-white/80 ${aspectRatio === 1 ? 'rotate-45' : 'rounded-lg'}`}
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    width: cropSize,
                                    height: cropHeight,
                                    transform: `translate(-50%, -50%) ${aspectRatio === 1 ? 'rotate(45deg)' : ''}`,
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)', // Máscara escura ao redor
                                    borderRadius: aspectRatio === 1 ? '1rem' : '0.5rem' // Cantos levemente arredondados no losango ficam bonitos
                                }}
                            >
                                {/* Grid lines guide (opcional) */}
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
                                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white"></div>
                                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white"></div>
                                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <ZoomOut className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[scale]}
                            min={0.05}
                            max={1.5}
                            step={0.01}
                            onValueChange={([value]) => setScale(value)}
                            className="w-48"
                        />
                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground w-12">
                            {Math.round(scale * 100)}%
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isProcessing || !imageLoaded}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
