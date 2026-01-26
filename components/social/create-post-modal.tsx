'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Camera, X, Loader2, Award, Users, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface CreatePostModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    onPostCreated?: () => void
    // Opcional: pré-selecionar vinculação
    preselectedConfraternityId?: string
    preselectedProjectId?: string
    preselectedMedalId?: string
}

export function CreatePostModal({
    open,
    onOpenChange,
    userId,
    onPostCreated,
    preselectedConfraternityId,
    preselectedProjectId,
    preselectedMedalId
}: CreatePostModalProps) {
    const [content, setContent] = useState('')
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public')

    // Vinculações
    const [selectedMedalId, setSelectedMedalId] = useState<string | undefined>(preselectedMedalId)
    const [selectedConfraternityId, setSelectedConfraternityId] = useState<string | undefined>(preselectedConfraternityId)
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(preselectedProjectId)
    const [taggedUserId, setTaggedUserId] = useState<string | undefined>()
    const [taggedUserName, setTaggedUserName] = useState<string | undefined>()

    // Dados para seletores
    const [confraternities, setConfraternities] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    // Carregar confrarias e projetos do usuário
    useEffect(() => {
        if (open) {
            loadUserData()
        }
    }, [open, userId])

    async function loadUserData() {
        try {
            // Carregar confrarias aceitas com dados do parceiro
            const { data: confData } = await supabase
                .from('confraternity_invites')
                .select(`
                    id, 
                    proposed_date, 
                    location, 
                    sender_id, 
                    receiver_id,
                    sender:profiles!sender_id(id, full_name),
                    receiver:profiles!receiver_id(id, full_name)
                `)
                .eq('status', 'accepted')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('proposed_date', { ascending: false })
                .limit(10)

            setConfraternities(confData || [])

            // Carregar projetos do usuário
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        // Validar tamanho dos arquivos
        const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

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

        // Limit to 10 files
        const newFiles = [...mediaFiles, ...validFiles].slice(0, 10)
        setMediaFiles(newFiles)

        // Create previews
        const newPreviews = newFiles.map(file => URL.createObjectURL(file))
        setMediaPreviews(newPreviews)
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

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) throw error

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        return urlData.publicUrl
    }

    const handleSubmit = async () => {
        if (!content.trim() && mediaFiles.length === 0) {
            alert('Adicione um texto ou mídia para publicar')
            return
        }

        setIsUploading(true)

        try {
            // Rate limiting: Verificar posts recentes
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
            const { count } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', oneHourAgo)

            if (count && count >= 5) {
                alert('Limite de 5 publicações por hora atingido. Tente novamente mais tarde.')
                return
            }

            // Upload media files
            const mediaUrls: string[] = []
            const totalFiles = mediaFiles.length

            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i]
                setUploadProgress(Math.round(((i + 0.5) / totalFiles) * 100))
                const url = await uploadMedia(file)
                mediaUrls.push(url)
                setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
            }

            // Create post
            const { data: newPost, error } = await supabase
                .from('posts')
                .insert({
                    user_id: userId,
                    content: content.trim(),
                    media_urls: mediaUrls,
                    visibility,
                    medal_id: selectedMedalId || null,
                    confraternity_id: selectedConfraternityId || null,
                    project_id: selectedProjectId || null,
                    tagged_user_id: taggedUserId || null,
                    validation_status: selectedMedalId ? 'pending' : null
                })
                .select()
                .single()

            if (error) throw error

            // Se tem confraria ou projeto vinculado, validar automaticamente com IA
            if (newPost && (selectedConfraternityId || selectedProjectId) && mediaUrls.length > 0) {
                console.log('[CreatePost] Iniciando validação automática com IA...')

                // Chamar API de validação automática (não bloqueia o fluxo)
                fetch('/api/posts/auto-validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: newPost.id })
                }).then(async (res) => {
                    const result = await res.json()
                    if (result.validated) {
                        console.log('[CreatePost] ✅ Validado automaticamente pela IA!')
                    } else if (result.needsManualReview) {
                        console.log('[CreatePost] ⏳ Aguardando revisão manual')
                    }
                }).catch(err => {
                    console.error('[CreatePost] Erro na validação automática:', err)
                })
            }

            // Reset form
            setContent('')
            setMediaFiles([])
            setMediaPreviews([])
            setVisibility('public')
            setSelectedMedalId(undefined)
            setSelectedConfraternityId(undefined)
            setSelectedProjectId(undefined)
            setUploadProgress(0)
            onOpenChange(false)
            onPostCreated?.()

        } catch (error) {
            console.error('Error creating post:', error)
            alert('Erro ao criar publicação. Tente novamente.')
        } finally {
            setIsUploading(false)
        }
    }

    // Lista de medalhas que requerem validação
    const validationMedals = [
        { id: 'primeira_confraria', name: '🤝 Primeira Confraria', description: 'Participar da primeira confraria' },
        { id: 'anfitriao', name: '🏠 Anfitrião', description: 'Hospedar uma confraria' },
        { id: 'cronista', name: '📸 Cronista', description: 'Registrar uma confraria' },
        { id: 'lider_confraria', name: '👑 Líder de Confraria', description: '5+ confrarias organizadas' },
        { id: 'cinegrafista_campo', name: '🎥 Cinegrafista de Campo', description: 'Gravar vídeo de confraria' },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Publicação</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Text content */}
                    <Textarea
                        placeholder="No que você está pensando?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px] resize-none"
                        disabled={isUploading}
                    />

                    {/* Media previews */}
                    {mediaPreviews.length > 0 && (
                        <div className={cn(
                            "grid gap-2",
                            mediaPreviews.length === 1 && "grid-cols-1",
                            mediaPreviews.length === 2 && "grid-cols-2",
                            mediaPreviews.length >= 3 && "grid-cols-3"
                        )}>
                            {mediaPreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => removeMedia(index)}
                                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                                        disabled={isUploading}
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vinculações */}
                    <div className="space-y-3 border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700">Vincular a:</h4>

                        {/* Medalha */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-600 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Medalha (validação)
                            </label>
                            <Select value={selectedMedalId} onValueChange={setSelectedMedalId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Nenhuma medalha" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    {validationMedals.map(medal => (
                                        <SelectItem key={medal.id} value={medal.id}>
                                            {medal.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedMedalId && selectedMedalId !== 'none' && (
                                <p className="text-xs text-amber-600">
                                    ⚠️ Esta publicação será enviada para validação
                                </p>
                            )}
                        </div>

                        {/* Confraria */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-600 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Confraria
                            </label>
                            <Select
                                value={selectedConfraternityId}
                                onValueChange={(value) => {
                                    setSelectedConfraternityId(value)
                                    // Auto-marcar participante
                                    if (value && value !== 'none') {
                                        const conf = confraternities.find(c => c.id === value)
                                        if (conf) {
                                            const partnerId = conf.sender_id === userId ? conf.receiver_id : conf.sender_id
                                            const partnerData = conf.sender_id === userId ? conf.receiver : conf.sender
                                            setTaggedUserId(partnerId)
                                            setTaggedUserName(partnerData?.full_name || 'Parceiro')
                                        }
                                    } else {
                                        setTaggedUserId(undefined)
                                        setTaggedUserName(undefined)
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Nenhuma confraria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    {confraternities.map(conf => (
                                        <SelectItem key={conf.id} value={conf.id}>
                                            {conf.location} - {new Date(conf.proposed_date).toLocaleDateString('pt-BR')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Mostrar quem está sendo marcado */}
                            {taggedUserId && taggedUserName && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <p className="text-xs text-green-700">
                                        Marcando: <span className="font-semibold">{taggedUserName}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">→ Ambos ganham pontos!</p>
                                </div>
                            )}
                        </div>

                        {/* Projeto */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-600 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Projeto/Serviço
                            </label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Nenhum projeto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {projects.map(proj => (
                                        <SelectItem key={proj.id} value={proj.id}>
                                            {proj.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Visibility selector */}
                    <div className="flex items-center gap-2 border-t pt-4">
                        <span className="text-sm text-gray-600">Visibilidade:</span>
                        <div className="flex gap-2">
                            <Button
                                variant={visibility === 'public' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVisibility('public')}
                                disabled={isUploading}
                            >
                                Público
                            </Button>
                            <Button
                                variant={visibility === 'connections' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVisibility('connections')}
                                disabled={isUploading}
                            >
                                Elos
                            </Button>
                            <Button
                                variant={visibility === 'private' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVisibility('private')}
                                disabled={isUploading}
                            >
                                Privado
                            </Button>
                        </div>
                    </div>

                    {/* Add media button */}
                    <div className="flex gap-2">
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
                            className="gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            Adicionar Foto/Vídeo
                            {mediaFiles.length > 0 && (
                                <span className="text-xs">({mediaFiles.length}/10)</span>
                            )}
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isUploading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isUploading || (!content.trim() && mediaFiles.length === 0)}
                        className="gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {uploadProgress > 0 && uploadProgress < 100
                                    ? `Enviando... ${uploadProgress}%`
                                    : 'Publicando...'
                                }
                            </>
                        ) : (
                            'Publicar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
