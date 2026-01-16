'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Store, Upload, X, Loader2, Car, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { MARKETPLACE_CATEGORIES } from '@/lib/data/marketplace'

// Schema Validation
const formSchema = z.object({
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    price: z.string().min(1, 'Informe o preço'),
    category: z.string().min(1, 'Selecione uma categoria'),
    condition: z.string().min(1, 'Selecione a condição'),
    description: z.string().min(10, 'Descrição muito curta'),
    location: z.string().min(3, 'Informe a localização'),
    // Vehicle specifics
    vehicle_year: z.string().optional(),
    vehicle_make: z.string().optional(),
    vehicle_model: z.string().optional(),
    vehicle_km: z.string().optional(),
    vehicle_color: z.string().optional(),
    // Property specifics
    property_type: z.string().optional(),
    property_area: z.string().optional(),
    property_bedrooms: z.string().optional(),
    property_bathrooms: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreateListingPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [images, setImages] = useState<File[]>([])

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    })

    const selectedCategory = watch('category')
    const isVehicle = selectedCategory === 'Veículos'
    const isProperty = selectedCategory === 'Imóveis'

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        console.log('Listing Data:', { ...data, images })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        router.push('/marketplace')
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
                    <h1 className="text-3xl font-bold text-primary font-montserrat">Anunciar Item</h1>
                    <p className="text-muted-foreground">Preencha os dados do seu anúncio</p>
                </div>

                <Card className="bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título do Anúncio</Label>
                                    <Input id="title" placeholder="Ex: iPhone 13 Pro Max" {...register('title')} />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Preço (R$)</Label>
                                        <Input id="price" type="number" placeholder="0,00" {...register('price')} />
                                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoria</Label>
                                        <Select onValueChange={(val) => setValue('category', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background">
                                                {MARKETPLACE_CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                                    </div>
                                </div>

                                {!isProperty && (
                                    <div className="space-y-2">
                                        <Label htmlFor="condition">Condição</Label>
                                        <Select onValueChange={(val) => setValue('condition', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background">
                                                <SelectItem value="new">Novo</SelectItem>
                                                <SelectItem value="used_like_new">Usado - Como Novo</SelectItem>
                                                <SelectItem value="used_good">Usado - Bom</SelectItem>
                                                <SelectItem value="used_fair">Usado - Aceitável</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Property Specifics */}
                            {isProperty && (
                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Tag className="w-5 h-5" />
                                        <h3 className="font-semibold">Detalhes do Imóvel</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="property_type">Tipo de Oferta</Label>
                                            <Select onValueChange={(val) => setValue('property_type', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Venda / Locação" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background">
                                                    <SelectItem value="venda">Venda</SelectItem>
                                                    <SelectItem value="locação">Locação</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="property_area">Área (m²)</Label>
                                            <Input id="property_area" type="number" placeholder="Ex: 120" {...register('property_area')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="property_bedrooms">Quartos</Label>
                                            <Input id="property_bedrooms" type="number" placeholder="Ex: 3" {...register('property_bedrooms')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="property_bathrooms">Banheiros</Label>
                                            <Input id="property_bathrooms" type="number" placeholder="Ex: 2" {...register('property_bathrooms')} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Specifics */}
                            {isVehicle && (
                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Car className="w-5 h-5" />
                                        <h3 className="font-semibold">Detalhes do Veículo</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_make">Montadora</Label>
                                            <Input id="vehicle_make" placeholder="Ex: Toyota" {...register('vehicle_make')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_model">Modelo</Label>
                                            <Input id="vehicle_model" placeholder="Ex: Corolla Xei" {...register('vehicle_model')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_year">Ano</Label>
                                            <Input id="vehicle_year" type="number" placeholder="2023" {...register('vehicle_year')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_km">Quilometragem</Label>
                                            <Input id="vehicle_km" type="number" placeholder="0" {...register('vehicle_km')} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="vehicle_color">Cor</Label>
                                            <Input id="vehicle_color" placeholder="Ex: Prata Metálico" {...register('vehicle_color')} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            <div className="space-y-2">
                                <Label>Fotos</Label>
                                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer relative"
                                    onClick={() => document.getElementById('image-upload')?.click()}>
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
                                {images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto py-2">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden group">
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-6 h-6 text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); removeImage(i); }} />
                                                </div>
                                                <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Description & Location */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea id="description" className="min-h-[150px]" {...register('description')} />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Localização</Label>
                                    <Input id="location" placeholder="Cidade, Estado" {...register('location')} />
                                    {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                                </div>
                            </div>

                            <Button type="submit" className="w-full glow-orange font-bold text-lg h-12" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    'Publicar Anúncio'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
