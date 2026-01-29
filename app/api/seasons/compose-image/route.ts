import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ComposeRequest {
    prizes: {
        position: number
        title: string
        imageUrls: string[]
    }[]
    theme: 'gold' | 'silver' | 'bronze' | 'modern'
    seasonTitle?: string
}

// Definição dos 4 tamanhos de banners
const BANNER_SIZES = {
    hero: { width: 1400, height: 500, name: 'hero' },
    card: { width: 1000, height: 350, name: 'card' },
    sidebar: { width: 700, height: 250, name: 'sidebar' },
    square: { width: 500, height: 500, name: 'square' }
}

// Temas de cores profissionais
const THEMES = {
    gold: {
        gradient: [
            { color: '#1a1a2e', position: 0 },
            { color: '#16213e', position: 0.5 },
            { color: '#0f3460', position: 1 }
        ],
        accent1: '#FFD700',
        accent2: '#C0C0C0',
        accent3: '#CD7F32',
        text: '#FFFFFF'
    },
    silver: {
        gradient: [
            { color: '#2c3e50', position: 0 },
            { color: '#34495e', position: 0.5 },
            { color: '#2c3e50', position: 1 }
        ],
        accent1: '#FFD700',
        accent2: '#C0C0C0',
        accent3: '#CD7F32',
        text: '#FFFFFF'
    },
    bronze: {
        gradient: [
            { color: '#3d2314', position: 0 },
            { color: '#5c3317', position: 0.5 },
            { color: '#3d2314', position: 1 }
        ],
        accent1: '#FFD700',
        accent2: '#C0C0C0',
        accent3: '#CD7F32',
        text: '#FFFFFF'
    },
    modern: {
        gradient: [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 0.5 },
            { color: '#f093fb', position: 1 }
        ],
        accent1: '#FFD700',
        accent2: '#E8E8E8',
        accent3: '#FF6B6B',
        text: '#FFFFFF'
    }
}

async function createPodiumBanner(
    prizes: { position: number; title: string; images: Buffer[] }[],
    theme: keyof typeof THEMES,
    seasonTitle: string,
    size: { width: number; height: number; name: string }
): Promise<Buffer> {
    const { width, height, name } = size
    const themeColors = THEMES[theme]

    // Criar SVG de fundo com gradiente
    const gradientSVG = `
        <svg width="${width}" height="${height}">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    ${themeColors.gradient.map(g =>
        `<stop offset="${g.position * 100}%" style="stop-color:${g.color};stop-opacity:1" />`
    ).join('')}
                </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#grad)"/>
        </svg>
    `

    let background = await sharp(Buffer.from(gradientSVG)).png().toBuffer()

    // Organizar prizes por posição (1º mais alto no centro)
    const sortedPrizes = [...prizes].sort((a, b) => a.position - b.position)

    // Layout de pódio: 2º | 1º | 3º
    const podiumOrder = [
        sortedPrizes.find(p => p.position === 2), // Esquerda
        sortedPrizes.find(p => p.position === 1), // Centro (mais alto)
        sortedPrizes.find(p => p.position === 3)  // Direita
    ].filter(Boolean) as typeof sortedPrizes

    const sectionWidth = width / 3
    const baseImageSize = Math.floor(height * 0.4)

    const composites: sharp.OverlayOptions[] = []

    // Criar cada seção do pódio
    for (let i = 0; i < podiumOrder.length; i++) {
        const prize = podiumOrder[i]
        const xPos = i * sectionWidth

        // Primeiro lugar mais alto
        const heightMultiplier = prize.position === 1 ? 1.0 : 0.85
        const yOffset = prize.position === 1 ? 40 : 60

        // Cor do badge
        const badgeColor = prize.position === 1 ? themeColors.accent1 :
            prize.position === 2 ? themeColors.accent2 :
                themeColors.accent3

        // Badge de posição
        const badgeSize = Math.floor(baseImageSize * 0.25)
        const positionEmoji = ['🥇', '🥈', '🥉'][prize.position - 1]

        const badgeSVG = `
            <svg width="${badgeSize}" height="${badgeSize}">
                <circle cx="${badgeSize / 2}" cy="${badgeSize / 2}" r="${badgeSize / 2 - 3}" 
                        fill="${badgeColor}" stroke="#FFFFFF" stroke-width="3"/>
                <text x="50%" y="50%" 
                      font-family="Arial, sans-serif" 
                      font-size="${badgeSize * 0.6}" 
                      text-anchor="middle" 
                      dy=".35em">${positionEmoji}</text>
            </svg>
        `

        composites.push({
            input: Buffer.from(badgeSVG),
            top: yOffset,
            left: Math.floor(xPos + sectionWidth / 2 - badgeSize / 2)
        })

        // Processar primeira imagem do prêmio
        if (prize.images && prize.images.length > 0) {
            const productImage = await sharp(prize.images[0])
                .resize(
                    Math.floor(baseImageSize * heightMultiplier),
                    Math.floor(baseImageSize * heightMultiplier),
                    { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }
                )
                .png()
                .toBuffer()

            composites.push({
                input: productImage,
                top: yOffset + badgeSize + 10,
                left: Math.floor(xPos + sectionWidth / 2 - (baseImageSize * heightMultiplier) / 2)
            })
        }

        // Título do prêmio
        const titleFontSize = name === 'hero' ? 24 : name === 'card' ? 18 : name === 'sidebar' ? 12 : 16
        const titleMaxWidth = sectionWidth - 40
        const truncatedTitle = prize.title.length > 25 ? prize.title.substring(0, 22) + '...' : prize.title

        const titleSVG = `
            <svg width="${titleMaxWidth}" height="${titleFontSize + 10}">
                <text x="50%" y="${titleFontSize}" 
                      font-family="Arial, sans-serif" 
                      font-size="${titleFontSize}" 
                      font-weight="bold" 
                      fill="${themeColors.text}" 
                      text-anchor="middle"
                      style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5)">${truncatedTitle}</text>
            </svg>
        `

        composites.push({
            input: Buffer.from(titleSVG),
            top: height - titleFontSize - 30,
            left: Math.floor(xPos + sectionWidth / 2 - titleMaxWidth / 2)
        })
    }

    // Título da temporada (topo)
    if (seasonTitle && name !== 'sidebar') {
        const seasonFontSize = name === 'hero' ? 36 : name === 'card' ? 28 : 24
        const seasonTitleSVG = `
            <svg width="${width}" height="${seasonFontSize + 20}">
                <text x="50%" y="${seasonFontSize + 5}" 
                      font-family="Arial, sans-serif" 
                      font-size="${seasonFontSize}" 
                      font-weight="bold" 
                      fill="${themeColors.text}" 
                      text-anchor="middle"
                      style="text-shadow: 3px 3px 6px rgba(0,0,0,0.7)">${seasonTitle}</text>
            </svg>
        `

        composites.push({
            input: Buffer.from(seasonTitleSVG),
            top: 10,
            left: 0
        })
    }

    // Compor tudo
    background = await sharp(background)
        .composite(composites)
        .png()
        .toBuffer()

    return background
}

