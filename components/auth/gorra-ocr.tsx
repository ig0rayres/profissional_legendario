'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, RotateCcw, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GorraOCRProps {
    onIdExtracted: (id: string) => void
    onPhotoCapture: (file: File) => void
    disabled?: boolean
}

/**
 * Componente para captura e leitura do ID_ROTA na aba da gorra
 * Usa OpenAI Vision para OCR preciso
 * Suporta: câmera mobile, webcam desktop, upload de arquivo
 */
export function GorraOCR({ onIdExtracted, onPhotoCapture, disabled = false }: GorraOCRProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [extractedId, setExtractedId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)

    // Estados para webcam
    const [showWebcam, setShowWebcam] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [webcamError, setWebcamError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Detectar se é mobile
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
            setIsMobile(isMobileDevice)
        }
        checkMobile()
    }, [])

    // Limpar stream da webcam ao desmontar
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    /**
     * Processa a imagem com OpenAI Vision para extrair o ID_ROTA
     */
    const processImage = useCallback(async (file: File) => {
        setIsProcessing(true)
        setError(null)
        setProgress(0)
        setExtractedId(null)

        console.log('[GorraOCR] ========== NOVA IMAGEM ==========')
        console.log('[GorraOCR] Arquivo:', file.name, file.size, 'bytes')

        try {
            // Liberar URL anterior para evitar cache
            if (preview) {
                URL.revokeObjectURL(preview)
            }

            // Criar preview da imagem original
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
            onPhotoCapture(file)

            setProgress(20)
            console.log('[GorraOCR] Enviando para OpenAI Vision...')

            // Enviar para API OpenAI Vision
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch('/api/ocr/gorra', {
                method: 'POST',
                body: formData
            })

            setProgress(80)

            const result = await response.json()
            console.log('[GorraOCR] Resultado:', result)

            if (result.success && result.id) {
                // ✅ SUBSTITUIR 141018 (gorra única de teste) por número aleatório
                // Isso sempre acontece, em DEV e PRODUÇÃO
                let finalId = result.id
                if (result.id === '141018') {
                    finalId = String(30000 + Math.floor(Math.random() * 70000))
                    console.log(`[GorraOCR] 🔄 Substituído ${result.id} por ${finalId}`)
                }

                setExtractedId(finalId)
                onIdExtracted(finalId)
                console.log('[GorraOCR] ✅ ID extraído:', finalId)

            } else {
                const errorMsg = result.error || 'Não foi possível identificar o número na imagem.'
                setError(errorMsg)
                console.log('[GorraOCR] ⚠️ Erro:', errorMsg, 'Raw:', result.raw)
            }

        } catch (err) {
            console.error('[GorraOCR] ERRO:', err)
            setError('Erro ao processar. Tente novamente.')
        } finally {
            setIsProcessing(false)
            setProgress(0)
        }
    }, [onIdExtracted, onPhotoCapture, preview])

    /**
     * Handler para seleção de arquivo
     */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processImage(file)
        }
        // Reset input para permitir selecionar o mesmo arquivo
        e.target.value = ''
    }

    /**
     * Inicia a webcam (desktop)
     */
    const startWebcam = async () => {
        setWebcamError(null)
        setShowWebcam(true) // Abrir modal PRIMEIRO

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 1280, height: 720 }
            })
            streamRef.current = stream

            // Aguardar um tick para o elemento de vídeo estar disponível
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().catch(console.error)
                }
            }, 100)
        } catch (err: any) {
            console.error('[GorraOCR] Erro ao acessar webcam:', err)
            if (err.name === 'NotAllowedError') {
                setWebcamError('Permissão para câmera negada. Habilite nas configurações do navegador.')
            } else if (err.name === 'NotFoundError') {
                setWebcamError('Nenhuma câmera encontrada.')
            } else {
                setWebcamError('Erro ao acessar a câmera.')
            }
        }
    }

    /**
     * Para a webcam
     */
    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setShowWebcam(false)
    }

    /**
     * Captura foto da webcam
     */
    const captureFromWebcam = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        // Definir tamanho do canvas igual ao vídeo
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Desenhar frame do vídeo no canvas
        ctx.drawImage(video, 0, 0)

        // Converter para blob/file
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' })
                stopWebcam()
                processImage(file)
            }
        }, 'image/jpeg', 0.9)
    }

    /**
     * Handler para botão "Tirar Foto"
     * Mobile: abre câmera nativa
     * Desktop: abre webcam
     */
    const handleTakePhoto = () => {
        if (isMobile) {
            // Mobile: usar input capture
            cameraInputRef.current?.click()
        } else {
            // Desktop: abrir webcam
            startWebcam()
        }
    }

    /**
     * Reset para tentar novamente
     */
    const handleReset = () => {
        setPreview(null)
        setExtractedId(null)
        setError(null)
        setProgress(0)
        setWebcamError(null)
    }

    return (
        <div className="space-y-4">
            {/* Canvas oculto para captura */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Modal de Webcam (Desktop) */}
            {showWebcam && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl overflow-hidden max-w-2xl w-full">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold">Tirar Foto da Gorra</h3>
                            <Button variant="ghost" size="icon" onClick={stopWebcam}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full aspect-video object-cover"
                            />
                            {/* Grid de ajuda */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-[20%] border-2 border-white/50 rounded-lg" />
                                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                                    Posicione a aba da gorra dentro do quadro
                                </p>
                            </div>
                        </div>
                        <div className="p-4 flex justify-center">
                            <Button
                                size="lg"
                                onClick={captureFromWebcam}
                                className="gap-2"
                            >
                                <Camera className="w-5 h-5" />
                                Capturar Foto
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Área de upload/preview */}
            <div className={cn(
                "relative border-2 border-dashed rounded-xl overflow-hidden transition-all",
                preview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50",
                isProcessing && "animate-pulse"
            )}>
                {preview ? (
                    // Preview da imagem
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Foto da gorra"
                            className="w-full h-48 object-cover"
                        />

                        {/* Overlay de processamento */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm font-medium">Analisando imagem com IA...</p>
                                <p className="text-xs text-white/70">{progress}%</p>
                            </div>
                        )}

                        {/* Status de sucesso */}
                        {extractedId && !isProcessing && (
                            <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center text-white">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <p className="text-lg font-bold">ID Identificado!</p>
                                <p className="text-2xl font-mono font-black">{extractedId}</p>
                            </div>
                        )}

                        {/* Status de erro */}
                        {error && !isProcessing && (
                            <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center text-white p-4">
                                <AlertCircle className="w-10 h-10 mb-2" />
                                <p className="text-sm text-center">{error}</p>
                            </div>
                        )}

                        {/* Botão de reset */}
                        {!isProcessing && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={handleReset}
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Tentar novamente
                            </Button>
                        )}
                    </div>
                ) : (
                    // Área de upload vazia
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            Foto da Aba da Gorra
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Tire uma foto da aba interna da sua gorra onde está o seu número de membro
                        </p>

                        {/* Erro de webcam */}
                        {webcamError && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                {webcamError}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            {/* Botão Câmera */}
                            <Button
                                type="button"
                                variant="default"
                                onClick={handleTakePhoto}
                                disabled={disabled || isProcessing}
                            >
                                {isMobile ? (
                                    <Camera className="w-4 h-4 mr-2" />
                                ) : (
                                    <Video className="w-4 h-4 mr-2" />
                                )}
                                {isMobile ? 'Tirar Foto' : 'Usar Webcam'}
                            </Button>

                            {/* Botão Upload */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || isProcessing}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Enviar Arquivo
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Inputs escondidos */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Dicas */}
            <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 <strong>Dicas para melhor leitura:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Boa iluminação (evite sombras)</li>
                    <li>Foto focada e sem tremor</li>
                    <li>Número bem visível</li>
                </ul>
            </div>
        </div>
    )
}
