import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


/**
 * API Route para validar foto de confraternização usando OpenAI Vision
 * POST /api/validate-confraternity
 * Body: FormData com campo 'image' (arquivo de imagem)
 * 
 * Retorna:
 * - approved: boolean
 * - people_count: number
 * - confidence: 'high' | 'medium' | 'low'
 * - reason: string
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const imageFile = formData.get('image') as File

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Nenhuma imagem enviada' },
                { status: 400 }
            )
        }

        // Verificar se é uma imagem (não vídeo)
        const mimeType = imageFile.type || 'image/jpeg'
        if (!mimeType.startsWith('image/')) {
            // Vídeos são automaticamente aprovados (não podemos validar via IA)
            console.log('[Validate Confraternity] Arquivo de vídeo detectado, aprovando automaticamente')
            return NextResponse.json({
                approved: true,
                people_count: 2,
                confidence: 'medium',
                reason: 'Vídeo aprovado automaticamente'
            })
        }

        // Verificar se tem API key configurada
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenAI API não configurada' },
                { status: 500 }
            )
        }

        // Converter imagem para base64
        const bytes = await imageFile.arrayBuffer()
        const base64Image = Buffer.from(bytes).toString('base64')

        console.log('[Validate Confraternity] Iniciando validação por IA...')

        // Chamar OpenAI Vision API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Você é um validador de fotos de confraternização. Seu objetivo é APROVAR fotos que mostram pessoas juntas.

OBJETIVO: Verificar se há 2 ou mais pessoas humanas na foto.

REGRA PRINCIPAL:
- Se conseguir identificar 2 OU MAIS pessoas → APROVE (approved: true)
- Se houver apenas 1 pessoa sozinha → REJEITE
- Se não houver pessoas → REJEITE

O QUE CONTA COMO PESSOA:
- Rostos (mesmo parcialmente visíveis ou com óculos/chapéu/boné)
- Corpos humanos (mesmo de costas ou parcialmente cobertos)
- Silhuetas humanas
- Pessoas usando jaquetas, uniformes, roupas coloridas
- Pessoas em fotos de eventos, encontros, expedições
- Pessoas lado a lado, abraçadas ou próximas

IMPORTANTE - SEJA PERMISSIVO:
- Ignore logos, textos, marcas d'água ou overlays na foto
- Foque APENAS em identificar seres humanos
- Se a foto mostrar claramente 2 pessoas lado a lado → APROVE
- Na DÚVIDA, APROVE com confidence "medium"
- Fotos de eventos/encontros geralmente têm múltiplas pessoas

Responda APENAS com JSON válido:
{
  "approved": true,
  "people_count": 2,
  "confidence": "high",
  "reason": "2 pessoas detectadas na foto"
}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`,
                                    detail: 'low'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 150,
                temperature: 0.3
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('[Validate Confraternity] OpenAI error:', errorData)

            if (errorData.error?.code === 'rate_limit_exceeded') {
                return NextResponse.json({
                    success: false,
                    error: 'Limite de requisições atingido. Aguarde alguns minutos.',
                    code: 'RATE_LIMIT'
                })
            }

            return NextResponse.json(
                { error: 'Erro ao processar imagem', details: errorData },
                { status: 500 }
            )
        }

        const data = await response.json()
        const rawResponse = data.choices?.[0]?.message?.content?.trim() || ''

        console.log('[Validate Confraternity] Raw response:', rawResponse)

        // Tentar parsear o JSON da resposta
        try {
            // Limpar resposta (remover markdown se houver)
            const cleanJson = rawResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            const result = JSON.parse(cleanJson)

            console.log('[Validate Confraternity] Parsed result:', result)

            return NextResponse.json({
                success: true,
                approved: result.approved === true,
                people_count: result.people_count || 0,
                confidence: result.confidence || 'low',
                reason: result.reason || 'Análise concluída'
            })

        } catch (parseError) {
            console.error('[Validate Confraternity] Parse error:', parseError)
            console.error('[Validate Confraternity] Raw was:', rawResponse)

            // Se não conseguiu parsear, tentar extrair informações básicas
            const hasMultiplePeople = rawResponse.toLowerCase().includes('2') ||
                rawResponse.toLowerCase().includes('pessoas') ||
                rawResponse.toLowerCase().includes('people')

            return NextResponse.json({
                success: true,
                approved: hasMultiplePeople,
                people_count: hasMultiplePeople ? 2 : 1,
                confidence: 'low',
                reason: 'Não foi possível analisar a resposta da IA completamente'
            })
        }

    } catch (error) {
        console.error('[Validate Confraternity] Erro:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
