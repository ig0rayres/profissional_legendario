import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('image') as File

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        const apiKey = process.env.REMOVEBG_API_KEY

        if (!apiKey) {
            console.log('[REMOVE BG] No API key configured, returning original')
            return NextResponse.json({
                error: 'Remove.bg API key not configured',
                mode: 'demo'
            }, { status: 400 })
        }

        // Preparar FormData para Remove.bg
        const removeBgFormData = new FormData()
        removeBgFormData.append('image_file', file)
        removeBgFormData.append('size', 'auto') // auto, preview, small, regular, medium, hd, 4k
        removeBgFormData.append('format', 'png')

        console.log('[REMOVE BG] Sending to Remove.bg API...')

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey
            },
            body: removeBgFormData
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[REMOVE BG] API Error:', errorText)
            return NextResponse.json({
                error: 'Remove.bg API error',
                details: errorText
            }, { status: response.status })
        }

        // Retornar a imagem processada
        const imageBlob = await response.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        console.log('[REMOVE BG] ✅ Background removed successfully!')

        return NextResponse.json({
            success: true,
            imageBase64: `data:image/png;base64,${base64}`,
            credits: response.headers.get('X-Credits-Charged')
        })

    } catch (error: any) {
        console.error('[REMOVE BG] Error:', error)
        return NextResponse.json({
            error: 'Failed to remove background',
            details: error.message
        }, { status: 500 })
    }
}
