'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Flame, ArrowLeft, Briefcase, DollarSign, Calendar, CheckCircle, Upload, X, Image, Film } from 'lucide-react'

import { useAuth } from '@/lib/auth/context'
import { User, Mail, Phone } from 'lucide-react'
import { PROJECT_CATEGORIES } from '@/lib/data/categories'
import { SelectGroup, SelectLabel } from '@/components/ui/select'

// Base schema for project details
const baseProjectSchema = {
    title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
    description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres'),
    category: z.string().min(1, 'Selecione uma categoria'),
    budget: z.string().min(1, 'Informe o orçamento estimado'),
    deadline: z.string().optional(),
    attachments: z.any().optional(),
}

// Schema for guests (requires contact info)
const guestSchema = z.object({
    ...baseProjectSchema,
    name: z.string().min(3, 'Informe seu nome completo'),
    email: z.string().email('Informe um email válido'),
    phone: z.string().min(10, 'Informe um telefone válido'),
})

// Schema for logged users (contact info comes from profile)
const userSchema = z.object({
    ...baseProjectSchema,
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
})

type ProjectFormData = z.infer<typeof guestSchema>

export default function CreateProjectPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [files, setFiles] = useState<File[]>([])

    // Select schema based on auth status
    // We use a key to force re-render/re-initialization of the form when user state changes
    // This prevents schema mismatch issues during hydration or auth loading
    const schema = user ? userSchema : guestSchema

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(schema),
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: ProjectFormData) => {
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        const projectData = {
            ...data,
            // If user is logged in, use their data. If guest, use form data.
            author: user ? {
                id: user.id,
                name: user.full_name,
                email: user.email
            } : {
                name: data.name,
                email: data.email,
                phone: data.phone,
                is_guest: true
            },
            files
        }

        console.log('Project Submission:', projectData)
        setIsSuccess(true)
        setIsSubmitting(false)

        // Redirect after showing success message
        setTimeout(() => {
            router.push('/dashboard')
        }, 2000)
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-adventure">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-adventure flex items-center justify-center p-4">
                <Card className="w-full max-w-md glass-strong border-primary/20 animate-transform">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-orange">
                            <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-impact text-primary">
                            Projeto Lançado!
                        </h2>
                        <p className="text-muted-foreground">
                            {user
                                ? "Seu projeto foi publicado com sucesso. Em breve um membro do Rota Business entrará em contato."
                                : "Recebemos seu projeto! Criamos uma conta provisória para você acompanhar as propostas no seu email."
                            }
                        </p>
                        <Button
                            className="w-full glow-orange mt-4"
                            onClick={() => router.push('/dashboard')}
                        >
                            Voltar ao Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure">
            {/* Header */}
            <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <Flame className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                            <h1 className="text-2xl font-bold text-impact text-primary">Rota Business Club</h1>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold text-impact text-primary mb-2">
                            Lançar Novo Projeto
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Descreva sua necessidade e encontre o profissional ideal
                        </p>
                    </div>

                    <Card className="glass-strong border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">Detalhes do Projeto</CardTitle>
                            <CardDescription>Preencha as informações para atrair os melhores profissionais</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Guest Contact Info - Only shown if NOT logged in */}
                                {!user && (
                                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-4 mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-5 h-5 text-primary" />
                                            <h3 className="font-semibold text-primary">Seus Dados de Contato</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input
                                                id="name"
                                                placeholder="Como gostaria de ser chamado?"
                                                className="bg-background/50 border-primary/20 focus:border-primary"
                                                {...register('name')}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="seu@email.com"
                                                        className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                                                        {...register('email')}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        placeholder="(11) 99999-9999"
                                                        className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                                                        {...register('phone')}
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título do Projeto</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="title"
                                            placeholder="Ex: Desenvolvimento de App Fitness"
                                            className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                                            {...register('title')}
                                        />
                                    </div>
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title.message}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select onValueChange={(value) => setValue('category', value)}>
                                        <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-primary/20 max-h-[300px]">
                                            {PROJECT_CATEGORIES.map((group, index) => (
                                                <SelectGroup key={index}>
                                                    <SelectLabel className="text-primary font-bold mt-2">{group.label}</SelectLabel>
                                                    {group.options.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-destructive">{errors.category.message}</p>
                                    )}
                                </div>

                                {/* Budget & Deadline */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Orçamento Estimado</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="budget"
                                                placeholder="Ex: R$ 5.000 - R$ 10.000"
                                                className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                                                {...register('budget')}
                                            />
                                        </div>
                                        {errors.budget && (
                                            <p className="text-sm text-destructive">{errors.budget.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Prazo Desejado (Opcional)</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="deadline"
                                                placeholder="Ex: 30 dias"
                                                className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                                                {...register('deadline')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <Label>Anexos (Fotos e Vídeos)</Label>
                                    <div
                                        className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <Upload className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, MP4 (max. 10MB)
                                            </p>
                                        </div>
                                    </div>

                                    {/* File List */}
                                    {files.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 mt-4">
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-primary/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded bg-primary/10">
                                                            {file.type.startsWith('video') ? (
                                                                <Film className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <Image className="w-4 h-4 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                                            <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição Detalhada</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descreva os objetivos, requisitos e expectativas do projeto..."
                                        className="min-h-[150px] bg-background/50 border-primary/20 focus:border-primary resize-none"
                                        {...register('description')}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description.message}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full glow-orange-strong h-12 text-lg font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Lançando Projeto...' : 'Lançar Projeto Agora'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
