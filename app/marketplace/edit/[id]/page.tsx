'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Upload, X, Loader2, Car, Home, Save, ImageIcon, GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { AD_CONDITIONS } from '@/lib/data/marketplace'
import { toast } from 'sonner'
import { LocationSelector } from '@/components/ui/location-selector'
import { VehicleSelector } from '@/components/ui/vehicle-selector'

// Schema de Validação
const formSchema = z.object({
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    price: z.string().min(1, 'Informe o preço'),
    condition: z.string().optional(),
    description: z.string().min(10, 'Descrição muito curta'),
    location: z.string().min(3, 'Informe a localização'),
    // Veículos
    vehicle_year_fab: z.string().optional(),
    vehicle_year_model: z.string().optional(),
    vehicle_make: z.string().optional(),
    vehicle_model: z.string().optional(),
    vehicle_km: z.string().optional(),
    vehicle_color: z.string().optional(),
    // Imóveis
    property_type: z.string().optional(),
    property_area: z.string().optional(),
    property_bedrooms: z.string().optional(),
    property_bathrooms: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function EditListingPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const supabase = createClient()
    const adId = params.id as string

    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ad, setAd] = useState<any>(null)
    const [category, setCategory] = useState<any>(null)

    // Imagens existentes (URLs do storage)
    const [existingImages, setExistingImages] = useState<string[]>([])
    // Novas imagens a serem adicionadas
    const [newImages, setNewImages] = useState<File[]>([])
    const [newImageUrls, setNewImageUrls] = useState<string[]>([])
    // Imagens a serem removidas
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    })

    const isVehicle = category?.slug === 'veiculos'
    const isProperty = category?.slug === 'imoveis'

    // Total de imagens (existentes + novas - removidas)
    const allImages = [...existingImages.filter(img => !imagesToDelete.includes(img)), ...newImageUrls]
    const maxPhotos = ad?.marketplace_ad_tiers?.max_photos || 5

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadAd()
    }, [user, adId])

    async function loadAd() {
        if (!user || !adId) return
        setLoading(true)

        const { data, error } = await supabase
            .from('marketplace_ads')
            .select('*, marketplace_categories(*), marketplace_ad_tiers(*)')
            .eq('id', adId)
            .eq('user_id', user.id)
            .single()

        if (error || !data) {
            toast.error('Anúncio não encontrado')
            router.push('/dashboard/marketplace')
            return
        }

        setAd(data)
        setCategory(data.marketplace_categories)
        setExistingImages(data.images || [])

        // Preencher formulário
        reset({
            title: data.title,
            price: data.price?.toString() || '',
            condition: data.condition || '',
            description: data.description || '',
            location: data.location || '',
            vehicle_year_fab: data.vehicle_details?.year_fab || '',
            vehicle_year_model: data.vehicle_details?.year_model || '',
            vehicle_make: data.vehicle_details?.make || '',
            vehicle_model: data.vehicle_details?.model || '',
            vehicle_km: data.vehicle_details?.km?.toString() || '',
            vehicle_color: data.vehicle_details?.color || '',
            property_type: data.property_details?.type || '',
            property_area: data.property_details?.area?.toString() || '',
            property_bedrooms: data.property_details?.bedrooms?.toString() || '',
            property_bathrooms: data.property_details?.bathrooms?.toString() || '',
        })

        setLoading(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const availableSlots = maxPhotos - allImages.length

            if (availableSlots <= 0) {
                toast.error(`Limite de ${maxPhotos} fotos atingido`)
                return
            }

            const newFiles = files.slice(0, availableSlots)
            setNewImages(prev => [...prev, ...newFiles])

            // Criar URLs de preview
            newFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setNewImageUrls(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })
        }
    }

    const removeExistingImage = (url: string) => {
        setImagesToDelete(prev => [...prev, url])
    }

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
        setNewImageUrls(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: FormData) => {
        if (!user || !ad) return
        setIsSubmitting(true)

        try {
            // Upload novas imagens
            const uploadedUrls: string[] = []
            for (const file of newImages) {
                const fileName = `${user.id}/${adId}/${Date.now()}-${file.name}`
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('marketplace')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('marketplace')
                    .getPublicUrl(fileName)

                uploadedUrls.push(urlData.publicUrl)
            }

            // Deletar imagens removidas
            for (const url of imagesToDelete) {
                // Extrair path do URL
                const path = url.split('/marketplace/')[1]
                if (path) {
                    await supabase.storage.from('marketplace').remove([path])
                }
            }

            // Array final de imagens
            const finalImages = [
                ...existingImages.filter(img => !imagesToDelete.includes(img)),
                ...uploadedUrls
            ]

            // Preparar dados
            const updateData: any = {
                title: data.title,
                price: parseFloat(data.price.replace(/[^\d.,]/g, '').replace(',', '.')),
                condition: data.condition || null,
                description: data.description,
                location: data.location,
                images: finalImages,
                updated_at: new Date().toISOString()
            }

            // Detalhes de veículo
            if (isVehicle) {
                updateData.vehicle_details = {
                    make: data.vehicle_make,
                    model: data.vehicle_model,
                    year_fab: data.vehicle_year_fab,
                    year_model: data.vehicle_year_model,
                    km: data.vehicle_km ? parseInt(data.vehicle_km) : null,
                    color: data.vehicle_color
                }
            }

            // Detalhes de imóvel
            if (isProperty) {
                updateData.property_details = {
                    type: data.property_type,
                    area: data.property_area ? parseFloat(data.property_area) : null,
                    bedrooms: data.property_bedrooms ? parseInt(data.property_bedrooms) : null,
                    bathrooms: data.property_bathrooms ? parseInt(data.property_bathrooms) : null
                }
            }

            // Atualizar anúncio
            const { error: updateError } = await supabase
                .from('marketplace_ads')
                .update(updateData)
                .eq('id', adId)

            if (updateError) throw updateError

            toast.success('Anúncio atualizado com sucesso!')
            router.push('/dashboard/marketplace')

        } catch (error: any) {
            toast.error('Erro ao atualizar: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!ad) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Anúncio não encontrado</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="mb-6">
                    <Link href="/dashboard/marketplace">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-primary font-montserrat mt-4">Editar Anúncio</h1>
                    <p className="text-muted-foreground">{ad.title}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Título *</Label>
                                <Input placeholder="Título do anúncio" {...register('title')} />
                                {errors.title && (
                                    <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Preço (R$) *</Label>
                                    <Input
                                        placeholder="0,00"
                                        {...register('price')}
                                    />
                                    {errors.price && (
                                        <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Condição</Label>
                                    <Select
                                        defaultValue={ad.condition}
                                        onValueChange={(val) => setValue('condition', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AD_CONDITIONS.map(c => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Descrição *</Label>
                                <Textarea
                                    placeholder="Descreva seu produto..."
                                    className="min-h-[120px]"
                                    {...register('description')}
                                />
                                {errors.description && (
                                    <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            <div>
                                <Label>Localização *</Label>
                                <LocationSelector
                                    defaultValue={ad.location}
                                    onLocationChange={(loc) => setValue('location', loc)}
                                />
                                {errors.location && (
                                    <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detalhes de Veículos */}
                    {isVehicle && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Car className="w-5 h-5" />
                                    <h3 className="font-semibold">Detalhes do Veículo</h3>
                                </div>
                                <VehicleSelector
                                    defaultValues={{
                                        make: ad.vehicle_details?.make,
                                        model: ad.vehicle_details?.model,
                                        yearFab: ad.vehicle_details?.year_fab,
                                        yearModel: ad.vehicle_details?.year_model,
                                        km: ad.vehicle_details?.km?.toString(),
                                        color: ad.vehicle_details?.color,
                                    }}
                                    onVehicleChange={(data) => {
                                        setValue('vehicle_make', data.make)
                                        setValue('vehicle_model', data.model)
                                        setValue('vehicle_year_fab', data.yearFab)
                                        setValue('vehicle_year_model', data.yearModel)
                                        setValue('vehicle_km', data.km)
                                        setValue('vehicle_color', data.color)
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Detalhes de Imóveis */}
                    {isProperty && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Home className="w-5 h-5" />
                                    <h3 className="font-semibold">Detalhes do Imóvel</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tipo</Label>
                                        <Select
                                            defaultValue={ad.property_details?.type}
                                            onValueChange={(val) => setValue('property_type', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Venda / Locação" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="venda">Venda</SelectItem>
                                                <SelectItem value="locacao">Locação</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Área (m²)</Label>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            defaultValue={ad.property_details?.area}
                                            {...register('property_area')}
                                        />
                                    </div>
                                    <div>
                                        <Label>Quartos</Label>
                                        <Input
                                            type="number"
                                            placeholder="3"
                                            defaultValue={ad.property_details?.bedrooms}
                                            {...register('property_bedrooms')}
                                        />
                                    </div>
                                    <div>
                                        <Label>Banheiros</Label>
                                        <Input
                                            type="number"
                                            placeholder="2"
                                            defaultValue={ad.property_details?.bathrooms}
                                            {...register('property_bathrooms')}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Fotos */}
                    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                    <ImageIcon className="w-5 h-5" />
                                    <h3 className="font-semibold">Fotos</h3>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {allImages.length}/{maxPhotos}
                                </span>
                            </div>

                            {/* Upload de novas fotos */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${allImages.length >= maxPhotos
                                        ? 'border-muted-foreground/20 bg-muted/30 cursor-not-allowed'
                                        : 'border-primary/30 hover:border-primary/50 cursor-pointer'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    disabled={allImages.length >= maxPhotos}
                                    className="hidden"
                                    id="image-upload-edit"
                                />
                                <label
                                    htmlFor="image-upload-edit"
                                    className={allImages.length >= maxPhotos ? 'cursor-not-allowed' : 'cursor-pointer'}
                                >
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        {allImages.length >= maxPhotos
                                            ? 'Limite de fotos atingido'
                                            : 'Clique para adicionar mais fotos'
                                        }
                                    </p>
                                </label>
                            </div>

                            {/* Grid de imagens */}
                            {allImages.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {/* Imagens existentes */}
                                    {existingImages
                                        .filter(img => !imagesToDelete.includes(img))
                                        .map((url, index) => (
                                            <div
                                                key={`existing-${index}`}
                                                className={`relative aspect-square rounded-lg overflow-hidden ${index === 0 ? 'ring-2 ring-primary ring-offset-2' : 'border border-primary/30'
                                                    }`}
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`Imagem ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />

                                                {index === 0 && (
                                                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold">
                                                        CAPA
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(url)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                    {/* Novas imagens */}
                                    {newImageUrls.map((url, index) => (
                                        <div
                                            key={`new-${index}`}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-green-500/50"
                                        >
                                            <Image
                                                src={url}
                                                alt={`Nova imagem ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />

                                            <div className="absolute top-1 left-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                                                Nova
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {imagesToDelete.length > 0 && (
                                <p className="text-xs text-orange-500 text-center">
                                    ⚠️ {imagesToDelete.length} foto(s) serão removidas ao salvar
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botões */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push('/dashboard/marketplace')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 glow-orange"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
