'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    X, Loader2, Users, Briefcase, AtSign,
    Globe, Link2, Lock, Search, Check,
    ImagePlus, Send, Target, Flag
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { PostTypePatch } from './post-type-patch'

interface CreatePostModalV2Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    onPostCreated?: () => void
    preselectedConfraternityId?: string
    preselectedProjectId?: string
}

interface UserSearchResult {
    id: string
    full_name: string
    avatar_url: string | null
    rota_number: string | null
}

export function CreatePostModalV2({
    open,
    onOpenChange,
    userId,
    onPostCreated,
    preselectedConfraternityId,
    preselectedProjectId
}: CreatePostModalV2Props) {
    const [content, setContent] = useState('')
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public')

    // Post type selection
    const [postType, setPostType] = useState<'normal' | 'confraria' | 'em_campo' | 'projeto_entregue'>('normal')

    // Vinculações
    const [selectedConfraternityId, setSelectedConfraternityId] = useState<string | undefined>(preselectedConfraternityId)
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(preselectedProjectId)

    // Marcação de pessoas
    const [taggedUsers, setTaggedUsers] = useState<UserSearchResult[]>([])
    const [showUserSearch, setShowUserSearch] = useState(false)
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([])
    const [isSearchingUsers, setIsSearchingUsers] = useState(false)

    // Dados para seletores
    const [confraternities, setConfraternities] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])

    // Estado de validação de foto (para confrarias)
    const [isValidatingPhoto, setIsValidatingPhoto] = useState(false)
    const [validationResult, setValidationResult] = useState<{
        approved: boolean
        people_count?: number
        confidence: string
        reason: string
    } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const userSearchRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Carregar dados quando abre
    useEffect(() => {
        if (open) {
            loadUserData()

            // Se tem confraria pré-selecionada, definir tipo como confraria
            if (preselectedConfraternityId) {
                setPostType('confraria')
                setSelectedConfraternityId(preselectedConfraternityId)
            }
            // Se tem projeto pré-selecionado, definir tipo como projeto_entregue
            if (preselectedProjectId) {
                setPostType('projeto_entregue')
                setSelectedProjectId(preselectedProjectId)
            }
        }
    }, [open, userId, preselectedConfraternityId, preselectedProjectId])

    // Busca de usuários com debounce
    useEffect(() => {
        if (!userSearchQuery.trim()) {
            setUserSearchResults([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearchingUsers(true)
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, rota_number')
                    .neq('id', userId)
                    .ilike('full_name', `%${userSearchQuery}%`)
                    .limit(8)

                setUserSearchResults(data || [])
            } catch (error) {
                console.error('Error searching users:', error)
            } finally {
                setIsSearchingUsers(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [userSearchQuery, userId])

    // Fechar busca ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
                setShowUserSearch(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function loadUserData() {
        try {
            const { data: confData } = await supabase
                .from('confraternity_invites')
                .select(`
                    id, 
                    proposed_date, 
                    location, 
                    sender_id, 
                    receiver_id,
                    sender:profiles!sender_id(id, full_name, avatar_url),
                    receiver:profiles!receiver_id(id, full_name, avatar_url)
                `)
                .eq('status', 'accepted')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('proposed_date', { ascending: false })
                .limit(10)

            setConfraternities(confData || [])

            const { data: projData } = await supabase
                .from('portfolio_items')
                .select('id, title, description')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)

            setProjects(projData || [])
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const MAX_PHOTO_SIZE = 10 * 1024 * 1024
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024

        const invalidFiles: string[] = []
        const validFiles = files.filter(file => {
            const isVideo = file.type.startsWith('video/')
            const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_PHOTO_SIZE
            const maxSizeMB = isVideo ? 50 : 10

            if (file.size > maxSize) {
                invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB > ${maxSizeMB}MB)`)
                return false
            }
            return true
        })

        if (invalidFiles.length > 0) {
            alert(`Arquivos muito grandes:\n${invalidFiles.join('\n')}\n\nLimites: Fotos 10MB, Vídeos 50MB`)
        }

        if (validFiles.length === 0) return

        // ============================================================
        // 🔒 VALIDAÇÃO DE IA - DESABILITADA TEMPORARIAMENTE
        // Para reativar: descomente o bloco abaixo
        // ============================================================
        /*
        // VALIDAÇÃO PARA CONFRARIAS - Duplicados + IA para CADA foto
        if (postType === 'confraria' && validFiles.length > 0) {
            // Verificar limite de 10 fotos
            if (mediaFiles.length + validFiles.length > 10) {
                alert(`Limite de 10 fotos. Você já tem ${mediaFiles.length} foto(s).`)
                validFiles.splice(10 - mediaFiles.length)
                if (validFiles.length === 0) return
            }

            setIsValidatingPhoto(true)
            const approvedFiles: File[] = []

            // Mostrar preview temporário de todas enquanto valida
            const tempPreviews = [...mediaPreviews, ...validFiles.map(f => URL.createObjectURL(f))]
            setMediaPreviews(tempPreviews)

            try {
                for (const file of validFiles) {
                    console.log('[CreatePost] 🔍 Validando foto:', file.name)

                    // 1. VERIFICAR DUPLICADOS
                    const duplicateFormData = new FormData()
                    duplicateFormData.append('image', file)
                    duplicateFormData.append('userId', userId)

                    const duplicateResponse = await fetch('/api/confraternity/check-duplicate', {
                        method: 'POST',
                        body: duplicateFormData
                    })

                    const duplicateResult = await duplicateResponse.json()

                    if (duplicateResult.isDuplicate) {
                        alert(`🚫 Foto "${file.name}" já foi usada em outra confraria. Pulando...`)
                        continue
                    }

                    // 2. VALIDAR COM IA
                    const formDataToSend = new FormData()
                    formDataToSend.append('image', file)

                    const validateResponse = await fetch('/api/validate-confraternity', {
                        method: 'POST',
                        body: formDataToSend
                    })

                    const result = await validateResponse.json()
                    console.log('[CreatePost] Resultado:', result)

                    if (!result.approved) {
                        alert(`❌ Foto "${file.name}" não aprovada: ${result.reason}`)
                        continue
                    }

                    // Foto aprovada
                    approvedFiles.push(file)

                    // Salvar hash da primeira foto aprovada
                    if (approvedFiles.length === 1) {
                        setValidationResult({ ...result, imageHash: duplicateResult.hash, imageName: file.name })
                    }
                }

                // Atualizar estado com fotos aprovadas
                if (approvedFiles.length > 0) {
                    const updatedFiles = [...mediaFiles, ...approvedFiles].slice(0, 10)
                    setMediaFiles(updatedFiles)
                    setMediaPreviews(updatedFiles.map(f => URL.createObjectURL(f)))
                } else {
                    // Nenhuma aprovada - restaurar previews anteriores
                    setMediaPreviews(mediaFiles.map(f => URL.createObjectURL(f)))
                }

            } catch (error) {
                console.error('[CreatePost] Erro na validação:', error)
                // Em caso de erro, adicionar todas
                const updatedFiles = [...mediaFiles, ...validFiles].slice(0, 10)
                setMediaFiles(updatedFiles)
                setMediaPreviews(updatedFiles.map(f => URL.createObjectURL(f)))
            } finally {
                setIsValidatingPhoto(false)
            }

            return
        }
        */

        // UPLOAD LIVRE - Confrarias agora aceitam qualquer foto
        if (postType === 'confraria' && validFiles.length > 0) {
            if (mediaFiles.length + validFiles.length > 10) {
                alert(`Limite de 10 fotos. Você já tem ${mediaFiles.length} foto(s).`)
                validFiles.splice(10 - mediaFiles.length)
                if (validFiles.length === 0) return
            }

            const updatedFiles = [...mediaFiles, ...validFiles].slice(0, 10)
            setMediaFiles(updatedFiles)
            setMediaPreviews(updatedFiles.map(f => URL.createObjectURL(f)))
            // Marcar como aprovado automaticamente para permitir publicação
            setValidationResult({ approved: true, people_count: 2, confidence: 'manual', reason: 'Validação manual' })
            return
        }

        // Para outros tipos de post, adicionar normalmente
        const newFiles = [...mediaFiles, ...validFiles].slice(0, 10)
        setMediaFiles(newFiles)
        setMediaPreviews(newFiles.map(file => URL.createObjectURL(file)))
    }

    const removeMedia = (index: number) => {
        const newFiles = mediaFiles.filter((_, i) => i !== index)
        const newPreviews = mediaPreviews.filter((_, i) => i !== index)
        setMediaFiles(newFiles)
        setMediaPreviews(newPreviews)
    }

    const uploadMedia = async (file: File): Promise<string> => {
        const isVideo = file.type.startsWith('video/')
        const bucket = isVideo ? 'post-videos' : 'post-photos'
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { cacheControl: '3600', upsert: false })

        if (error) throw error

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
        return urlData.publicUrl
    }

    const addTaggedUser = (user: UserSearchResult) => {
        if (taggedUsers.find(u => u.id === user.id)) return
        setTaggedUsers([...taggedUsers, user])
        setUserSearchQuery('')
        setShowUserSearch(false)
    }

    const removeTaggedUser = (userId: string) => {
        setTaggedUsers(taggedUsers.filter(u => u.id !== userId))
    }

    const handleSubmit = async () => {
        if (!content.trim() && mediaFiles.length === 0) {
            alert('Adicione um texto ou mídia para publicar')
            return
        }

        // VALIDAÇÃO OBRIGATÓRIA: Confraria requer foto
        if (postType === 'confraria' && mediaFiles.length === 0) {
            alert('📷 Para registrar uma confraria, é obrigatório adicionar uma foto comprovando o encontro.')
            return
        }

        // VALIDAÇÃO OBRIGATÓRIA: Confraria requer selecionar uma
        if (postType === 'confraria' && !selectedConfraternityId) {
            alert('Selecione uma confraria antes de publicar.')
            return
        }

        setIsUploading(true)

        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
            const { count } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', oneHourAgo)

            if (count && count >= 5) {
                alert('Limite de 5 publicações por hora atingido.')
                setIsUploading(false)
                return
            }

            // Para confrarias, verificar se a foto já foi validada (validação ocorre no upload)
            if (postType === 'confraria' && mediaFiles.length > 0) {
                console.log('[CreatePost] Validando confraria...', { validationResult, mediaFiles: mediaFiles.length })
                if (!validationResult?.approved) {
                    console.log('[CreatePost] Validação falhou ou não existe:', validationResult)
                    const { toast } = await import('sonner')
                    toast.error('Foto não validada', {
                        description: '📷 Adicione uma foto que mostre você e seu parceiro juntos.'
                    })
                    setIsUploading(false)
                    return
                }
            }

            // Upload das mídias (após validação aprovada)
            const mediaUrls: string[] = []
            for (let i = 0; i < mediaFiles.length; i++) {
                setUploadProgress(Math.round(((i + 0.5) / mediaFiles.length) * 100))
                const url = await uploadMedia(mediaFiles[i])
                mediaUrls.push(url)
                setUploadProgress(Math.round(((i + 1) / mediaFiles.length) * 100))
            }

            let dbPostType = null
            if (postType === 'confraria') dbPostType = 'confraria'
            else if (postType === 'em_campo') dbPostType = 'em_campo'
            else if (postType === 'projeto_entregue') dbPostType = 'projeto_entregue'

            const { data: newPost, error } = await supabase
                .from('posts')
                .insert({
                    user_id: userId,
                    content: content.trim(),
                    media_urls: mediaUrls,
                    visibility,
                    confraternity_id: postType === 'confraria' ? selectedConfraternityId : null,
                    project_id: postType === 'projeto_entregue' ? selectedProjectId : null,
                    post_type: dbPostType,
                    tagged_user_ids: taggedUsers.map(u => u.id),
                    // Se for confraria e passou na validação, marcar como aprovado
                    validation_status: postType === 'confraria' ? 'approved' : null,
                    // Metadata para detecção de duplicados (confraria)
                    metadata: postType === 'confraria' && validationResult ? {
                        image_hash: (validationResult as any).imageHash,
                        image_name: (validationResult as any).imageName,
                        people_count: validationResult.people_count,
                        ai_confidence: validationResult.confidence
                    } : null
                })
                .select()
                .single()

            if (error) throw error

            // Se for confraria, vincular post como prova (pontos são gerenciados em lib/api/confraternity.ts)
            if (postType === 'confraria' && selectedConfraternityId && newPost) {
                try {
                    // Vincular post à confraria e marcar como completed
                    await supabase
                        .from('confraternity_invites')
                        .update({
                            proof_post_id: newPost.id,
                            status: 'completed',
                            proof_validated: true,
                            proof_validated_at: new Date().toISOString()
                        })
                        .eq('id', selectedConfraternityId)

                    console.log('[CreatePost] ✅ Post vinculado à confraria:', selectedConfraternityId)
                } catch (confError) {
                    console.error('[CreatePost] Erro ao vincular confraria:', confError)
                }
            }

            if (taggedUsers.length > 0 && newPost) {
                const notifications = taggedUsers.map(user => ({
                    user_id: user.id,
                    type: 'post_mention',
                    title: 'Você foi marcado em uma publicação',
                    message: content.substring(0, 100),
                    data: { post_id: newPost.id, mentioned_by: userId }
                }))

                await supabase.from('notifications').insert(notifications)
            }

            setContent('')
            setMediaFiles([])
            setMediaPreviews([])
            setVisibility('public')
            setPostType('normal')
            setSelectedConfraternityId(undefined)
            setSelectedProjectId(undefined)
            setTaggedUsers([])
            setUploadProgress(0)
            onOpenChange(false)
            onPostCreated?.()

            // Toast de sucesso
            if (postType === 'confraria') {
                const { toast } = await import('sonner')
                toast.success('🎉 Confraria registrada!', {
                    description: 'Você e seu parceiro ganharam +15 Vigor cada!'
                })
            }

        } catch (error: any) {
            console.error('Error creating post:', error)
            console.error('Error details:', JSON.stringify(error, null, 2))
            const { toast } = await import('sonner')
            toast.error('Erro ao criar publicação', {
                description: error?.message || 'Tente novamente'
            })
        } finally {
            setIsUploading(false)
        }
    }

    const visibilityOptions = [
        { value: 'public', icon: Globe, label: 'Público' },
        { value: 'connections', icon: Link2, label: 'Elos' },
        { value: 'private', icon: Lock, label: 'Privado' },
    ] as const

    // Configuração dos tipos de post - SEM emojis, visual sóbrio
    const postTypeConfig = {
        normal: { label: 'Publicação', icon: null, bg: 'bg-gray-100', activeBg: 'bg-gray-800', activeText: 'text-white', text: 'text-gray-700' },
        confraria: { label: 'Confraria', icon: Users, bg: 'bg-stone-100', activeBg: 'bg-stone-800', activeText: 'text-stone-100', text: 'text-stone-700' },
        em_campo: { label: 'Em Campo', icon: Target, bg: 'bg-zinc-100', activeBg: 'bg-zinc-800', activeText: 'text-zinc-100', text: 'text-zinc-700' },
        projeto_entregue: { label: 'Entregue', icon: Flag, bg: 'bg-emerald-100/50', activeBg: 'bg-emerald-900', activeText: 'text-emerald-100', text: 'text-emerald-800' },
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[85vh] p-0 overflow-hidden bg-white border border-gray-200 shadow-2xl flex flex-col">
                {/* Header - Sóbrio, sem gradiente vibrante */}
                <div className="bg-gray-900 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white tracking-tight">Nova Publicação</h2>
                            <p className="text-xs text-gray-400">Compartilhe na Rota</p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                    {/* Post Type Selector - Estilo militar/sóbrio */}
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(postTypeConfig) as Array<keyof typeof postTypeConfig>).map(type => {
                            const config = postTypeConfig[type]
                            const isActive = postType === type
                            const Icon = config.icon

                            return (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setPostType(type)
                                        if (type !== 'confraria') setSelectedConfraternityId(undefined)
                                        if (type !== 'projeto_entregue') setSelectedProjectId(undefined)
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all border",
                                        isActive
                                            ? `${config.activeBg} ${config.activeText} border-transparent shadow-md`
                                            : `${config.bg} ${config.text} border-gray-200 hover:border-gray-300`
                                    )}
                                >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    <span className="uppercase tracking-wide text-xs font-semibold">
                                        {config.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Confraria Selector */}
                    {postType === 'confraria' && confraternities.length > 0 && (
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                            <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Selecione a confraria
                            </label>
                            <div className="space-y-2">
                                {confraternities.map(conf => {
                                    const partner = conf.sender_id === userId ? conf.receiver : conf.sender
                                    const isSelected = selectedConfraternityId === conf.id
                                    return (
                                        <button
                                            key={conf.id}
                                            onClick={() => {
                                                setSelectedConfraternityId(conf.id)
                                                // Auto-marcar parceiro da confraria
                                                const partnerId = conf.sender_id === userId ? conf.receiver_id : conf.sender_id
                                                const partnerData = conf.sender_id === userId ? conf.receiver : conf.sender
                                                if (partnerData && partnerId && !taggedUsers.find(u => u.id === partnerId)) {
                                                    addTaggedUser({
                                                        id: partnerId,
                                                        full_name: partnerData.full_name || 'Parceiro',
                                                        avatar_url: partnerData.avatar_url || null,
                                                        rota_number: null
                                                    })
                                                }
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                                isSelected
                                                    ? "bg-stone-200 border-2 border-stone-400"
                                                    : "bg-white border border-stone-200 hover:border-stone-300"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                                                {partner?.avatar_url ? (
                                                    <Image src={partner.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-600 font-bold">
                                                        {partner?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-gray-900">{partner?.full_name || 'Parceiro'}</p>
                                                <p className="text-xs text-gray-500">{conf.location} • {new Date(conf.proposed_date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            {isSelected && <Check className="w-5 h-5 text-stone-600" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Project Selector */}
                    {postType === 'projeto_entregue' && projects.length > 0 && (
                        <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 space-y-3">
                            <label className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Selecione o projeto
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {projects.map(proj => {
                                    const isSelected = selectedProjectId === proj.id
                                    return (
                                        <button
                                            key={proj.id}
                                            onClick={() => setSelectedProjectId(proj.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                                isSelected
                                                    ? "bg-emerald-100 border-2 border-emerald-400"
                                                    : "bg-white border border-emerald-100 hover:border-emerald-300"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-emerald-700" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{proj.title}</p>
                                                {proj.description && (
                                                    <p className="text-xs text-gray-500 truncate">{proj.description}</p>
                                                )}
                                            </div>
                                            {isSelected && <Check className="w-5 h-5 text-emerald-600" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Textarea - Clean */}
                    <div className="relative">
                        <Textarea
                            placeholder="O que você quer compartilhar?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[100px] resize-none border border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg text-base bg-gray-50"
                            disabled={isUploading}
                        />
                        {postType !== 'normal' && (
                            <div className="absolute top-2 right-2">
                                <PostTypePatch type={postType} size="sm" />
                            </div>
                        )}
                    </div>

                    {/* Media Preview Grid - Tamanho reduzido */}
                    {mediaPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-start">
                            {mediaPreviews.map((preview, index) => (
                                <div key={index} className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden group">
                                    <Image
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />

                                    {/* Overlay de validação para confraria */}
                                    {postType === 'confraria' && index === 0 && (
                                        <>
                                            {isValidatingPhoto && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                                                </div>
                                            )}
                                            {validationResult?.approved && !isValidatingPhoto && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] text-center py-0.5 font-medium">
                                                    ✓ Aprovada
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <button
                                        onClick={() => removeMedia(index)}
                                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        disabled={isUploading || isValidatingPhoto}
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tagged Users */}
                    {taggedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {taggedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full pl-1 pr-2 py-1"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                        {user.avatar_url ? (
                                            <Image src={user.avatar_url} alt="" width={24} height={24} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
                                                {user.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">{user.full_name}</span>
                                    <button
                                        onClick={() => removeTaggedUser(user.id)}
                                        className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* User Search */}
                    <div ref={userSearchRef} className="relative">
                        <button
                            onClick={() => setShowUserSearch(!showUserSearch)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all",
                                showUserSearch
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            <AtSign className="w-4 h-4" />
                            Marcar pessoa
                        </button>

                        {showUserSearch && (
                            <div className="absolute top-11 left-0 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                <div className="p-3 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar por nome..."
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            className="pl-10 h-9 text-sm"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {isSearchingUsers ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                            Buscando...
                                        </div>
                                    ) : userSearchResults.length > 0 ? (
                                        userSearchResults.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => addTaggedUser(user)}
                                                disabled={!!taggedUsers.find(u => u.id === user.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left",
                                                    taggedUsers.find(u => u.id === user.id) && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <Image src={user.avatar_url} alt="" width={36} height={36} className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-sm">
                                                            {user.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                                                    {user.rota_number && (
                                                        <p className="text-xs text-gray-500">Rota #{user.rota_number}</p>
                                                    )}
                                                </div>
                                                {taggedUsers.find(u => u.id === user.id) && (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                )}
                                            </button>
                                        ))
                                    ) : userSearchQuery.trim() ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            Nenhum usuário encontrado
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            Digite o nome para buscar
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botão de Mídia - agora dentro do conteúdo */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading || mediaFiles.length >= 10}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || mediaFiles.length >= 10}
                            className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full justify-center"
                        >
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-sm">
                                {mediaFiles.length > 0 ? `Adicionar mais fotos (${mediaFiles.length}/10)` : 'Adicionar Fotos/Vídeos'}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Footer fixo - sempre visível */}
                <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Visibility Toggle */}
                            <div className="flex items-center bg-gray-100 rounded p-0.5">
                                {visibilityOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setVisibility(opt.value)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all",
                                            visibility === opt.value
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        <opt.icon className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isUploading || (!content.trim() && mediaFiles.length === 0)}
                            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : 'Enviando...'}
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Publicar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
