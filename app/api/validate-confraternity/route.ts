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
        const mimeType = imageFile.type || 'image/jpeg'

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
                                text: `Você é um validador de fotos de encontros profissionais.

TAREFA: Verificar se a imagem mostra um encontro/reunião entre DUAS OU MAIS pessoas.

✅ APROVAR SE:
- Há 2+ pessoas na foto (mesmo que parcialmente visíveis)
- Parece ser um encontro, reunião, confraternização, almoço, café, etc.
- Selfies com 2+ pessoas são VÁLIDAS
- Fotos de grupo são VÁLIDAS
- Pessoas em uniformes/jaquetas iguais indicam evento = VÁLIDO
- Pessoas sentadas à mesa, em pé conversando, em ambiente externo = VÁLIDO
- Videochamadas mostrando 2+ pessoas na tela = VÁLIDO
- Se der para ver partes de 2 corpos (braços, mãos, ombros) mesmo sem rostos completos = VÁLIDO

❌ REJEITAR APENAS SE:
- Foto claramente de apenas 1 pessoa sozinha
- Foto sem nenhuma pessoa visível (só paisagem/objetos)
- Imagem completamente desfocada/escura

IMPORTANTE: Na dúvida, APROVE. É melhor aprovar uma foto limítrofe do que rejeitar um encontro legítimo.

Responda APENAS com JSON:
{
  "approved": true/false,
  "people_count": número (mínimo 2 para aprovação),
  "confidence": "high"/"medium"/"low",
  "reason": "explicação em português, 1 frase"
}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`,
                                    detail: 'high'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 200,
                temperature: 0.1
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
