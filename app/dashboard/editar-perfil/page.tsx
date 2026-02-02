'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { getPlanLimits } from '@/lib/constants/plan-limits'
import { createClient } from '@/lib/supabase/client'
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    ArrowLeft, Camera, User, Mail, Phone, MapPin, Instagram,
    MessageCircle, Lock, Save, Loader2, CheckCircle, AlertCircle,
    Image as ImageIcon, Trash2, Tag, X
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { generateSlug } from '@/lib/profile/utils'
import * as LucideIcons from 'lucide-react'
import { ImageCropDialog } from '@/components/ui/image-crop-dialog'
import { CategorySearch } from '@/components/categories/CategorySearch'
import { toast } from 'sonner'

interface ProfileFormData {
    full_name: string
    bio: string
    phone: string
    whatsapp: string
    instagram: string
    pista: string
    rota_number: string
    slug: string
    specialties: string[]
}

export default function EditarPerfilPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const supabase = createClient()
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Crop dialog states
    const [cropDialogOpen, setCropDialogOpen] = useState(false)
    const [cropImageSrc, setCropImageSrc] = useState('')
    const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar')

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [coverUrl, setCoverUrl] = useState<string | null>(null)
    const [pageBackground, setPageBackground] = useState<string>('light') // Background da PÁGINA (não do header)
    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        bio: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        pista: '',
        rota_number: '',
        slug: '',
        specialties: []
    })

    // Categorias disponíveis
    interface Category {
        id: string
        name: string
        slug: string
        icon: string
        color: string
    }
    const [availableCategories, setAvailableCategories] = useState<Category[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    // Pistas disponíveis
    interface Pista {
        id: string
        name: string
        city: string
        state: string
    }
    const [availablePistas, setAvailablePistas] = useState<Pista[]>([])
    const [selectedPistaId, setSelectedPistaId] = useState<string | null>(null)
    const [userMaxCategories, setUserMaxCategories] = useState<number>(3) // Limite de categorias por plano

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadProfile()
    }, [user, authLoading])

    async function loadProfile() {
        if (!user) return
        setLoading(true)

        // Carregar categorias disponíveis
        const { data: categories } = await supabase
            .from('service_categories')
            .select('id, name, slug, icon, color')
            .eq('active', true)
            .order('name')

        if (categories) {
            setAvailableCategories(categories)
        }

        // Carregar pistas disponíveis
        const { data: pistas } = await supabase
            .from('pistas')
            .select('id, name, city, state')
            .eq('active', true)
            .order('state')
            .order('city')

        if (pistas) {
            setAvailablePistas(pistas)
        }

        // Carregar perfil (SEM plan_config que não existe mais!)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            console.error('[Editar Perfil] Erro ao carregar perfil:', profileError)
            toast.error('Erro ao carregar perfil')
            setLoading(false)
            return
        }

        // Buscar subscription separadamente
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // FONTE ÚNICA DE VERDADE - plan-limits.ts
        const limits = getPlanLimits(subscription?.plan_id)
        setUserMaxCategories(limits.max_categories)

        // Popular formulário com dados do perfil
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                phone: profile.phone || '',
                whatsapp: profile.whatsapp || '',
                instagram: profile.instagram || '',
                pista: profile.pista || '',
                rota_number: profile.rota_number || '',
                slug: profile.slug || '',
                specialties: []
            })
            setAvatarUrl(profile.avatar_url)
            setCoverUrl(profile.cover_url)
            setSelectedPistaId(profile.pista_id || null)
        }

        // Carregar categorias do usuário
        const { data: userCats } = await supabase
            .from('user_categories')
            .select('category_id')
            .eq('user_id', user.id)

        if (userCats) {
            setSelectedCategories(userCats.map(c => c.category_id))
        }

        setLoading(false)
    }

    // Abre dialog de crop quando seleciona arquivo de avatar
    function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setCropImageSrc(reader.result as string)
            setCropType('avatar')
            setCropDialogOpen(true)
        }
        reader.readAsDataURL(file)

        // Reset input para permitir selecionar o mesmo arquivo novamente
        e.target.value = ''
    }

    // Abre dialog de crop quando seleciona arquivo de capa
    function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setCropImageSrc(reader.result as string)
            setCropType('cover')
            setCropDialogOpen(true)
        }
        reader.readAsDataURL(file)

        // Reset input para permitir selecionar o mesmo arquivo novamente
        e.target.value = ''
    }

    // Faz upload do avatar após o crop
    async function handleCroppedAvatarUpload(croppedBlob: Blob) {
        if (!user) return

        setUploadingAvatar(true)
        setError(null)

        try {
            console.log('📷 Iniciando upload do avatar...')
            console.log('📷 Tamanho do blob:', croppedBlob.size, 'bytes')

            // Remover avatar antigo se existir
            if (avatarUrl) {
                const oldPath = avatarUrl.split('/').pop()
                if (oldPath) {
                    console.log('📷 Removendo avatar antigo:', oldPath)
                    await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
                }
            }

            // Fazer upload do novo
            const fileName = `avatar-${Date.now()}.jpg`
            const filePath = `${user.id}/${fileName}`
            console.log('📷 Fazendo upload para:', filePath)

            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedBlob, { upsert: true, contentType: 'image/jpeg' })

            if (uploadError) {
                console.error('📷 Erro no upload:', uploadError)
                throw uploadError
            }

            console.log('📷 Upload bem-sucedido:', uploadData)

            // Pegar URL pública
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            console.log('📷 URL pública:', urlData.publicUrl)

            // Atualizar no banco
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: urlData.publicUrl })
                .eq('id', user.id)

            if (updateError) {
                console.error('📷 Erro ao atualizar banco:', updateError)
                throw updateError
            }

            console.log('📷 Avatar atualizado com sucesso!')
            setAvatarUrl(urlData.publicUrl)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            console.error('📷 Erro geral:', err)
            setError('Erro ao fazer upload da foto: ' + err.message)
        } finally {
            setUploadingAvatar(false)
        }
    }

    // Faz upload da capa após o crop
    async function handleCroppedCoverUpload(croppedBlob: Blob) {
        if (!user) return

        setUploadingCover(true)
        setError(null)

        try {
            // Remover capa antiga se existir
            if (coverUrl) {
                const oldPath = coverUrl.split('/').pop()
                if (oldPath) {
                    await supabase.storage.from('covers').remove([`${user.id}/${oldPath}`])
                }
            }

            // Fazer upload do novo
            const fileName = `cover-${Date.now()}.jpg`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(filePath, croppedBlob, { upsert: true, contentType: 'image/jpeg' })

            if (uploadError) throw uploadError

            // Pegar URL pública
            const { data: urlData } = supabase.storage
                .from('covers')
                .getPublicUrl(filePath)

            // Atualizar no banco
            await supabase
                .from('profiles')
                .update({ cover_url: urlData.publicUrl })
                .eq('id', user.id)

            setCoverUrl(urlData.publicUrl)
        } catch (err: any) {
            setError('Erro ao fazer upload da capa: ' + err.message)
        } finally {
            setUploadingCover(false)
        }
    }

    // Handler para quando o crop é confirmado
    function handleCropComplete(croppedBlob: Blob) {
        if (cropType === 'avatar') {
            handleCroppedAvatarUpload(croppedBlob)
        } else {
            handleCroppedCoverUpload(croppedBlob)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return

        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            // Sempre gerar slug baseado no nome atual
            const slug = generateSlug(formData.full_name)

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    instagram: formData.instagram,
                    pista: formData.pista,
                    pista_id: selectedPistaId,
                    slug: slug,
                    avatar_url: avatarUrl,
                    cover_url: coverUrl
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // Atualizar categorias do usuário
            // 1. Remover todas as categorias existentes
            await supabase
                .from('user_categories')
                .delete()
                .eq('user_id', user.id)

            // 2. Inserir as novas categorias selecionadas
            if (selectedCategories.length > 0) {
                const newCategories = selectedCategories.map(catId => ({
                    user_id: user.id,
                    category_id: catId
                }))

                const { error: catError } = await supabase
                    .from('user_categories')
                    .insert(newCategories)

                if (catError) throw catError
            }

            setFormData(prev => ({ ...prev, slug }))
            setSuccess(true)

            // 🎖️ Verificar medalha "Alistamento Concluído" (perfil 100% completo)
            try {
                const { checkProfileCompletion } = await import('@/lib/api/profile')
                await checkProfileCompletion(user.id)
            } catch (badgeError) {
                console.error('Erro ao verificar medalha de perfil:', badgeError)
            }

            // Redirecionar para dashboard após 1.5 segundos
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)
        } catch (err: any) {
            setError('Erro ao salvar: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    // Toggle categoria selecionada
    function toggleCategory(categoryId: string) {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    // Helper para pegar ícone
    function getCategoryIcon(iconName: string) {
        const Icon = (LucideIcons as any)[iconName]
        return Icon ? <Icon className="w-4 h-4" /> : <Tag className="w-4 h-4" />
    }

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault()
        setPasswordError(null)
        setPasswordSuccess(false)

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('As senhas não coincidem')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setSaving(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            })

            if (error) throw error

            setPasswordSuccess(true)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setShowPasswordForm(false)
            setTimeout(() => setPasswordSuccess(false), 3000)
        } catch (err: any) {
            setPasswordError('Erro ao alterar senha: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure pt-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-primary text-lg font-semibold">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Editar Perfil</h1>
                            <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm text-green-500">Perfil atualizado com sucesso!</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Foto de Capa */}
                    <Card className="shadow-lg shadow-black/10 border border-white/10 overflow-hidden">
                        <div className="relative">
                            {/* Preview Area */}
                            <div className="relative h-48 w-full overflow-hidden rounded-t-xl group">
                                {coverUrl && !coverUrl.startsWith('preset:') ? (
                                    <Image
                                        src={coverUrl}
                                        alt="Capa"
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    /* Preset Preview Logic */
                                    (() => {
                                        const preset = coverUrl?.startsWith('preset:') ? coverUrl.split(':')[1] : 'light'
                                        switch (preset) {
                                            case 'light': return <div className="absolute inset-0 bg-[#e6e6e6]" />
                                            case 'rota_business': return <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8e8] via-[#d4d4d4] to-[#c0c0c0]" />
                                            case 'verde_claro': return <div className="absolute inset-0 bg-gradient-to-br from-[#d4e8d4] via-[#e8f5e8] to-[#c8dcc8]" />
                                            case 'laranja_claro': return <div className="absolute inset-0 bg-gradient-to-br from-[#ffe4d4] via-[#ffd4b8] to-[#ffcba0]" />
                                            case 'bege_aventura': return <div className="absolute inset-0 bg-gradient-to-br from-[#f5f0e8] via-[#e8dcc8] to-[#d4c8b0]" />
                                            case 'azul_claro': return <div className="absolute inset-0 bg-gradient-to-br from-[#d4e8f5] via-[#e0f0ff] to-[#c8dce8]" />
                                            case 'rosa_claro': return <div className="absolute inset-0 bg-gradient-to-br from-[#ffd4e8] via-[#ffe8f0] to-[#ffc8dc]" />
                                            case 'amarelo_claro': return <div className="absolute inset-0 bg-gradient-to-br from-[#fff8d4] via-[#ffeed4] to-[#ffe4b8]" />
                                            case 'verde_menta': return <div className="absolute inset-0 bg-gradient-to-br from-[#d4f5e8] via-[#e0fff0] to-[#c8ffe0]" />
                                            case 'lavanda': return <div className="absolute inset-0 bg-gradient-to-br from-[#e8d4f5] via-[#f0e8ff] to-[#dcc8e8]" />
                                            case 'pêssego': return <div className="absolute inset-0 bg-gradient-to-br from-[#ffe8d4] via-[#fff0e0] to-[#ffd8c0]" />
                                            default: return <div className="absolute inset-0 bg-[#e6e6e6]" />
                                        }
                                    })()
                                )}

                                {/* Overlay Upload */}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 gap-3">
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverSelect}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-white text-white hover:bg-white hover:text-black"
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={uploadingCover}
                                    >
                                        {uploadingCover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                                        Fazer Upload de Imagem
                                    </Button>
                                    <p className="text-xs text-gray-300">ou selecione um tema abaixo</p>
                                </div>
                            </div>

                            {/* Preset Selector - DESABILITADO TEMPORARIAMENTE */}
                            {/* <div className="p-4 bg-muted/30 border-t border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temas Disponíveis</p>
                                    <span className="text-[10px] text-muted-foreground/50">Clique para aplicar</span>
                                </div>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                    {[
                                        { id: 'cinza', name: 'Cinza', hex: '#2d2d2d', bgClass: 'bg-[#2d2d2d]' },
                                        { id: 'grafite', name: 'Grafite', hex: '#3a3a3a', bgClass: 'bg-[#3a3a3a]' },
                                        { id: 'militar', name: 'Militar', hex: '#2e3b2e', bgClass: 'bg-[#2e3b2e]' },
                                        { id: 'azul_escuro', name: 'Azul Navy', hex: '#1a2d4f', bgClass: 'bg-[#1a2d4f]' },
                                        { id: 'marrom', name: 'Marrom', hex: '#3d2b1f', bgClass: 'bg-[#3d2b1f]' },
                                        { id: 'preto', name: 'Preto', hex: '#1a1a1a', bgClass: 'bg-[#1a1a1a]' },
                                    ].map((theme) => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={async () => {
                                                document.body.style.background = theme.hex


                                                // Salvar automaticamente no banco
                                                if (user) {
                                                    await supabase
                                                        .from('profiles')
                                                        .update({ page_background: theme.id })
                                                        .eq('id', user.id)

                                                    console.log('[Background] Salvo automaticamente:', theme.id)
                                                }
                                            }}
                                            className="flex flex-col items-center gap-1.5 group p-2 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-105"
                                        >
                                            <div className={`
                                                w-full aspect-square rounded-lg shadow-sm transition-all
                                                ${theme.bgClass}
                                            `} />
                                            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-primary transition-colors text-center w-full truncate">
                                                {theme.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div> */}
                        </div>

                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-start gap-6">
                                {/* Avatar com Moldura V6 */}
                                <div className="relative -mt-20 group">
                                    <div
                                        className="relative cursor-pointer transition-transform hover:scale-105"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        <LogoFrameAvatar
                                            src={avatarUrl}
                                            alt="Avatar"
                                            size="lg" // Usando tamanho grande para destaque
                                            className="drop-shadow-2xl"
                                        />

                                        {/* Overlay de Edição apenas no hover */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 clip-path-diamond">
                                            <Camera className="w-8 h-8 text-white drop-shadow-md" />
                                        </div>
                                    </div>

                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarSelect}
                                        className="hidden"
                                    />

                                    {/* Botão flutuante visível sempre (fallback mobile) */}
                                    <Button
                                        type="button"
                                        size="icon"
                                        className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full shadow-lg bg-green-600 hover:bg-green-700 border border-white/20 md:hidden"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            avatarInputRef.current?.click()
                                        }}
                                        disabled={uploadingAvatar}
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Info */}
                                <div className="flex-1 pt-2">
                                    <p className="text-sm text-muted-foreground mb-1">Foto de Perfil</p>
                                    <p className="text-xs text-muted-foreground/70">
                                        Recomendado: 400x400px, formato JPG ou PNG
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Informações Básicas */}
                    <Card className="shadow-lg shadow-black/10 border border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Informações Básicas
                            </CardTitle>
                            <CardDescription>Seus dados pessoais e biografia</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Nome Completo *</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rota_number">ID Rota</Label>
                                    <Input
                                        id="rota_number"
                                        value={formData.rota_number}
                                        disabled
                                        className="bg-muted"
                                        placeholder="Gerado automaticamente"
                                    />
                                    <p className="text-xs text-muted-foreground">Seu número na Rota (não editável)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Biografia</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Conte um pouco sobre você, sua história e experiência..."
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pista">Pista (Localização)</Label>
                                <Select
                                    value={selectedPistaId || ''}
                                    onValueChange={(value) => {
                                        setSelectedPistaId(value || null)
                                        const pista = availablePistas.find(p => p.id === value)
                                        if (pista) {
                                            setFormData(prev => ({ ...prev, pista: pista.name }))
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="Selecione sua pista" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePistas.length === 0 ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                                Nenhuma pista disponível
                                            </div>
                                        ) : (
                                            <>
                                                {/* Agrupar por estado */}
                                                {Object.entries(
                                                    availablePistas.reduce((acc, pista) => {
                                                        if (!acc[pista.state]) acc[pista.state] = []
                                                        acc[pista.state].push(pista)
                                                        return acc
                                                    }, {} as Record<string, typeof availablePistas>)
                                                ).sort().map(([state, statePistas]) => (
                                                    <div key={state}>
                                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                            {state}
                                                        </div>
                                                        {statePistas.map((pista) => (
                                                            <SelectItem key={pista.id} value={pista.id}>
                                                                {pista.city}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Não encontrou sua cidade? Entre em contato com o suporte.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categorias / Especialidades */}
                    <Card className="shadow-lg shadow-black/10 border border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary" />
                                Categorias & Especialidades
                            </CardTitle>
                            <CardDescription>
                                Selecione as áreas em que você atua. Isso ajudará outros membros a encontrá-lo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategorySearch
                                selectedCategories={availableCategories.filter(cat =>
                                    selectedCategories.includes(cat.id)
                                )}
                                onSelect={(category) => toggleCategory(category.id)}
                                onRemove={(categoryId) => toggleCategory(categoryId)}
                                maxCategories={userMaxCategories}
                                placeholder="Busque suas áreas de atuação..."
                            />
                        </CardContent>
                    </Card>

                    {/* Contato & Redes Sociais */}
                    <Card className="shadow-lg shadow-black/10 border border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-primary" />
                                Contato & Redes Sociais
                            </CardTitle>
                            <CardDescription>Formas de contato e redes sociais</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="pl-10 bg-muted"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">E-mail não pode ser alterado</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="(11) 99999-9999"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        <Input
                                            id="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                            placeholder="+55 11 99999-9999"
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Inclua código do país (+55)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                                        <Input
                                            id="instagram"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                                            placeholder="@seuperfil"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Segurança */}
                    <Card className="shadow-lg shadow-black/10 border border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Segurança
                            </CardTitle>
                            <CardDescription>Altere sua senha de acesso</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showPasswordForm ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Alterar Senha
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    {passwordError && (
                                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                            <p className="text-sm text-destructive">{passwordError}</p>
                                        </div>
                                    )}

                                    {passwordSuccess && (
                                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <p className="text-sm text-green-500">Senha alterada com sucesso!</p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Nova Senha</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="Repita a nova senha"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={handlePasswordChange}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Lock className="w-4 h-4 mr-2" />
                                            )}
                                            Alterar Senha
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setShowPasswordForm(false)
                                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                                setPasswordError(null)
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* URL do Perfil */}
                    <Card className="shadow-lg shadow-black/10 border border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                URL do Perfil
                            </CardTitle>
                            <CardDescription>Seu endereço público na plataforma</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Sua URL pública:</p>
                                <p className="font-mono text-primary font-medium">
                                    /{generateSlug(formData.full_name) || 'seu-nome'}/{formData.rota_number || '000000'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard">
                            <Button type="button" variant="ghost">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving} className="min-w-[150px]">
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>

            {/* Image Crop Dialog */}
            <ImageCropDialog
                open={cropDialogOpen}
                onOpenChange={setCropDialogOpen}
                imageSrc={cropImageSrc}
                aspectRatio={cropType === 'avatar' ? 1 : 3}
                onCropComplete={handleCropComplete}
                title={cropType === 'avatar' ? 'Recortar Foto de Perfil' : 'Recortar Foto de Capa'}
            />
        </div>
    )
}
