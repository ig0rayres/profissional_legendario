// ============================================
// Component: ConfraternityCompleteForm
// Formulário para marcar confraria como realizada
// ============================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Calendar,
    MapPin,
    Image as ImageIcon,
    FileText,
    Loader2,
    CheckCircle2,
    Upload,
    X
} from 'lucide-react'
import { completeConfraternity } from '@/lib/api/confraternity'
import { uploadPortfolioImage } from '@/lib/supabase/storage'
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
    const [formData, setFormData] = useState({
        date: proposedDate?.split('T')[0] || '',
        time: proposedDate?.split('T')[1]?.substring(0, 5) || '',
        location: proposedLocation || '',
        description: '',
        testimonial: '',
        visibility: 'connections' as 'private' | 'connections' | 'public',
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

        setUploadingPhotos(true)

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const result = await uploadPortfolioImage(currentUserId, file)
                return result.url
            })

            const urls = await Promise.all(uploadPromises)
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...urls]
            }))

            toast.success(`${urls.length} foto(s) enviada(s)`)
        } catch (error) {
            toast.error('Erro ao enviar fotos')
        } finally {
            setUploadingPhotos(false)
        }
    }

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.testimonial.trim()) {
            toast.error('Por favor, adicione seu depoimento')
            return
        }

        setLoading(true)

        try {
            const dateTime = `${formData.date}T${formData.time}:00`

            const result = await completeConfraternity(
                inviteId,
                currentUserId,
                {
                    dateOccurred: new Date(dateTime).toISOString(),
                    location: formData.location,
                    description: formData.description || undefined,
                    photos: formData.photos,
                    testimonial: formData.testimonial,
                    visibility: formData.visibility
                }
            )

            if (result.success) {
                const totalXP = 50 + (formData.photos.length * 20) + 15
                toast.success('Confraria registrada!', {
                    description: `+${totalXP} XP ganhos!`
                })
                onSuccess?.()
            } else {
                toast.error('Erro ao registrar', { description: result.error })
            }
        } catch (error) {
            toast.error('Erro ao registrar confraria')
        } finally {
            setLoading(false)
        }
    }

    const calculateRewards = () => {
        let xp = 50 // Base
        xp += formData.photos.length * 20 // Fotos
        xp += formData.testimonial ? 15 : 0 // Depoimento
        return xp
    }

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

                {/* Fotos */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Fotos (até 5) +20 XP cada
                    </Label>

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
                                disabled={uploadingPhotos}
                            />
                            <Label
                                htmlFor="photo-upload"
                                className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-accent"
                            >
                                {uploadingPhotos ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Adicionar Fotos
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
                        Seu Depoimento +15 XP
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
                        <li>• +50 XP por realizar</li>
                        {formData.photos.length > 0 && (
                            <li>• +{formData.photos.length * 20} XP pelas fotos ({formData.photos.length}×20)</li>
                        )}
                        {formData.testimonial && (
                            <li>• +15 XP pelo depoimento</li>
                        )}
                        <li className="font-bold mt-2 pt-2 border-t border-green-300 dark:border-green-700">
                            Total: +{calculateRewards()} XP
                        </li>
                    </ul>
                </div>

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
                        disabled={loading || uploadingPhotos}
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
                                Confirmar +{calculateRewards()} XP
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
