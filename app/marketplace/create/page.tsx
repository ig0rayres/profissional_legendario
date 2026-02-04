'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Upload, X, Loader2, Car, Home, Crown, Star, Check, AlertCircle, Info, ChevronLeft, ChevronRight, ImageIcon, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { MarketplaceCategory, MarketplaceAdTier, AD_CONDITIONS, canCreateAd, calculateExpirationDate } from '@/lib/data/marketplace'
import { toast } from 'sonner'
import { LocationSelector } from '@/components/ui/location-selector'
import { VehicleSelector } from '@/components/ui/vehicle-selector'

// Schema de Validação
const formSchema = z.object({
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    price: z.string().min(1, 'Informe o preço'),
    category_id: z.string().min(1, 'Selecione uma categoria'),
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

export default function CreateListingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const [categories, setCategories] = useState<MarketplaceCategory[]>([])
    const [tiers, setTiers] = useState<MarketplaceAdTier[]>([])
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null)

    const [userPlan, setUserPlan] = useState<{ tier: string, maxAds: number | null }>({ tier: 'recruta', maxAds: 0 })
    const [currentAdsCount, setCurrentAdsCount] = useState(0)
    const [maxPhotosAllowed, setMaxPhotosAllowed] = useState(5) // Limite dinâmico baseado na categoria
    const [listingType, setListingType] = useState<'sell' | 'buy'>('sell') // 🆕 Tipo: Vender ou Procurar

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    })

    const selectedCategoryId = watch('category_id')
    const selectedCategory = categories.find(c => c.id === selectedCategoryId)
    const isVehicle = selectedCategory?.slug === 'veiculos'
    const isProperty = selectedCategory?.slug === 'imoveis'

    // Tiers disponíveis para categoria selecionada
    const availableTiers = tiers.filter(t => t.category_id === selectedCategoryId)
    const selectedTier = tiers.find(t => t.id === selectedTierId)

    // Atualizar limite de fotos quando categoria muda
    useEffect(() => {
        if (selectedCategory) {
            if (selectedCategory.requires_tier) {
                // Categoria com modalidade: permite até o máximo do Lendário (25 fotos)
                const maxTierPhotos = Math.max(...tiers.map(t => t.max_photos || 5), 25)
                setMaxPhotosAllowed(maxTierPhotos)
            } else {
                // Categoria sem modalidade: usa limite da própria categoria
                setMaxPhotosAllowed(selectedCategory.max_photos || 5)
            }
        }
    }, [selectedCategory, tiers])

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadData()
    }, [user])

    async function loadData() {
        if (!user) return
        setLoading(true)

        // Carregar categorias
        const { data: categoriesData } = await supabase
            .from('marketplace_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        if (categoriesData) setCategories(categoriesData)

        // Carregar tiers
        const { data: tiersData } = await supabase
            .from('marketplace_ad_tiers')
            .select('*')
            .eq('is_active', true)

        if (tiersData) setTiers(tiersData)

        // Carregar plano do usuário
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

        if (subscription) {
            const { data: planConfig } = await supabase
                .from('plan_config')
                .select('tier, max_marketplace_ads')
                .eq('tier', subscription.plan_id)
                .single()

            if (planConfig) {
                setUserPlan({
                    tier: planConfig.tier,
                    maxAds: planConfig.max_marketplace_ads
                })
            }
        }

        // Contar anúncios ativos do usuário
        const { count } = await supabase
            .from('marketplace_ads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['active', 'pending_payment'])

        setCurrentAdsCount(count || 0)
        setLoading(false)
    }

    // Verificar permissão de criar anúncio
    const adPermission = canCreateAd(currentAdsCount, userPlan.maxAds)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const currentCount = images.length
            const remaining = maxPhotosAllowed - currentCount

            if (remaining <= 0) {
                toast.error(`Limite de ${maxPhotosAllowed} fotos atingido`)
                return
            }

            const filesToAdd = newFiles.slice(0, remaining)

            if (filesToAdd.length < newFiles.length) {
                toast.warning(`Apenas ${remaining} foto(s) adicionada(s). Limite: ${maxPhotosAllowed}`)
            }

            setImages(prev => [...prev, ...filesToAdd])

            // Criar previews
            filesToAdd.forEach(file => {
                const url = URL.createObjectURL(file)
                setImageUrls(prev => [...prev, url])
            })
        }
    }


    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setImageUrls(prev => prev.filter((_, i) => i !== index))
    }

    const moveImage = (index: number, direction: 'left' | 'right') => {
        const newIndex = direction === 'left' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= images.length) return

        setImages(prev => {
            const newArr = [...prev]
                ;[newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]]
            return newArr
        })
        setImageUrls(prev => {
            const newArr = [...prev]
                ;[newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]]
            return newArr
        })
    }

    const setAsCover = (index: number) => {
        if (index === 0) return
        setImages(prev => {
            const newArr = [...prev]
            const [item] = newArr.splice(index, 1)
            newArr.unshift(item)
            return newArr
        })
        setImageUrls(prev => {
            const newArr = [...prev]
            const [item] = newArr.splice(index, 1)
            newArr.unshift(item)
            return newArr
        })
        toast.success('Foto definida como capa!')
    }

    // Drag and Drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index)
        }
    }

    const handleDragLeave = () => {
        setDragOverIndex(null)
    }

    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) {
            setDraggedIndex(null)
            setDragOverIndex(null)
            return
        }

        // Reordenar arrays
        setImages(prev => {
            const newArr = [...prev]
            const [draggedItem] = newArr.splice(draggedIndex, 1)
            newArr.splice(index, 0, draggedItem)
            return newArr
        })
        setImageUrls(prev => {
            const newArr = [...prev]
            const [draggedItem] = newArr.splice(draggedIndex, 1)
            newArr.splice(index, 0, draggedItem)
            return newArr
        })

        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    const onSubmit = async (data: FormData) => {
        if (!user) return
        // REMOVIDO: Verificação movida para página de escolha de modalidade


        setIsSubmitting(true)

        try {
            // Upload das imagens
            const uploadedUrls: string[] = []
            for (const image of images) {
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${image.name.split('.').pop()}`

                const { error: uploadError } = await supabase.storage
                    .from('marketplace')
                    .upload(fileName, image)

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('marketplace')
                        .getPublicUrl(fileName)
                    uploadedUrls.push(urlData.publicUrl)
                }
            }

            // Calcular expiração
            const durationDays = selectedTier?.duration_days || selectedCategory?.duration_days || 30
            const expiresAt = calculateExpirationDate(durationDays)

            // Montar detalhes específicos
            let vehicle_details = null
            let property_details = null

            if (isVehicle) {
                vehicle_details = {
                    year: parseInt(data.vehicle_year_fab || '0'),
                    make: data.vehicle_make || '',
                    model: data.vehicle_model || '',
                    km: parseInt(data.vehicle_km || '0'),
                    color: data.vehicle_color || ''
                }
            }

            if (isProperty) {
                property_details = {
                    type: data.property_type || 'venda',
                    area: parseInt(data.property_area || '0'),
                    bedrooms: parseInt(data.property_bedrooms || '0'),
                    bathrooms: parseInt(data.property_bathrooms || '0')
                }
            }

            // Determinar status e payment_status
            const tierIsFree = !selectedTier || selectedTier.price === 0
            const status = tierIsFree ? 'active' : 'pending_payment'
            const payment_status = tierIsFree ? 'free' : 'pending'

            // Criar anúncio
            const { data: newAd, error: insertError } = await supabase

                .from('marketplace_ads')
                .insert({
                    user_id: user.id,
                    category_id: data.category_id,
                    ad_tier_id: selectedTierId,
                    title: data.title,
                    description: data.description,
                    price: parseFloat(data.price),
                    condition: data.condition || null,
                    location: data.location,
                    images: uploadedUrls,
                    vehicle_details,
                    property_details,
                    status,
                    payment_status,
                    listing_type: listingType, // 🆕 Tipo do anúncio
                    expires_at: expiresAt.toISOString(),
                    published_at: tierIsFree ? new Date().toISOString() : null
                })
                .select('id')
                .single()


            if (insertError) throw insertError

            toast.success('Anúncio criado com sucesso!')

            // Se tier for pago, redirecionar para pagamento
            if (!tierIsFree) {
                // TODO: Integração Stripe
                toast.info('Redirecionando para pagamento...')
            }

            router.push(`/marketplace/${newAd.id}/choose-tier`)


        } catch (error: any) {
            console.error('Erro ao criar anúncio:', error)
            toast.error('Erro ao criar anúncio: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-adventure pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // REMOVIDO: Agora SEMPRE permite criar anúncio
    // Verificação de modalidade será feita na próxima página
    if (false && !adPermission.allowed) {

        return (
            <div className="min-h-screen bg-adventure pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                    <h1 className="text-2xl font-bold text-primary mb-4">Limite de Anúncios Atingido</h1>
                    <p className="text-muted-foreground mb-6">{adPermission.message}</p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/marketplace">
                            <Button variant="outline">Voltar</Button>
                        </Link>
                        <Link href="/planos">
                            <Button>Ver Planos</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-6">
                    <Link href="/marketplace">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Marketplace
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-primary font-montserrat">Criar Anúncio</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Categoria */}
                    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Categoria *</Label>
                                <Select onValueChange={(val) => {
                                    setValue('category_id', val)
                                    setSelectedTierId(null)
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a categoria..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && <p className="text-sm text-destructive mt-1">{errors.category_id.message}</p>}
                            </div>

                            {/* 🆕 TIPO: Vender ou Procurar */}
                            <div>
                                <Label className="flex items-center gap-2 mb-3">
                                    🔄 Tipo de Anúncio
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setListingType('sell')}
                                        className={`
                                            p-4 rounded-lg border-2 transition-all font-semibold
                                            ${listingType === 'sell'
                                                ? 'border-green-500 bg-green-500/10 text-green-700'
                                                : 'border-muted hover:border-green-500/50 text-muted-foreground'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Star className="w-5 h-5" />
                                            <span>Quero Vender</span>
                                        </div>
                                        <p className="text-xs opacity-75">Tenho este item para vender</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setListingType('buy')}
                                        className={`
                                            p-4 rounded-lg border-2 transition-all font-semibold
                                            ${listingType === 'buy'
                                                ? 'border-orange-500 bg-orange-500/10 text-orange-700'
                                                : 'border-muted hover:border-orange-500/50 text-muted-foreground'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <AlertCircle className="w-5 h-5" />
                                            <span>Procurando</span>
                                        </div>
                                        <p className="text-xs opacity-75">Estou procurando este item</p>
                                    </button>
                                </div>
                            </div>

                            {/* Modalidade do Anúncio */}
                            {availableTiers.length > 0 && (
                                <div>
                                    <Label className="flex items-center gap-2 mb-3">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        Modalidade do Anúncio
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {availableTiers.map(tier => (
                                            <div
                                                key={tier.id}
                                                onClick={() => setSelectedTierId(tier.id)}
                                                className={`
                                                    p-4 rounded-lg border-2 cursor-pointer transition-all
                                                    ${selectedTierId === tier.id
                                                        ? tier.tier_level === 'lendario'
                                                            ? 'border-amber-500 bg-amber-500/10'
                                                            : tier.tier_level === 'elite'
                                                                ? 'border-green-500 bg-green-500/10'
                                                                : 'border-primary bg-primary/10'
                                                        : 'border-muted hover:border-primary/50'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    {tier.tier_level === 'lendario' && <Crown className="w-4 h-4 text-amber-500" />}
                                                    {tier.tier_level === 'elite' && <Star className="w-4 h-4 text-green-500" />}
                                                    <span className="font-bold">{tier.name}</span>
                                                </div>
                                                <p className="text-lg font-bold text-primary">
                                                    {tier.price === 0 ? 'Grátis' : `R$ ${tier.price.toFixed(2)}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {tier.duration_days} dias online
                                                </p>
                                                {tier.features && (
                                                    <ul className="mt-2 space-y-1">
                                                        {(tier.features as string[]).slice(0, 3).map((f, i) => (
                                                            <li key={i} className="text-xs flex items-center gap-1 text-muted-foreground">
                                                                <Check className="w-3 h-3 text-green-500" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dados do Anúncio */}
                    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Título *</Label>
                                <Input placeholder="Ex: Toyota Hilux 2023" {...register('title')} />
                                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Preço (R$) *</Label>
                                    <Input type="number" step="0.01" placeholder="0,00" {...register('price')} />
                                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                                </div>
                                {!isProperty && (
                                    <div>
                                        <Label>Condição</Label>
                                        <Select onValueChange={(val) => setValue('condition', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background">
                                                {AD_CONDITIONS.map(cond => (
                                                    <SelectItem key={cond.value} value={cond.value}>
                                                        {cond.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Localização *</Label>
                                <LocationSelector
                                    onLocationChange={(location) => setValue('location', location)}
                                    defaultValue={watch('location')}
                                />
                                {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
                            </div>

                            <div>
                                <Label>Descrição *</Label>
                                <Textarea className="min-h-[120px]" placeholder="Descreva seu item..." {...register('description')} />
                                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
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
                                        <Select onValueChange={(val) => setValue('property_type', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Venda / Locação" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background">
                                                <SelectItem value="venda">Venda</SelectItem>
                                                <SelectItem value="locacao">Locação</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Área (m²)</Label>
                                        <Input type="number" placeholder="120" {...register('property_area')} />
                                    </div>
                                    <div>
                                        <Label>Quartos</Label>
                                        <Input type="number" placeholder="3" {...register('property_bedrooms')} />
                                    </div>
                                    <div>
                                        <Label>Banheiros</Label>
                                        <Input type="number" placeholder="2" {...register('property_bathrooms')} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Imagens */}
                    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Label>Fotos</Label>
                                <span className={`text-sm font-medium ${images.length >= maxPhotosAllowed ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {images.length}/{maxPhotosAllowed}
                                </span>
                            </div>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${images.length >= maxPhotosAllowed
                                    ? 'border-destructive/30 bg-destructive/5 cursor-not-allowed'
                                    : 'border-primary/30 hover:bg-primary/5 cursor-pointer'
                                    }`}
                                onClick={() => images.length < maxPhotosAllowed && document.getElementById('image-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={images.length >= maxPhotosAllowed}
                                />
                                <Upload className={`w-8 h-8 mx-auto mb-2 ${images.length >= maxPhotosAllowed ? 'text-destructive/50' : 'text-primary/50'}`} />
                                <p className="text-sm text-muted-foreground">
                                    {images.length >= maxPhotosAllowed ? 'Limite de fotos atingido' : 'Clique para adicionar fotos'}
                                </p>

                            </div>

                            {imageUrls.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {/* Grid de todas as imagens com drag and drop */}
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {imageUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={() => handleDrop(index)}
                                                onDragEnd={handleDragEnd}
                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ${index === 0
                                                    ? 'ring-2 ring-primary ring-offset-2 col-span-2 row-span-2'
                                                    : 'border border-primary/30'
                                                    } ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                                    } ${dragOverIndex === index ? 'ring-2 ring-blue-500 scale-105' : ''
                                                    }`}
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`Imagem ${index + 1}`}
                                                    fill
                                                    className="object-cover pointer-events-none"
                                                />

                                                {/* Badge de capa */}
                                                {index === 0 && (
                                                    <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" />
                                                        CAPA
                                                    </div>
                                                )}

                                                {/* Overlay com ações */}
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors group">
                                                    {/* Ícone de arrastar */}
                                                    <div className="absolute top-1 left-1 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <GripVertical className="w-4 h-4 text-white" />
                                                    </div>

                                                    {/* Botão remover */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeImage(index)
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>

                                                    {/* Botão definir como capa (exceto para a primeira) */}
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setAsCover(index)
                                                            }}
                                                            className="absolute bottom-1 left-1 right-1 mx-auto w-fit px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
                                                        >
                                                            ★ Definir capa
                                                        </button>
                                                    )}

                                                    {/* Número da foto */}
                                                    <div className={`absolute ${index === 0 ? 'bottom-2 right-2' : 'bottom-1 right-1'} bg-black/60 text-white text-xs px-1.5 py-0.5 rounded`}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-muted-foreground text-center">
                                        ✋ Arraste para reordenar • A primeira foto é a capa
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botão de Enviar */}
                    <Button
                        type="submit"
                        className="w-full glow-orange font-bold text-lg h-12"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publicando...
                            </>
                        ) : selectedTier && selectedTier.price > 0 ? (
                            `Continuar para Pagamento (R$ ${selectedTier.price.toFixed(2)})`
                        ) : (
                            'Publicar Anúncio'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
