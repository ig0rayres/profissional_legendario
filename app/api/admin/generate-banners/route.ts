import { NextResponse } from 'next/server'

// API temporariamente desabilitada - chrome-aws-lambda não é compatível com Next.js 14 em Vercel
// Solução futura: usar @sparticuz/chromium ou gerar banners via DALL-E

export async function POST(req: Request) {
    return NextResponse.json({
        success: false,
        error: 'Geração automática de banners temporariamente indisponível. Use upload manual de imagem.',
        message: 'Esta funcionalidade será reimplementada em breve usando IA (DALL-E).'
    }, { status: 503 })
}
