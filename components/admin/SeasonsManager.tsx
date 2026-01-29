'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Trophy, Crown, Medal, Award, Calendar, Users, Loader2,
    RefreshCw, Edit, Check, Send, Gift, Clock, TrendingUp, Upload, Image as ImageIcon, Sparkles, Download, Wand2, Crop, Mail, ChevronDown
} from 'lucide-react'
import { SeasonBanner } from '@/components/season'
import { toast } from 'sonner'
import { ImageCropDialog } from './ImageCropDialog'

interface Season {
    id: string
    name: string
    year: number
    month: number
    start_date: string
    end_date: string
    status: 'upcoming' | 'active' | 'finished'
    created_at: string
    finished_at: string | null
    banner_url: string | null
}

interface SeasonPrize {
    id: string
    season_id: string
    position: number
    title: string
    description: string | null
    image_url: string | null
}

interface RankingUser {
    ranking_position: number
    user_id: string
    full_name: string
    avatar_url: string | null
    slug: string
    patente: string
    xp_month: number
}

interface SeasonWinner {
    id: string
    user_id: string
    position: number
    xp_earned: number
    user?: { full_name: string, avatar_url: string | null }
}

export function SeasonsManager() {
    const [loading, setLoading] = useState(true)
    const [seasons, setSeasons] = useState<Season[]>([])
    const [allSeasons, setAllSeasons] = useState<Season[]>([]) // Todas as temporadas do ano
    const [activeSeason, setActiveSeason] = useState<Season | null>(null)
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('') // Temporada selecionada para edição
    const [prizes, setPrizes] = useState<SeasonPrize[]>([])
    const [ranking, setRanking] = useState<RankingUser[]>([])
    const [winners, setWinners] = useState<SeasonWinner[]>([])
    const [activeTab, setActiveTab] = useState('current')

    // Edição de prêmio
    const [editingPrize, setEditingPrize] = useState<SeasonPrize | null>(null)
    const [prizeTitle, setPrizeTitle] = useState('')
    const [prizeDescription, setPrizeDescription] = useState('')
    const [savingPrize, setSavingPrize] = useState(false)

    // Encerrar temporada
    const [showFinishDialog, setShowFinishDialog] = useState(false)
    const [finishing, setFinishing] = useState(false)

    // Upload de imagem (modo antigo - compatibilidade)
    const [prizeImageUrl, setPrizeImageUrl] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const [enhancingImage, setEnhancingImage] = useState(false)

    // Novo: Upload múltiplo e composição
    const [uploadedImages, setUploadedImages] = useState<string[]>([]) // URLs das imagens carregadas
    const [compositionLayout, setCompositionLayout] = useState<'grid' | 'horizontal' | 'stack' | 'showcase'>('grid')
    const [compositionTheme, setCompositionTheme] = useState<'gold' | 'silver' | 'bronze' | 'modern'>('gold')
    const [creatingComposition, setCreatingComposition] = useState(false)
    const [useComposition, setUseComposition] = useState(false) // Toggle entre modo individual e composição
    const [generatedBanners, setGeneratedBanners] = useState<Record<string, string> | null>(null)
    const [generatingBanners, setGeneratingBanners] = useState(false)
    const [quickUploading, setQuickUploading] = useState(false)
    const [autoRemoveBg, setAutoRemoveBg] = useState(false)
    // Previews locais das imagens selecionadas
    const [localPreviews, setLocalPreviews] = useState<{ 1?: string, 2?: string, 3?: string }>({})
    // Crop dialog
    const [cropDialogOpen, setCropDialogOpen] = useState(false)
    const [cropImageUrl, setCropImageUrl] = useState('')
    const [cropPosition, setCropPosition] = useState<1 | 2 | 3>(1)

    // Handler para atualizar preview local ao selecionar arquivo
    const handleFileSelect = (pos: 1 | 2 | 3, file: File | undefined) => {
        if (file) {
            const url = URL.createObjectURL(file)
            setLocalPreviews(prev => ({ ...prev, [pos]: url }))
        } else {
            setLocalPreviews(prev => {
                const newPreviews = { ...prev }
                delete newPreviews[pos]
                return newPreviews
            })
        }
    }


    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Carregar TODAS as temporadas do ano atual
            const currentYear = new Date().getFullYear()
            const { data: seasonsData } = await supabase
                .from('seasons')
                .select('*')
                .gte('start_date', `${currentYear}-01-01`)
                .lte('start_date', `${currentYear}-12-31`)
                .order('start_date', { ascending: true })

            setAllSeasons(seasonsData || [])
            setSeasons(seasonsData || [])

            // Temporada ativa
            const active = seasonsData?.find(s => s.status === 'active')
            setActiveSeason(active || null)

            // Selecionar a ativa por padrão
            if (active) {
                setSelectedSeasonId(active.id)
                await loadSeasonData(active.id)
            } else if (seasonsData && seasonsData.length > 0) {
                setSelectedSeasonId(seasonsData[0].id)
                await loadSeasonData(seasonsData[0].id)
            }
        } finally {
            setLoading(false)
        }
    }

    // Carregar dados quando mudar a temporada selecionada
    const handleSeasonChange = async (seasonId: string) => {
        setSelectedSeasonId(seasonId)
        const season = allSeasons.find(s => s.id === seasonId)
        if (season) {
            setActiveSeason(season)
            await loadSeasonData(seasonId)
        }
    }

    const loadSeasonData = async (seasonId: string) => {
        // Prêmios
        const { data: prizesData } = await supabase
            .from('season_prizes')
            .select('*')
            .eq('season_id', seasonId)
            .order('position')

        setPrizes(prizesData || [])

        // SIMPLIFICADO: não buscar ranking aqui (já tem na outra página)
        setRanking([])


        // Vencedores (se finalizada)
        const { data: winnersData } = await supabase
            .from('season_winners')
            .select(`*, user:profiles!user_id(full_name, avatar_url)`)
            .eq('season_id', seasonId)
            .order('position')

        setWinners(winnersData || [])
    }

    const openEditPrize = (prize: SeasonPrize) => {
        setEditingPrize(prize)
        setPrizeTitle(prize.title)
        setPrizeDescription(prize.description || '')
        setPrizeImageUrl(prize.image_url || '')
    }

    const handleImageUpload = async (file: File, type: 'prize' | 'banner', removeBg: boolean = false) => {
        console.log('[UPLOAD] Iniciando upload:', file.name, 'tipo:', type, 'removeBg:', removeBg)

        if (type === 'prize') {
            if (removeBg) setEnhancingImage(true)
            else setUploadingImage(true)
        } else {
            setUploadingBanner(true)
        }

        try {
            let fileToUpload = file

            // Processar com IA se solicitado (usando API Remove.bg)
            if (removeBg) {
                console.log('[AI] Removendo fundo via API...')
                try {
                    const formData = new FormData()
                    formData.append('image', file)
                    const response = await fetch('/api/remove-bg', {
                        method: 'POST',
                        body: formData
                    })
                    const data = await response.json()
                    if (data.success && data.imageBase64) {
                        const res = await fetch(data.imageBase64)
                        const blob = await res.blob()
                        fileToUpload = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", { type: "image/png" })
                        console.log('[AI] Fundo removido! Novo tamanho:', fileToUpload.size)
                        toast.success('Fundo removido com sucesso!')
                    }
                } catch (bgError) {
                    console.error('[AI] Erro ao remover fundo:', bgError)
                    toast.error('Erro ao remover fundo, usando imagem original')
                }
            }

            const supabase = await createClient()

            const fileExt = fileToUpload.name.split('.').pop()
            const fileName = `${type}_${Date.now()}.${fileExt}`
            const filePath = `seasons/${fileName}` // pasta seasons dentro do bucket

            console.log('[UPLOAD] Fazendo upload para:', filePath)

            // USAR BUCKET 'seasons' (criar no Supabase Dashboard)
            const { error: uploadError } = await supabase.storage
                .from('seasons')
                .upload(filePath, fileToUpload, { upsert: true })

            if (uploadError) {
                console.error('[UPLOAD] Erro no upload:', uploadError)
                throw uploadError
            }

            console.log('[UPLOAD] Upload concluído, pegando URL...')

            const { data: urlData } = supabase.storage
                .from('seasons')
                .getPublicUrl(filePath)

            console.log('[UPLOAD] URL gerada:', urlData.publicUrl)

            if (type === 'prize') {
                setPrizeImageUrl(urlData.publicUrl)
                toast.success('Imagem carregada!')
            } else if (activeSeason) {
                // Atualizar banner da temporada diretamente
                await supabase
                    .from('seasons')
                    .update({ banner_url: urlData.publicUrl })
                    .eq('id', activeSeason.id)

                toast.success('Banner atualizado!')
                await loadData()
            }
        } catch (error) {
            console.error('[UPLOAD] Error uploading:', error)
            toast.error('Erro ao fazer upload: ' + (error as any).message)
        } finally {
            if (type === 'prize') {
                setUploadingImage(false)
                setEnhancingImage(false)
            } else {
                setUploadingBanner(false)
            }
        }
    }

    const enhanceImageWithAI = async () => {
        if (!editingPrize || !prizeImageUrl) {
            toast.error('Primeiro faça upload de uma imagem')
            return
        }

        setEnhancingImage(true)
        try {
            const response = await fetch('/api/seasons/enhance-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: prizeImageUrl,
                    prizeTitle: prizeTitle,
                    position: editingPrize.position
                })
            })

            const data = await response.json()

            if (data.mode === 'demo') {
                toast.info('Modo demonstração', {
                    description: 'Configure REPLICATE_API_TOKEN para usar IA real'
                })
                console.log('Prompt gerado:', data.promptGenerated)
            } else if (data.enhancedUrl) {
                setPrizeImageUrl(data.enhancedUrl)
                toast.success('Imagem melhorada com IA!')
            }
        } catch (error) {
            console.error('Error enhancing image:', error)
            toast.error('Erro ao melhorar imagem')
        } finally {
            setEnhancingImage(false)
        }
    }

    // Novo: Upload de múltiplas imagens
    const handleMultipleImageUpload = async (files: FileList) => {
        if (files.length === 0 || files.length > 5) {
            toast.error('Selecione entre 1 e 5 imagens')
            return
        }

        setUploadingImage(true)
        try {
            const uploadedUrls: string[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `prize_${Date.now()}_${i}.${fileExt}`
                const filePath = `seasons/prizes/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('seasons')
                    .upload(filePath, file, { upsert: true })

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('seasons')
                    .getPublicUrl(filePath)

                uploadedUrls.push(urlData.publicUrl)
            }

            setUploadedImages(uploadedUrls)
            toast.success(`${uploadedUrls.length} imagem(ns) carregada(s)!`)

        } catch (error) {
            console.error('Error uploading images:', error)
            toast.error('Erro ao fazer upload das imagens')
        } finally {
            setUploadingImage(false)
        }
    }

    // Novo: Criar composição com as imagens carregadas
    const createComposition = async () => {
        if (!editingPrize || uploadedImages.length === 0) {
            toast.error('Carregue pelo menos uma imagem primeiro')
            return
        }

        setCreatingComposition(true)
        try {
            const response = await fetch('/api/seasons/compose-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrls: uploadedImages,
                    layout: compositionLayout,
                    theme: compositionTheme,
                    title: prizeTitle,
                    position: editingPrize.position
                })
            })

            const data = await response.json()

            if (data.success && data.compositionUrl) {
                setPrizeImageUrl(data.compositionUrl)
                toast.success('Composição criada com sucesso!')
            } else {
                throw new Error(data.error || 'Erro ao criar composição')
            }
        } catch (error: any) {
            console.error('Error creating composition:', error)
            toast.error(error.message || 'Erro ao criar composição')
        } finally {
            setCreatingComposition(false)
        }
    }

    const generatePodiumBanners = async () => {
        if (!activeSeason) {
            toast.error('Nenhuma temporada ativa')
            return
        }

        // Verificar se temos os 3 prêmios com imagens
        const top3Prizes = prizes.filter(p => p.position <= 3 && p.image_url)

        if (top3Prizes.length < 3) {
            toast.error('É necessário ter imagens para os 3 primeiros lugares!')
            return
        }

        setGeneratingBanners(true)
        try {
            const response = await fetch('/api/seasons/compose-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prizes: top3Prizes.map(p => ({
                        position: p.position,
                        title: p.title,
                        imageUrls: [p.image_url!] // Por enquanto só primeira imagem
                    })),
                    theme: compositionTheme,
                    seasonTitle: `${activeSeason.name} - ${activeSeason.month}/${activeSeason.year}`
                })
            })

            const data = await response.json()

            if (data.success && data.banners) {
                setGeneratedBanners(data.banners)
                toast.success('4 banners gerados com sucesso!')
            } else {
                throw new Error(data.error || 'Erro ao gerar banners')
            }
        } catch (error: any) {
            console.error('Error generating banners:', error)
            toast.error(error.message || 'Erro ao gerar banners')
        } finally {
            setGeneratingBanners(false)
        }
    }

    // Novo: Upload rápido para os 3 primeiros lugares
    // Agora também usa imagens processadas (sem fundo) do localPreviews
    const handleQuickUpload = async (pos1: File | undefined, pos2: File | undefined, pos3: File | undefined) => {
        if (!activeSeason) return

        // Verificar se há arquivos OU previews processados
        const hasFiles = pos1 || pos2 || pos3
        const hasPreviews = Object.keys(localPreviews).length > 0

        if (!hasFiles && !hasPreviews) {
            toast.error("Selecione pelo menos uma imagem")
            return
        }

        setQuickUploading(true)
        try {
            // Construir lista de itens para processar (arquivos + previews processados)
            const items: { pos: number, file?: File, previewUrl?: string }[] = []

            for (const pos of [1, 2, 3] as const) {
                const file = pos === 1 ? pos1 : pos === 2 ? pos2 : pos3
                const preview = localPreviews[pos]

                // Priorizar preview processado (imagem já sem fundo)
                if (preview) {
                    items.push({ pos, previewUrl: preview })
                } else if (file) {
                    items.push({ pos, file })
                }
            }

            if (items.length === 0) {
                toast.info('Nenhuma imagem para processar')
                setQuickUploading(false)
                return
            }

            let successCount = 0

            for (const item of items) {
                const toastId = toast.loading(`Enviando imagem ${item.pos}º lugar...`)

                let fileToUpload: File

                // Se já temos um preview processado (imagem sem fundo), usar ele
                if (item.previewUrl) {
                    try {
                        // Converter URL/base64 para File
                        const response = await fetch(item.previewUrl)
                        const blob = await response.blob()
                        fileToUpload = new File([blob], `prize_pos${item.pos}_nobg.png`, { type: 'image/png' })
                        console.log(`[UPLOAD] Usando preview processado para posição ${item.pos}`)
                    } catch (err) {
                        console.error('Erro ao converter preview:', err)
                        toast.dismiss(toastId)
                        toast.error(`Erro ao processar imagem ${item.pos}º lugar`)
                        continue
                    }
                } else if (item.file) {
                    // Usar arquivo original
                    fileToUpload = item.file

                    // Remover fundo se autoRemoveBg ativado
                    if (autoRemoveBg) {
                        toast.dismiss(toastId)
                        const bgToast = toast.loading(`🤖 Removendo fundo da imagem ${item.pos}º lugar...`)
                        try {
                            const formData = new FormData()
                            formData.append('image', item.file)

                            const response = await fetch('/api/remove-bg', {
                                method: 'POST',
                                body: formData
                            })

                            const data = await response.json()

                            if (data.success && data.imageBase64) {
                                const res = await fetch(data.imageBase64)
                                const blob = await res.blob()
                                fileToUpload = new File([blob], `prize_pos${item.pos}_nobg.png`, { type: 'image/png' })
                                toast.dismiss(bgToast)
                                toast.success(`Fundo removido do ${item.pos}º lugar!`)
                            } else {
                                toast.dismiss(bgToast)
                            }
                        } catch (err) {
                            console.error('[BG REMOVE] Erro:', err)
                            toast.dismiss(bgToast)
                        }
                    }
                } else {
                    toast.dismiss(toastId)
                    continue
                }

                // Upload para Supabase Storage
                const fileExt = fileToUpload.name.split('.').pop() || 'png'
                const fileName = `prize_${activeSeason.id}_pos${item.pos}_${Date.now()}.${fileExt}`
                const filePath = `seasons/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('seasons')
                    .upload(filePath, fileToUpload, { upsert: true })

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    toast.dismiss(toastId)
                    toast.error(`Erro ao salvar imagem ${item.pos}º lugar`)
                    continue
                }

                const { data: urlData } = supabase.storage
                    .from('seasons')
                    .getPublicUrl(filePath)

                // Atualizar no banco
                const prize = prizes.find(p => p.position === item.pos)
                if (prize) {
                    await supabase.from('season_prizes')
                        .update({ image_url: urlData.publicUrl })
                        .eq('id', prize.id)
                } else {
                    await supabase.from('season_prizes').insert({
                        season_id: activeSeason.id,
                        position: item.pos,
                        title: `${item.pos}º Lugar`,
                        image_url: urlData.publicUrl
                    })
                }

                toast.dismiss(toastId)
                successCount++
            }

            if (successCount > 0) {
                toast.success(`${successCount} imagens salvas!`)

                // Recarregar dados da temporada PRIMEIRO
                console.log('[QUICK UPLOAD] ✅ Recarregando dados da temporada...')
                await loadSeasonData(activeSeason.id)

                // Então limpar previews locais e inputs
                setLocalPreviews({})
                    ;[1, 2, 3].forEach(pos => {
                        const input = document.querySelector(`input[name="file${pos}"]`) as HTMLInputElement
                        if (input) input.value = ''
                    })

                // Gerar banners automaticamente
                console.log('[QUICK UPLOAD] Gerando banners...')
                toast.loading('Gerando banners...', { id: 'banner-gen' })

                // Delay para garantir que o state foi atualizado
                await new Promise(resolve => setTimeout(resolve, 500))

                try {
                    await generatePodiumBanners()
                    toast.dismiss('banner-gen')
                    toast.success('Banners gerados! ✨')
                } catch (err) {
                    toast.dismiss('banner-gen')
                    console.log('[QUICK UPLOAD] Banner generation error:', err)
                }
            }

        } catch (error) {
            console.error('Quick upload error:', error)
            toast.error('Erro no upload rápido')
        } finally {
            setQuickUploading(false)
        }
    }


    const savePrize = async () => {
        if (!editingPrize) return

        setSavingPrize(true)
        try {
            const { error } = await supabase
                .from('season_prizes')
                .update({
                    title: prizeTitle,
                    description: prizeDescription,
                    image_url: prizeImageUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingPrize.id)

            if (error) throw error

            toast.success('Prêmio atualizado!')
            setEditingPrize(null)

            if (activeSeason) {
                await loadSeasonData(activeSeason.id)
            }
        } catch (error) {
            console.error('Error saving prize:', error)
            toast.error('Erro ao salvar')
        } finally {
            setSavingPrize(false)
        }
    }

    const finishSeason = async () => {
        if (!activeSeason || ranking.length < 3) {
            toast.error('Precisa de pelo menos 3 participantes no ranking')
            return
        }

        setFinishing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Registrar vencedores
            const top3 = ranking.slice(0, 3)
            for (let i = 0; i < top3.length; i++) {
                const winner = top3[i]
                const prize = prizes.find(p => p.position === i + 1)

                await supabase
                    .from('season_winners')
                    .insert({
                        season_id: activeSeason.id,
                        user_id: winner.user_id,
                        position: i + 1,
                        xp_earned: winner.xp_month,
                        prize_id: prize?.id
                    })
            }

            // 2. Atualizar status da temporada
            await supabase
                .from('seasons')
                .update({
                    status: 'finished',
                    finished_at: new Date().toISOString(),
                    finished_by: user?.id
                })
                .eq('id', activeSeason.id)

            // 3. Criar próxima temporada
            const nextMonth = activeSeason.month === 12 ? 1 : activeSeason.month + 1
            const nextYear = activeSeason.month === 12 ? activeSeason.year + 1 : activeSeason.year
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

            const startDate = new Date(nextYear, nextMonth - 1, 1)
            const endDate = new Date(nextYear, nextMonth, 0)

            const { data: newSeason } = await supabase
                .from('seasons')
                .insert({
                    name: `${monthNames[nextMonth]} ${nextYear}`,
                    year: nextYear,
                    month: nextMonth,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    status: 'active',
                    created_by: user?.id
                })
                .select()
                .single()

            // 4. Criar prêmios para nova temporada
            if (newSeason) {
                await supabase.from('season_prizes').insert([
                    { season_id: newSeason.id, position: 1, title: '🥇 1º Lugar', description: 'Prêmio a definir' },
                    { season_id: newSeason.id, position: 2, title: '🥈 2º Lugar', description: 'Prêmio a definir' },
                    { season_id: newSeason.id, position: 3, title: '🥉 3º Lugar', description: 'Prêmio a definir' }
                ])
            }

            // 5. Criar notificações para vencedores
            for (let i = 0; i < top3.length; i++) {
                const winner = top3[i]
                await supabase.from('notifications').insert({
                    user_id: winner.user_id,
                    type: 'season_winner',
                    title: `🏆 Parabéns! Você ficou em ${i + 1}º lugar!`,
                    body: `Você conquistou o ${i + 1}º lugar na temporada ${activeSeason.name} com ${winner.xp_month} XP!`,
                    metadata: { season_id: activeSeason.id, position: i + 1 }
                })
            }

            toast.success('Temporada encerrada!', {
                description: 'Vencedores registrados e nova temporada criada'
            })

            setShowFinishDialog(false)
            await loadData()

        } catch (error) {
            console.error('Error finishing season:', error)
            toast.error('Erro ao encerrar temporada')
        } finally {
            setFinishing(false)
        }
    }

    const sendSeasonEmails = async () => {
        try {
            const response = await fetch('/api/seasons/send-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seasonId: activeSeason?.id,
                    type: 'new_season'
                })
            })

            if (response.ok) {
                toast.success('Emails enviados!', {
                    description: 'Toda a base foi notificada'
                })
            } else {
                toast.error('Erro ao enviar emails')
            }
        } catch (error) {
            console.error('Error sending emails:', error)
            toast.error('Erro ao enviar emails')
        }
    }

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown className="w-5 h-5 text-yellow-500" />
            case 2: return <Medal className="w-5 h-5 text-gray-400" />
            case 3: return <Award className="w-5 h-5 text-amber-600" />
            default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>
        }
    }

    const getPositionBg = (position: number) => {
        switch (position) {
            case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
            case 2: return 'bg-gradient-to-r from-gray-300/20 to-gray-300/5 border-gray-400/30'
            case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30'
            default: return 'border-primary/10'
        }
    }

    const getDaysRemaining = () => {
        if (!activeSeason) return 0
        const end = new Date(activeSeason.end_date)
        const now = new Date()
        return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header com stats */}
            {activeSeason && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Seletor de Temporada/Mês */}
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs">Selecionar Temporada</span>
                            </div>
                            <Select value={selectedSeasonId} onValueChange={handleSeasonChange}>
                                <SelectTrigger className="w-full font-bold">
                                    <SelectValue placeholder="Selecione o mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allSeasons.map((season) => {
                                        const isActive = season.status === 'active'
                                        return (
                                            <SelectItem key={season.id} value={season.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{season.name}</span>
                                                    {isActive && (
                                                        <Badge variant="default" className="text-xs bg-green-600">Ativa</Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">Dias Restantes</span>
                            </div>
                            <p className="text-xl font-bold text-yellow-500">{getDaysRemaining()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-green-500 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">Participantes</span>
                            </div>
                            <p className="text-xl font-bold text-green-500">{ranking.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs">Líder XP</span>
                            </div>
                            <p className="text-xl font-bold text-primary">
                                {ranking[0]?.xp_month || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="current" className="gap-2">
                        <Trophy className="w-4 h-4" />
                        <span className="hidden sm:inline">Prêmios</span>
                    </TabsTrigger>
                    <TabsTrigger value="ranking" className="gap-2">
                        <Crown className="w-4 h-4" />
                        <span className="hidden sm:inline">Ranking</span>
                    </TabsTrigger>
                    <TabsTrigger value="emails" className="gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Emails</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Histórico</span>
                    </TabsTrigger>
                </TabsList>

                {/* Prêmios Tab - REDESENHADO */}
                <TabsContent value="current" className="space-y-6">

                    {/* PREVIEW DO BANNER NO TOPO */}
                    {activeSeason && (
                        <Card className="border-green-500/30 bg-gradient-to-b from-green-950/30 to-transparent overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400">Preview do Banner (Como aparece no site)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={sendSeasonEmails}>
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Emails
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setShowFinishDialog(true)}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Encerrar Temporada
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-4 bg-black/20">
                                <div className="max-w-4xl mx-auto">
                                    <SeasonBanner
                                        key={`banner-${prizes.map(p => `${p.id}-${p.image_url}-${p.title}`).join('-')}`}
                                        variant="hero"
                                        customSeason={activeSeason}
                                        customPrizes={prizes}
                                        showCTA={false}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* CONFIGURAÇÃO DOS 3 PRÊMIOS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Gift className="w-5 h-5 text-primary" />
                                Configurar Prêmios
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(pos => {
                                const prize = prizes.find(p => p.position === pos)

                                // Cores por posição
                                const posConfig = pos === 1
                                    ? { border: 'border-yellow-500', bg: 'bg-gradient-to-b from-yellow-500 to-yellow-600', text: 'text-yellow-500', icon: <Crown className="w-5 h-5" /> }
                                    : pos === 2
                                        ? { border: 'border-gray-400', bg: 'bg-gradient-to-b from-gray-400 to-gray-500', text: 'text-gray-400', icon: <Medal className="w-5 h-5" /> }
                                        : { border: 'border-amber-600', bg: 'bg-gradient-to-b from-amber-600 to-amber-700', text: 'text-amber-600', icon: <Award className="w-5 h-5" /> }

                                return (
                                    <Card key={pos} className={`${posConfig.border} border-2 overflow-hidden`}>
                                        {/* Header colorido com medalha */}
                                        <div className={`${posConfig.bg} px-4 py-3 flex items-center justify-center gap-2 text-white`}>
                                            {posConfig.icon}
                                            <span className="font-bold">{pos}º LUGAR</span>
                                        </div>

                                        <CardContent className="p-3 space-y-3">
                                            {/* Preview da imagem - CLICÁVEL PARA CROP */}
                                            <div
                                                className="relative h-32 rounded-lg overflow-hidden border border-muted bg-zinc-800/50 cursor-pointer group"
                                                onClick={() => {
                                                    const imageUrl = localPreviews[pos as 1 | 2 | 3] || prize?.image_url
                                                    if (imageUrl) {
                                                        setCropImageUrl(imageUrl)
                                                        setCropPosition(pos as 1 | 2 | 3)
                                                        setCropDialogOpen(true)
                                                    }
                                                }}
                                            >
                                                {localPreviews[pos as 1 | 2 | 3] ? (
                                                    <img
                                                        src={localPreviews[pos as 1 | 2 | 3]}
                                                        alt={`Preview ${pos}º lugar`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : prize?.image_url ? (
                                                    <img
                                                        src={prize.image_url}
                                                        alt={prize.title}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                                {/* Overlay de crop (aparece no hover) */}
                                                {(localPreviews[pos as 1 | 2 | 3] || prize?.image_url) && (
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Crop className="w-6 h-6 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload + Botão Remover Fundo */}
                                            <div className="space-y-2">
                                                <Input
                                                    name={`file${pos}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="text-xs"
                                                    disabled={quickUploading}
                                                    onChange={(e) => handleFileSelect(pos as 1 | 2 | 3, e.target.files?.[0])}
                                                />

                                                {/* Botão remover fundo individual */}
                                                {(localPreviews[pos as 1 | 2 | 3] || prize?.image_url) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs"
                                                        disabled={quickUploading}
                                                        onClick={async () => {
                                                            const inputFile = (document.querySelector(`input[name="file${pos}"]`) as HTMLInputElement)?.files?.[0]
                                                            const imageUrl = localPreviews[pos as 1 | 2 | 3] || prize?.image_url

                                                            if (!inputFile && !imageUrl) {
                                                                toast.error('Nenhuma imagem para processar')
                                                                return
                                                            }

                                                            const bgToast = toast.loading('🤖 Removendo fundo...')

                                                            try {
                                                                let fileToProcess: File

                                                                if (inputFile) {
                                                                    fileToProcess = inputFile
                                                                } else {
                                                                    // Baixar imagem existente
                                                                    const response = await fetch(imageUrl!)
                                                                    const blob = await response.blob()
                                                                    fileToProcess = new File([blob], 'image.jpg', { type: blob.type })
                                                                }

                                                                const formData = new FormData()
                                                                formData.append('image', fileToProcess)

                                                                const response = await fetch('/api/remove-bg', {
                                                                    method: 'POST',
                                                                    body: formData
                                                                })

                                                                const data = await response.json()

                                                                if (data.success && data.imageBase64) {
                                                                    setLocalPreviews(prev => ({
                                                                        ...prev,
                                                                        [pos]: data.imageBase64
                                                                    }))
                                                                    toast.dismiss(bgToast)
                                                                    toast.success('Fundo removido!')
                                                                } else {
                                                                    toast.dismiss(bgToast)
                                                                    toast.error(data.error || 'Erro ao remover fundo')
                                                                }
                                                            } catch (err) {
                                                                console.error('[BG REMOVE]', err)
                                                                toast.dismiss(bgToast)
                                                                toast.error('Erro ao remover fundo')
                                                            }
                                                        }}
                                                    >
                                                        <Wand2 className="w-3 h-3 mr-1" />
                                                        Remover Fundo (IA)
                                                    </Button>
                                                )}

                                                {/* Botão Download - aparece quando tem preview processado OU imagem salva */}
                                                {(localPreviews[pos as 1 | 2 | 3] || prize?.image_url) && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full text-xs"
                                                        onClick={async () => {
                                                            const imageUrl = localPreviews[pos as 1 | 2 | 3] || prize?.image_url
                                                            if (!imageUrl) return

                                                            try {
                                                                // Para URLs externas, precisamos fetch primeiro
                                                                if (imageUrl.startsWith('http')) {
                                                                    const response = await fetch(imageUrl)
                                                                    const blob = await response.blob()
                                                                    const url = URL.createObjectURL(blob)
                                                                    const link = document.createElement('a')
                                                                    link.href = url
                                                                    link.download = `premio_${pos}_lugar.png`
                                                                    link.click()
                                                                    URL.revokeObjectURL(url)
                                                                } else {
                                                                    const link = document.createElement('a')
                                                                    link.href = imageUrl
                                                                    link.download = `premio_${pos}_lugar.png`
                                                                    link.click()
                                                                }
                                                                toast.success('Imagem baixada!')
                                                            } catch (err) {
                                                                toast.error('Erro ao baixar imagem')
                                                            }
                                                        }}
                                                    >
                                                        <Download className="w-3 h-3 mr-1" />
                                                        Baixar Imagem
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Nome/Descrição do Prêmio */}
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Nome do Prêmio:</Label>
                                                <Input
                                                    placeholder="Ex: Boné EUA Exclusivo"
                                                    defaultValue={prize?.title || ''}
                                                    onBlur={(e) => {
                                                        const newTitle = e.target.value
                                                        if (prize && newTitle !== prize.title) {
                                                            // Atualiza local primeiro
                                                            setPrizes(prev => prev.map(p =>
                                                                p.id === prize.id ? { ...p, title: newTitle } : p
                                                            ))
                                                            // Salva no banco
                                                            supabase.from('season_prizes')
                                                                .update({ title: newTitle })
                                                                .eq('id', prize.id)
                                                                .then(() => {
                                                                    console.log('Título salvo:', newTitle)
                                                                })
                                                        }
                                                    }}
                                                    className={`text-sm font-medium text-center ${posConfig.text} placeholder:text-muted-foreground border-2`}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Botão de Salvar */}
                        <div className="flex justify-center pt-2">
                            <Button
                                size="lg"
                                disabled={quickUploading}
                                onClick={() => {
                                    const file1 = (document.querySelector('input[name="file1"]') as HTMLInputElement)?.files?.[0]
                                    const file2 = (document.querySelector('input[name="file2"]') as HTMLInputElement)?.files?.[0]
                                    const file3 = (document.querySelector('input[name="file3"]') as HTMLInputElement)?.files?.[0]

                                    // Verificar se há previews locais (imagens já processadas)
                                    const hasNewImages = file1 || file2 || file3 || Object.keys(localPreviews).length > 0

                                    if (hasNewImages) {
                                        handleQuickUpload(file1, file2, file3)
                                    } else {
                                        toast.info('Selecione ou processe pelo menos uma imagem')
                                    }
                                }}
                            >
                                {quickUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Salvar e Atualizar Banner
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Ranking Tab */}
                <TabsContent value="ranking" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Ranking Atual</h3>
                        <Button variant="outline" size="sm" onClick={() => activeSeason && loadSeasonData(activeSeason.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>

                    {ranking.length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhum participante ainda</p>
                                <p className="text-sm text-muted-foreground">
                                    O ranking será populado quando usuários ganharem XP
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {ranking.map((user, index) => (
                                <Card key={user.user_id} className={`${getPositionBg(index + 1)}`}>
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 flex items-center justify-center">
                                                    {getPositionIcon(index + 1)}
                                                </div>
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={user.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/20 text-primary">
                                                        {user.full_name?.charAt(0) || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.full_name}</p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {user.patente || 'Recruta'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-primary">{user.xp_month}</p>
                                                <p className="text-xs text-muted-foreground">XP no mês</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Emails Tab */}
                <TabsContent value="emails" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Email de Abertura */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="w-5 h-5" />
                                    Email de Abertura
                                </CardTitle>
                                <CardDescription className="text-green-100">
                                    Enviado ao iniciar a temporada - apresenta os prêmios
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Preview do Email - FUNDO BRANCO */}
                                <div className="bg-white text-gray-800">
                                    {/* Header Verde */}
                                    <div className="bg-green-800 p-6 text-center text-white">
                                        <div className="text-4xl mb-2">🏆</div>
                                        <h3 className="text-xl font-bold">Nova Temporada</h3>
                                        <p className="text-white/90 mt-1">{activeSeason?.name || 'Prêmios do Mês'}</p>
                                    </div>

                                    {/* Corpo */}
                                    <div className="p-5 space-y-4">
                                        <p className="text-gray-700">
                                            Olá, <span className="text-green-700 font-bold">[Seu Nome]</span>!
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            A nova temporada do <span className="text-gray-900 font-medium">Rota Business Club</span> começou!
                                            Participe, acumule pontos e concorra a prêmios incríveis.
                                        </p>

                                        {/* Período */}
                                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-600">
                                            📅 <span className="font-medium text-gray-700">Período:</span> {activeSeason ? `${new Date(activeSeason.start_date).toLocaleDateString('pt-BR')} até ${new Date(activeSeason.end_date).toLocaleDateString('pt-BR')}` : 'A definir'}
                                        </div>

                                        {/* Tabela de Prêmios */}
                                        <div>
                                            <h4 className="text-gray-900 font-semibold text-base mb-3">🎁 Prêmios desta Temporada</h4>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-green-800 text-white text-xs font-semibold grid grid-cols-3">
                                                    <div className="p-2 text-center"></div>
                                                    <div className="p-2">Posição</div>
                                                    <div className="p-2">Prêmio</div>
                                                </div>
                                                {prizes.map((prize) => {
                                                    const bgColor = prize.position === 1 ? 'bg-amber-50' : prize.position === 2 ? 'bg-gray-50' : 'bg-orange-50'
                                                    const emoji = prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'
                                                    return (
                                                        <div key={prize.id} className={`grid grid-cols-3 ${bgColor} border-t border-gray-200`}>
                                                            <div className="p-3 text-center text-xl">{emoji}</div>
                                                            <div className="p-3 text-sm font-medium text-gray-700">{prize.position}º Lugar</div>
                                                            <div className="p-3 text-sm text-gray-900">{prize.title}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="text-center pt-2">
                                            <span className="inline-block bg-green-800 text-white px-6 py-3 rounded-lg font-semibold text-sm">
                                                Ver Ranking e Participar
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-200">
                                        Rota Business Club © {new Date().getFullYear()}
                                    </div>
                                </div>

                                {/* Botão de Envio */}
                                <div className="p-4 border-t border-border">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={async () => {
                                            console.log('Enviando email para:', selectedSeasonId)
                                            if (!selectedSeasonId) {
                                                toast.error('Selecione uma temporada primeiro')
                                                return
                                            }
                                            toast.loading('Enviando emails...')
                                            try {
                                                const res = await fetch('/api/seasons/send-emails', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ seasonId: selectedSeasonId, type: 'new_season' })
                                                })
                                                const data = await res.json()
                                                toast.dismiss()
                                                if (data.success) {
                                                    toast.success(`${data.emailsSent} emails enviados!`)
                                                } else {
                                                    toast.error(data.error)
                                                }
                                            } catch (e) {
                                                toast.dismiss()
                                                toast.error('Erro ao enviar emails')
                                            }
                                        }}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar Email de Abertura
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email de Encerramento */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Email de Encerramento
                                </CardTitle>
                                <CardDescription className="text-amber-100">
                                    Enviado ao encerrar a temporada - anuncia os campeões
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Preview do Email - FUNDO BRANCO */}
                                <div className="bg-white text-gray-800">
                                    {/* Header Dourado */}
                                    <div className="bg-amber-700 p-6 text-center text-white">
                                        <div className="text-4xl mb-2">🏆</div>
                                        <h3 className="text-xl font-bold">Resultados da Temporada</h3>
                                        <p className="text-white/90 mt-1">{activeSeason?.name || 'Prêmios do Mês'}</p>
                                    </div>

                                    {/* Corpo */}
                                    <div className="p-5 space-y-4">
                                        <p className="text-gray-700">
                                            Olá, <span className="text-amber-700 font-bold">[Seu Nome]</span>!
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            A temporada <span className="font-medium text-gray-900">{activeSeason?.name || 'do mês'}</span> chegou ao fim!
                                            Confira os vencedores e seus prêmios.
                                        </p>

                                        {/* Tabela de Vencedores */}
                                        <div>
                                            <h4 className="text-gray-900 font-semibold text-base mb-3">🎖️ Pódio Oficial</h4>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-amber-700 text-white text-xs font-semibold grid grid-cols-4">
                                                    <div className="p-2 text-center"></div>
                                                    <div className="p-2">Posição</div>
                                                    <div className="p-2">Nome</div>
                                                    <div className="p-2">Prêmio</div>
                                                </div>
                                                {[1, 2, 3].map((pos) => {
                                                    const prize = prizes.find(p => p.position === pos)
                                                    const winner = ranking[pos - 1]
                                                    const bgColor = pos === 1 ? 'bg-amber-50' : pos === 2 ? 'bg-gray-50' : 'bg-orange-50'
                                                    const emoji = pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'
                                                    return (
                                                        <div key={pos} className={`grid grid-cols-4 ${bgColor} border-t border-gray-200`}>
                                                            <div className="p-3 text-center text-xl">{emoji}</div>
                                                            <div className="p-3 text-sm font-medium text-gray-700">{pos}º Lugar</div>
                                                            <div className="p-3 text-sm font-semibold text-gray-900">{winner?.full_name || '[Aguardando]'}</div>
                                                            <div className="p-3 text-sm text-gray-600">{prize?.title || '-'}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Celebração */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                            <p className="font-semibold text-green-800">🎉 Parabéns aos vencedores!</p>
                                            <p className="text-green-700 text-sm mt-1">Entraremos em contato para entrega dos prêmios.</p>
                                        </div>

                                        {/* CTA */}
                                        <div className="text-center pt-2">
                                            <span className="inline-block bg-green-800 text-white px-6 py-3 rounded-lg font-semibold text-sm">
                                                Ver Nova Temporada
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-200">
                                        Rota Business Club © {new Date().getFullYear()}
                                    </div>
                                </div>

                                {/* Botão de Envio */}
                                <div className="p-4 border-t border-border">
                                    <Button
                                        variant="secondary"
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                        onClick={async () => {
                                            console.log('Enviando email de encerramento para:', selectedSeasonId)
                                            if (!selectedSeasonId) {
                                                toast.error('Selecione uma temporada primeiro')
                                                return
                                            }
                                            toast.loading('Enviando emails...')
                                            try {
                                                const res = await fetch('/api/seasons/send-emails', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ seasonId: selectedSeasonId, type: 'champions' })
                                                })
                                                const data = await res.json()
                                                toast.dismiss()
                                                if (data.success) {
                                                    toast.success(`${data.emailsSent} emails enviados!`)
                                                } else {
                                                    toast.error(data.error)
                                                }
                                            } catch (e) {
                                                toast.dismiss()
                                                toast.error('Erro ao enviar emails')
                                            }
                                        }}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar Email de Encerramento
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Histórico Tab */}
                <TabsContent value="history" className="space-y-4">
                    <h3 className="text-lg font-semibold">Temporadas Anteriores</h3>

                    {seasons.filter(s => s.status === 'finished').length === 0 ? (
                        <Card className="border-primary/20">
                            <CardContent className="py-12 text-center">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">Nenhuma temporada encerrada</p>
                                <p className="text-sm text-muted-foreground">
                                    O histórico aparecerá quando temporadas forem finalizadas
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {seasons.filter(s => s.status === 'finished').map((season) => (
                                <Card key={season.id} className="border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-primary" />
                                            {season.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {new Date(season.start_date).toLocaleDateString('pt-BR')} -
                                            {new Date(season.end_date).toLocaleDateString('pt-BR')}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialog de edição de prêmio */}
            <Dialog open={!!editingPrize} onOpenChange={() => setEditingPrize(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Prêmio</DialogTitle>
                        <DialogDescription>
                            Configure o prêmio para esta posição
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Título do Prêmio</Label>
                            <Input
                                placeholder="Ex: iPhone 15 Pro"
                                value={prizeTitle}
                                onChange={(e) => setPrizeTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                                placeholder="Ex: Modelo 256GB, cor Space Black"
                                value={prizeDescription}
                                onChange={(e) => setPrizeDescription(e.target.value)}
                            />
                        </div>

                        {/* Modo de upload: Individual ou Composição */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
                            <div className="flex items-center justify-between">
                                <Label>Modo de imagem</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={!useComposition ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            setUseComposition(false)
                                            setUploadedImages([])
                                        }}
                                    >
                                        📷 Individual
                                    </Button>
                                    <Button
                                        variant={useComposition ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setUseComposition(true)}
                                    >
                                        🎨 Composição
                                    </Button>
                                </div>
                            </div>

                            {/* MODO INDIVIDUAL */}
                            {!useComposition && (
                                <div className="space-y-2">
                                    <Label>Imagem do Prêmio</Label>
                                    <div className="flex items-center gap-4">
                                        {prizeImageUrl ? (
                                            <img
                                                src={prizeImageUrl}
                                                alt="Prêmio"
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="prize-image-input"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleImageUpload(file, 'prize')
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={uploadingImage}
                                                type="button"
                                                onClick={() => document.getElementById('prize-image-input')?.click()}
                                            >
                                                {uploadingImage ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <Upload className="w-4 h-4 mr-2" />
                                                )}
                                                Carregar Imagem
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={enhanceImageWithAI}
                                                disabled={!prizeImageUrl || enhancingImage}
                                                className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                                            >
                                                {enhancingImage ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                Melhorar com IA
                                            </Button>

                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG até 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MODO COMPOSIÇÃO */}
                            {useComposition && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Upload de Múltiplas Imagens (1-5)</Label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            id="multi-image-input"
                                            onChange={(e) => {
                                                const files = e.target.files
                                                if (files) handleMultipleImageUpload(files)
                                            }}
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            disabled={uploadingImage}
                                            type="button"
                                            onClick={() => document.getElementById('multi-image-input')?.click()}
                                        >
                                            {uploadingImage ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            Selecionar Imagens (até 5)
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            Selecione de 1 a 5 fotos do produto (bonés, camisetas, etc.)
                                        </p>
                                    </div>

                                    {/* Preview das imagens carregadas */}
                                    {uploadedImages.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>{uploadedImages.length} imagem(ns) carregada(s)</Label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {uploadedImages.map((url, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img
                                                            src={url}
                                                            alt={`Imagem ${idx + 1}`}
                                                            className="w-full h-16 object-cover rounded border-2 border-primary/20"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                                                            <span className="text-white text-xs">#{idx + 1}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Opções de layout */}
                                    {uploadedImages.length > 0 && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Layout da Composição</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: 'grid', label: '📦 Grid', desc: 'Grade 2x2' },
                                                        { value: 'horizontal', label: '➡️ Horizontal', desc: 'Linha' },
                                                        { value: 'stack', label: '📚 Stack', desc: 'Empilhado' },
                                                        { value: 'showcase', label: '⭐ Showcase', desc: 'Destaque' }
                                                    ].map((layout) => (
                                                        <Button
                                                            key={layout.value}
                                                            variant={compositionLayout === layout.value ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCompositionLayout(layout.value as any)}
                                                            className="h-auto flex-col py-2"
                                                        >
                                                            <span>{layout.label}</span>
                                                            <span className="text-xs opacity-70">{layout.desc}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Opções de tema */}
                                            <div className="space-y-2">
                                                <Label>Tema de Cores</Label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[
                                                        { value: 'gold', label: '🥇 Ouro', color: 'bg-yellow-500' },
                                                        { value: 'silver', label: '🥈 Prata', color: 'bg-gray-400' },
                                                        { value: 'bronze', label: '🥉 Bronze', color: 'bg-amber-600' },
                                                        { value: 'modern', label: '🎨 Moderno', color: 'bg-slate-700' }
                                                    ].map((theme) => (
                                                        <Button
                                                            key={theme.value}
                                                            variant={compositionTheme === theme.value ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCompositionTheme(theme.value as any)}
                                                            className="h-auto flex-col gap-1"
                                                        >
                                                            <div className={`w-6 h-6 rounded-full ${theme.color}`} />
                                                            <span className="text-xs">{theme.label}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Botão de criar composição */}
                                            <Button
                                                onClick={createComposition}
                                                disabled={creatingComposition}
                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                            >
                                                {creatingComposition ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                Gerar Composição Profissional
                                            </Button>
                                        </>
                                    )}

                                    {/* Preview da composição final */}
                                    {prizeImageUrl && uploadedImages.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>✨ Composição Final</Label>
                                            <img
                                                src={prizeImageUrl}
                                                alt="Composição final"
                                                className="w-full rounded-lg border-2 border-primary"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPrize(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={savePrize} disabled={savingPrize}>
                            {savingPrize ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de encerrar temporada */}
            <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Encerrar Temporada
                        </DialogTitle>
                        <DialogDescription>
                            Esta ação irá:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <span>Registrar os Top 3 como vencedores</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Send className="w-5 h-5 text-blue-500" />
                            <span>Notificar os vencedores</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-yellow-500" />
                            <span>Criar a próxima temporada automaticamente</span>
                        </div>

                        {ranking.length >= 3 && (
                            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                                <p className="font-medium mb-2">Vencedores:</p>
                                {ranking.slice(0, 3).map((user, i) => (
                                    <div key={user.user_id} className="flex items-center gap-2 mt-1">
                                        {getPositionIcon(i + 1)}
                                        <span>{user.full_name}</span>
                                        <span className="text-muted-foreground">({user.xp_month} XP)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={finishSeason}
                            disabled={finishing || ranking.length < 3}
                        >
                            {finishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirmar Encerramento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Crop de Imagem */}
            <ImageCropDialog
                isOpen={cropDialogOpen}
                onClose={() => setCropDialogOpen(false)}
                imageUrl={cropImageUrl}
                onCropComplete={(croppedUrl) => {
                    setLocalPreviews(prev => ({
                        ...prev,
                        [cropPosition]: croppedUrl
                    }))
                    toast.success('Imagem ajustada!')
                }}
                aspectRatio={1}
            />
        </div>
    )
}
