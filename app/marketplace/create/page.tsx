'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Upload, X, Loader2, Car, Home, Crown, Star, Check, AlertCircle, Info } from 'lucide-react'
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

// Schema de Validação
const formSchema = z.object({
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    price: z.string().min(1, 'Informe o preço'),
    category_id: z.string().min(1, 'Selecione uma categoria'),
    condition: z.string().optional(),
    description: z.string().min(10, 'Descrição muito curta'),
    location: z.string().min(3, 'Informe a localização'),
    // Veículos
    vehicle_year: z.string().optional(),
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

    const [categories, setCategories] = useState<MarketplaceCategory[]>([])
    const [tiers, setTiers] = useState<MarketplaceAdTier[]>([])
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null)

    const [userPlan, setUserPlan] = useState<{ tier: string, maxAds: number | null }>({ tier: 'recruta', maxAds: 0 })
    const [currentAdsCount, setCurrentAdsCount] = useState(0)

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
            setImages(prev => [...prev, ...newFiles])

            // Criar previews
            newFiles.forEach(file => {
                const url = URL.createObjectURL(file)
                setImageUrls(prev => [...prev, url])
            })
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setImageUrls(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: FormData) => {
        if (!user) return
        if (!adPermission.allowed) {
            toast.error(adPermission.message)
            return
        }

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
                    year: parseInt(data.vehicle_year || '0'),
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
            const { error: insertError } = await supabase
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
                    expires_at: expiresAt.toISOString(),
                    published_at: tierIsFree ? new Date().toISOString() : null
                })

            if (insertError) throw insertError

            toast.success('Anúncio criado com sucesso!')

            // Se tier for pago, redirecionar para pagamento
            if (!tierIsFree) {
                // TODO: Integração Stripe
                toast.info('Redirecionando para pagamento...')
            }

            router.push('/marketplace')

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

    if (!adPermission.allowed) {
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
                    <p className="text-muted-foreground">
                        {adPermission.message}
                    </p>
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
                                <Input placeholder="Cidade, Estado" {...register('location')} />
                                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Montadora</Label>
                                        <Input placeholder="Ex: Toyota" {...register('vehicle_make')} />
                                    </div>
                                    <div>
                                        <Label>Modelo</Label>
                                        <Input placeholder="Ex: Hilux SRX" {...register('vehicle_model')} />
                                    </div>
                                    <div>
                                        <Label>Ano</Label>
                                        <Input type="number" placeholder="2023" {...register('vehicle_year')} />
                                    </div>
                                    <div>
                                        <Label>Quilometragem</Label>
                                        <Input type="number" placeholder="0" {...register('vehicle_km')} />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Cor</Label>
                                        <Input placeholder="Ex: Preto Metálico" {...register('vehicle_color')} />
                                    </div>
                                </div>
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
                            <Label className="mb-4 block">Fotos</Label>
                            <div
                                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <Upload className="w-8 h-8 mx-auto text-primary/50 mb-2" />
                                <p className="text-sm text-muted-foreground">Clique para adicionar fotos</p>
                            </div>

                            {imageUrls.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-4">
                                    {imageUrls.map((url, i) => (
                                        <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden group">
                                            <Image src={url} alt={`Imagem ${i + 1}`} fill className="object-cover" />
                                            <div
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                onClick={() => removeImage(i)}
                                            >
                                                <X className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ))}
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
