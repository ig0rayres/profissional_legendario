import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * API para validar foto de confraria com IA
 * POST /api/confraternity/validate-photo
 * 
 * Verifica se a foto mostra 2+ pessoas juntas
 */

interface ValidationResult {
    approved: boolean
    people_count?: number
    confidence: 'high' | 'medium' | 'low'
    reason: string
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { photoUrl } = body

        if (!photoUrl) {
            return NextResponse.json({
                approved: false,
                reason: 'URL da foto não fornecida',
                confidence: 'low'
            }, { status: 400 })
        }

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            console.warn('[Validate-Photo] OpenAI API não configurada, aprovando automaticamente')
            return NextResponse.json({
                approved: true,
                confidence: 'low',
                reason: 'Validação automática (IA não configurada)'
            })
        }

        console.log('[Validate-Photo] Validando foto de confraria:', photoUrl.substring(0, 50) + '...')

        // Buscar imagem
        const imageResponse = await fetch(photoUrl)
        if (!imageResponse.ok) {
            return NextResponse.json({
                approved: false,
                reason: 'Não foi possível acessar a imagem',
                confidence: 'low'
            }, { status: 400 })
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

        // Prompt para validação
        const prompt = `Analise esta imagem e verifique se ela mostra uma reunião ou confraternização entre 2 ou mais pessoas.

Critérios para APROVAÇÃO (approved: true, confidence: high):
- Deve haver pelo menos 2 pessoas CLARAMENTE visíveis na foto
- Deve parecer uma reunião, encontro, confraternização ou momento social
- Pode ser em restaurante, café, escritório, área externa, casa, etc.
- Selfies com 2+ pessoas são aceitas
- Pessoas devem estar interagindo ou juntas

Critérios para APROVAÇÃO COM REVISÃO (approved: true, confidence: medium):
- 2+ pessoas mas foto desfocada
- Pessoas visíveis mas não claramente interagindo
- Ambiente social mas qualidade da foto ruim

Critérios para REJEIÇÃO (approved: false):
- Foto de apenas 1 pessoa (selfie solo)
- Foto de paisagem/cenário sem pessoas
- Foto de objetos/comida sem pessoas visíveis
- Imagem muito desfocada ou escura para identificar pessoas
- Fotos de tela/prints de outras fotos
- Memes ou imagens da internet

Responda APENAS com um JSON válido no formato:
{
  "approved": true ou false,
  "people_count": número de pessoas detectadas (0 se não conseguir identificar),
  "confidence": "high" ou "medium" ou "low",
  "reason": "explicação breve em português"
}

IMPORTANTE: Responda SOMENTE o JSON, sem texto adicional.`

        // Chamar OpenAI Vision
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                                detail: 'high'
                            }
                        }
                    ]
                }],
                max_tokens: 200,
                temperature: 0
            })
        })

        if (!response.ok) {
            console.error('[Validate-Photo] Erro OpenAI:', await response.text())
            // Se OpenAI falhar, aprovar com baixa confiança para não bloquear o usuário
            return NextResponse.json({
                approved: true,
                confidence: 'low',
                reason: 'Validação temporariamente indisponível'
            })
        }

        const data = await response.json()
        const rawResponse = data.choices?.[0]?.message?.content?.trim() || ''

        console.log('[Validate-Photo] Resposta bruta:', rawResponse)

        // Parsear resposta
        try {
            const cleanJson = rawResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            const result: ValidationResult = JSON.parse(cleanJson)

            console.log('[Validate-Photo] Resultado parseado:', result)

            return NextResponse.json(result)
        } catch (parseError) {
            console.error('[Validate-Photo] Erro ao parsear resposta:', parseError)
            // Se não conseguir parsear, aprovar com baixa confiança
            return NextResponse.json({
                approved: true,
                confidence: 'low',
                reason: 'Erro na análise, aprovado para revisão manual'
            })
        }

    } catch (error) {
        console.error('[Validate-Photo] Erro:', error)
        // Em caso de erro, não bloquear o usuário
        return NextResponse.json({
            approved: true,
            confidence: 'low',
            reason: 'Erro interno, aprovado para revisão manual'
        })
    }
}
