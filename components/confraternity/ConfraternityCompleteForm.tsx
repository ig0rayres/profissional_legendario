// ============================================
// Component: ConfraternityCompleteForm
// Formulário para marcar confraria como realizada
// COM VALIDAÇÃO POR IA
// ============================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Calendar,
    MapPin,
    Image as ImageIcon,
    FileText,
    Loader2,
    CheckCircle2,
    Upload,
    X,
    AlertCircle,
    Bot,
    Sparkles
} from 'lucide-react'
import { completeConfraternity } from '@/lib/api/confraternity'
import { uploadPortfolioImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ConfraternityCompleteFormProps {
    inviteId: string
    currentUserId: string
    otherMemberName: string
    proposedDate?: string
    proposedLocation?: string
    onSuccess?: () => void
    onCancel?: () => void
}

interface AIValidationResult {
    success: boolean
    approved: boolean
    people_count: number
    confidence: string
    reason: string
    error?: string
}

export function ConfraternityCompleteForm({
    inviteId,
    currentUserId,
    otherMemberName,
    proposedDate,
    proposedLocation,
    onSuccess,
    onCancel
}: ConfraternityCompleteFormProps) {
    const [loading, setLoading] = useState(false)
    const [uploadingPhotos, setUploadingPhotos] = useState(false)
    const [validating, setValidating] = useState(false)
    const [validationResult, setValidationResult] = useState<AIValidationResult | null>(null)
    const [publishToFeed, setPublishToFeed] = useState(true)
    const [photoFile, setPhotoFile] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        date: proposedDate?.split('T')[0] || '',
        time: proposedDate?.split('T')[1]?.substring(0, 5) || '',
        location: proposedLocation || '',
        description: '',
        testimonial: '',
        visibility: 'public' as 'private' | 'connections' | 'public',
        photos: [] as string[]
    })

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Limite de 5 fotos
        if (formData.photos.length + files.length > 5) {
            toast.error('Máximo de 5 fotos permitidas')
            return
        }

        const firstFile = files[0]
        setPhotoFile(firstFile)
        setValidationResult(null)
        setUploadingPhotos(true)

        try {
            // Preview local imediato
            const localUrls = Array.from(files).map(file => URL.createObjectURL(file))

            // Adicionar previews
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...localUrls]
            }))

            // Validar a primeira foto enquanto faz upload em background
            // Nota: Para produção, o ideal é validar antes de salvar o form final
            if (firstFile) {
                await validatePhoto(firstFile)
            }

            // Upload real para storage
            const uploadPromises = Array.from(files).map(async (file) => {
                const result = await uploadPortfolioImage(currentUserId, file)
                return result.url
            })

            // Substituir URLs locais pelas do servidor (opcional, ou manter locais e enviar files no submit)
            // Aqui vamos manter simples: Assumir que o upload funciona.
            // Para robustez total, deveríamos substituir as URLs locais pelas remotas no estado.
            const serverUrls = await Promise.all(uploadPromises)

            // Atualizar estado com URLs reais para salvar no banco depois
            setFormData(prev => {
                // Remove as URLs locais recentes e adiciona as do servidor
                const current = prev.photos.filter(url => !localUrls.includes(url))
                return {
                    ...prev,
                    photos: [...current, ...serverUrls]
                }
            })

            toast.success(`${serverUrls.length} foto(s) enviada(s)`)

        } catch (error) {
            toast.error('Erro ao enviar fotos')
        } finally {
            setUploadingPhotos(false)
        }
    }

    const validatePhoto = async (file: File) => {
        setValidating(true)
        setValidationResult(null)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('image', file)

            const response = await fetch('/api/validate-confraternity', {
                method: 'POST',
                body: formDataToSend
            })

            const result = await response.json()
            console.log('[AI Validation] Result:', result)

            setValidationResult(result)

            if (result.approved) {
                toast.success('Foto aprovada pela IA!', {
                    description: `${result.people_count} pessoa(s) detectada(s)`
                })
            } else {
                toast.error('Foto não aprovada', {
                    description: result.reason || 'Envie uma foto com 2+ pessoas'
                })
            }
        } catch (error) {
            console.error('[AI Validation] Error:', error)
            setValidationResult({
                success: false,
                approved: false,
                people_count: 0,
                confidence: 'low',
                reason: 'Não foi possível validar a foto. Envie uma foto da reunião (presencial ou online) com pelo menos 2 pessoas visíveis.',
                error: 'Erro de conexão'
            })
            toast.error('Erro ao validar foto', {
                description: 'Tente enviar outra foto mostrando a reunião com 2+ pessoas'
            })
        } finally {
            setValidating(false)
        }
    }

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }))
        // Se removeu todas as fotos, limpar validação
        if (formData.photos.length <= 1) {
            setValidationResult(null)
            setPhotoFile(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Filtrar fotos vazias (URLs inválidas)
        const validPhotos = formData.photos.filter(url => url && url.trim() !== '' && !url.startsWith('blob:'))

        // Validações
        if (validPhotos.length === 0) {
            toast.error('Foto obrigatória!', {
                description: 'Adicione pelo menos uma foto da confraria (upload pode ter falhado)'
            })
            return
        }

        // Validar data - não pode ser futura
        const selectedDate = new Date(`${formData.date}T${formData.time}:00`)
        const now = new Date()
        if (selectedDate > now) {
            toast.error('Data inválida!', {
                description: 'A data da confraria não pode ser no futuro. A confraria já aconteceu?'
            })
            return
        }

        if (!validationResult?.approved) {
            toast.error('Foto não validada', {
                description: 'A foto precisa ser aprovada pela IA (mostrar 2+ pessoas)'
            })
            return
        }

        if (!formData.testimonial.trim()) {
            toast.error('Por favor, adicione seu depoimento')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()
            const dateTime = `${formData.date}T${formData.time}:00`

            // 1. Completar a confraria (usando apenas fotos válidas)
            const result = await completeConfraternity(
                inviteId,
                currentUserId,
                {
                    dateOccurred: new Date(dateTime).toISOString(),
                    location: formData.location,
                    description: formData.description || undefined,
                    photos: validPhotos, // Usar apenas fotos com URLs válidas
                    testimonial: formData.testimonial,
                    visibility: formData.visibility
                }
            )

            if (!result.success) {
                toast.error('Erro ao registrar', { description: result.error })
                return
            }

            // 2. Criar post no feed "Na Rota" (se publicar habilitado)
            if (publishToFeed && result.confraternityId) {
                const postContent = formData.description
                    ? `${formData.description}\n\n📝 ${formData.testimonial}`
                    : formData.testimonial

                const { data: post, error: postError } = await supabase
                    .from('posts')
                    .insert({
                        user_id: currentUserId,
                        content: postContent,
                        media_urls: formData.photos,
                        confraternity_id: result.confraternityId,
                        ai_validation: validationResult,
                        visibility: formData.visibility
                    })
                    .select('id')
                    .single()

                if (postError) {
                    console.error('[Post] Error creating:', postError)
                } else {
                    console.log('[Post] Created:', post.id)

                    // Atualizar a confraria com o ID do post
                    await supabase
                        .from('confraternities')
                        .update({
                            ai_validated: true,
                            ai_validation_result: validationResult,
                            post_id: post.id
                        })
                        .eq('id', result.confraternityId)
                }
            }

            const totalXP = 50 + (formData.photos.length * 20) + 15
            toast.success('🎉 Confraria registrada!', {
                description: `+${totalXP} Vigor ganhos! ${publishToFeed ? '📱 Publicado no Na Rota!' : ''}`
            })
            onSuccess?.()
        } catch (error) {
            console.error('[Submit] Error:', error)
            toast.error('Erro ao registrar confraria')
        } finally {
            setLoading(false)
        }
    }

    const calculateRewards = () => {
        // Filtrar fotos válidas para cálculo correto
        const validPhotos = formData.photos.filter(url => url && url.trim() !== '' && !url.startsWith('blob:'))
        let xp = 50 // Base
        xp += validPhotos.length * 20 // Fotos válidas apenas
        xp += formData.testimonial ? 15 : 0 // Depoimento
        return { xp, validPhotosCount: validPhotos.length }
    }

    // Verificar se a data é futura
    const isFutureDate = () => {
        if (!formData.date || !formData.time) return false
        const selectedDate = new Date(`${formData.date}T${formData.time}:00`)
        return selectedDate > new Date()
    }

    const canSubmit = formData.photos.length > 0 &&
        validationResult?.approved &&
        !loading &&
        !uploadingPhotos &&
        !validating &&
        !isFutureDate() &&
        formData.testimonial.trim() !== ''

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                    Confraria Realizada
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Com: <span className="font-semibold">{otherMemberName}</span>
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data Real
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                date: e.target.value
                            }))}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">Horário</Label>
                        <Input
                            id="time"
                            type="time"
                            required
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                time: e.target.value
                            }))}
                        />
                    </div>
                </div>

                {/* Aviso de data futura */}
                {isFutureDate() && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-900 dark:text-red-100">
                                <span className="font-semibold">Data inválida:</span> A data da confraria não pode ser no futuro.
                                Selecione uma data em que o encontro já aconteceu.
                            </p>
                        </div>
                    </div>
                )}

                {/* Local */}
                <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Local
                    </Label>
                    <Input
                        id="location"
                        required
                        placeholder="Ex: Café Central, Centro"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: e.target.value
                        }))}
                    />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Descrição (opcional)
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Breve resumo do encontro..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                        rows={2}
                    />
                </div>

                {/* Fotos - OBRIGATÓRIO */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Foto da Confraria <span className="text-red-500">*OBRIGATÓRIO</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        📸 A foto será validada por IA. Deve mostrar você e seu parceiro de confraria (2+ pessoas).
                    </p>

                    {/* Grid de fotos */}
                    {formData.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {formData.photos.map((photo, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <img
                                        src={photo}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resultado da validação por IA */}
                    {validating && (
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Bot className="h-5 w-5 text-blue-500 animate-pulse" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                        Validando foto com IA...
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Verificando se há 2+ pessoas na imagem
                                    </p>
                                </div>
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500 ml-auto" />
                            </div>
                        </div>
                    )}

                    {validationResult && !validating && (
                        <div className={`rounded-lg p-4 ${validationResult.approved
                            ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-center gap-3">
                                {validationResult.approved ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                ✅ Foto Aprovada!
                                            </p>
                                            <p className="text-xs text-green-700 dark:text-green-300">
                                                {validationResult.people_count} pessoa(s) detectada(s) • {validationResult.reason}
                                            </p>
                                        </div>
                                        <Sparkles className="h-5 w-5 text-green-500 ml-auto" />
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                                                ❌ Foto Não Aprovada
                                            </p>
                                            <p className="text-xs text-red-700 dark:text-red-300">
                                                {validationResult.reason || 'A foto precisa mostrar a reunião (presencial ou online) com pelo menos 2 pessoas visíveis.'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Upload button */}
                    {formData.photos.length < 5 && (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="photo-upload"
                                disabled={uploadingPhotos || validating}
                            />
                            <Label
                                htmlFor="photo-upload"
                                className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-accent ${formData.photos.length === 0 ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''
                                    }`}
                            >
                                {uploadingPhotos ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : validating ? (
                                    <>
                                        <Bot className="h-4 w-4 animate-pulse" />
                                        Validando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        {formData.photos.length === 0 ? 'Adicionar Foto (obrigatório)' : 'Adicionar Mais Fotos'}
                                    </>
                                )}
                            </Label>
                        </div>
                    )}
                </div>

                {/* Depoimento */}
                <div className="space-y-2">
                    <Label htmlFor="testimonial" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Seu Depoimento +15 Vigor
                    </Label>
                    <Textarea
                        id="testimonial"
                        required
                        placeholder="Compartilhe sua experiência nesta confraternização..."
                        value={formData.testimonial}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            testimonial: e.target.value
                        }))}
                        rows={4}
                    />
                </div>



                {/* Visibilidade */}
                <div className="space-y-2">
                    <Label>Visibilidade</Label>
                    <RadioGroup
                        value={formData.visibility}
                        onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            visibility: value as typeof formData.visibility
                        }))}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="private" />
                            <Label htmlFor="private" className="font-normal cursor-pointer">
                                Privado (só você e {otherMemberName})
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="connections" id="connections" />
                            <Label htmlFor="connections" className="font-normal cursor-pointer">
                                Elos (visível para suas conexões)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="public" />
                            <Label htmlFor="public" className="font-normal cursor-pointer">
                                Público (galeria geral da plataforma)
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Recompensas Preview */}
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        🎁 Recompensas ao finalizar:
                    </p>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                        <li>• +50 Vigor por realizar</li>
                        {calculateRewards().validPhotosCount > 0 && (
                            <li>• +{calculateRewards().validPhotosCount * 20} Vigor pelas fotos ({calculateRewards().validPhotosCount}×20)</li>
                        )}
                        {formData.testimonial && (
                            <li>• +15 Vigor pelo depoimento</li>
                        )}
                        <li className="font-bold mt-2 pt-2 border-t border-green-300 dark:border-green-700">
                            Total: +{calculateRewards().xp} Vigor
                        </li>
                    </ul>
                </div>

                {/* Warning se foto não validada */}
                {formData.photos.length > 0 && !validationResult?.approved && !validating && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                <span className="font-semibold">Atenção:</span> Sua foto precisa ser aprovada pela IA para confirmar a confraria.
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={!canSubmit}
                        className="flex-1"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirmar +{calculateRewards().xp} Vigor
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