export async function POST(req: NextRequest) {
    try {
        const body: ComposeRequest = await req.json()
        const { prizes, theme, seasonTitle } = body

        if (!prizes || prizes.length === 0 || prizes.length > 3) {
            return NextResponse.json(
                { error: 'São necessários de 1 a 3 prêmios' },
                { status: 400 }
            )
        }

        console.log(`[PODIUM BANNER] Criando banners para ${prizes.length} prêmios`)

        // Download de todas as imagens
        const prizesWithImages = await Promise.all(
            prizes.map(async (prize) => {
                const images = await Promise.all(
                    prize.imageUrls.map(async (url) => {
                        const response = await fetch(url)
                        const arrayBuffer = await response.arrayBuffer()
                        return Buffer.from(arrayBuffer)
                    })
                )
                return { ...prize, images }
            })
        )

        console.log(`[PODIUM BANNER] Imagens carregadas`)

        // Criar os 4 tamanhos de banners
        const banners = await Promise.all(
            Object.values(BANNER_SIZES).map(async (size) => {
                console.log(`[PODIUM BANNER] Gerando banner ${size.name}...`)
                const buffer = await createPodiumBanner(
                    prizesWithImages,
                    theme,
                    seasonTitle || 'PRÊMIOS DA TEMPORADA',
                    size
                )
                return { size: size.name, buffer }
            })
        )

        console.log(`[PODIUM BANNER] 4 banners gerados! Fazendo upload...`)

        // Upload de todos os banners
        const supabase = await createClient()
        const timestamp = Date.now()

        const uploadResults = await Promise.all(
            banners.map(async ({ size, buffer }) => {
                const fileName = `podium_${size}_${timestamp}.png`
                const filePath = `banners/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('seasons')
                    .upload(filePath, buffer, {
                        contentType: 'image/png',
                        upsert: true,
                    })

                if (uploadError) {
                    console.error(`[PODIUM BANNER] Upload error (${size}):`, uploadError)
                    throw uploadError
                }

                const { data: urlData } = supabase.storage
                    .from('seasons')
                    .getPublicUrl(filePath)

                return {
                    size,
                    url: urlData.publicUrl
                }
            })
        )

        console.log(`[PODIUM BANNER] ✅ Todos os banners criados e salvos!`)

        // Organizar URLs por tamanho
        const bannerUrls = uploadResults.reduce((acc, { size, url }) => {
            acc[size] = url
            return acc
        }, {} as Record<string, string>)

        return NextResponse.json({
            success: true,
            banners: bannerUrls,
            sizes: {
                hero: '1400x500px - Topo de página',
                card: '1000x350px - Cards e seções',
                sidebar: '700x250px - Lateral',
                square: '500x500px - Posts'
            },
            theme,
            prizesCount: prizes.length
        })

    } catch (error: any) {
        console.error('[PODIUM BANNER] Error:', error)
        return NextResponse.json({
            error: error.message || 'Erro ao criar banners'
        }, { status: 500 })
    }
}
