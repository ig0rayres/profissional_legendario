'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Camera, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'

interface CoverPhotoUploadProps {
    isOpen: boolean
    onClose: () => void
    onSave: (croppedImageUrl: string) => void
    currentCoverUrl?: string
}

export function CoverPhotoUpload({
    isOpen,
    onClose,
    onSave,
    currentCoverUrl
}: CoverPhotoUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const [verticalPosition, setVerticalPosition] = useState(50) // 0-100, onde 50 é centro

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        if (!previewUrl) return

        // TODO: Implementar crop real com canvas
        // Por ora, apenas retorna a preview URL
        onSave(previewUrl)
        handleClose()
    }

    const handleClose = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setZoom(1)
        setVerticalPosition(50)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl bg-[#1A2421] text-white border-[#2D3B2D]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Camera className="w-6 h-6 text-[#D2691E]" />
                        Ajustar Foto de Capa
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Preview Area */}
                    <div className="relative w-full h-[240px] bg-[#0F1B1A] rounded-lg overflow-hidden border-2 border-[#2D3B2D]">
                        {previewUrl ? (
                            <div
                                className="relative w-full h-full"
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'center',
                                }}
                            >
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                    style={{
                                        objectPosition: `center ${verticalPosition}%`
                                    }}
                                />
                            </div>
                        ) : currentCoverUrl ? (
                            <Image
                                src={currentCoverUrl}
                                alt="Capa atual"
                                fill
                                className="object-cover opacity-50"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <Camera className="w-12 h-12" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    {previewUrl && (
                        <div className="space-y-4">
                            {/* Zoom */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ZoomIn className="w-4 h-4 text-[#D2691E]" />
                                    Zoom: {zoom.toFixed(1)}x
                                </label>
                                <Slider
                                    value={[zoom]}
                                    onValueChange={(value) => setZoom(value[0])}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>

                            {/* Vertical Position */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    Posição Vertical: {verticalPosition}%
                                </label>
                                <Slider
                                    value={[verticalPosition]}
                                    onValueChange={(value) => setVerticalPosition(value[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* File Input */}
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="cover-upload"
                        />
                        <label htmlFor="cover-upload">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-[#D2691E] text-[#D2691E] hover:bg-[#D2691E]/10"
                                onClick={() => document.getElementById('cover-upload')?.click()}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                {previewUrl ? 'Escolher outra imagem' : 'Escolher imagem'}
                            </Button>
                        </label>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-gray-600 text-gray-300"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!previewUrl}
                        className="bg-[#D2691E] hover:bg-[#C85A17] text-white"
                    >
                        Salvar Capa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
