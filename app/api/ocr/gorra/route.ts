import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


/**
 * API Route para extrair ID da gorra usando OpenAI Vision
 * POST /api/ocr/gorra
 * Body: FormData com campo 'image' (arquivo de imagem)
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

        // Chamar OpenAI Vision API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Mais barato que gpt-4o
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Você é um sistema de validação de ID_ROTA do Rota Business Club.

CONTEXTO:
- Membros possuem um número de identificação impresso em cor LARANJA sobre fundo CAMUFLADO marrom/bege
- O número tem entre 5 e 7 dígitos

TAREFA:
Analise a imagem e responda no formato JSON:
{
  "valid": true/false,
  "id": "123456" ou null,
  "reason": "motivo se inválido"
}

VALIDAÇÕES (ambas obrigatórias):
1. O número DEVE estar em COR LARANJA (tons de laranja/terracota/coral)
2. O fundo DEVE ser CAMUFLADO (padrão militar marrom/bege, tons terrosos)

Se o número NÃO estiver em cor laranja:
{"valid": false, "id": null, "reason": "Número não está na cor laranja oficial"}

Se o fundo NÃO for camuflado marrom/bege:
{"valid": false, "id": null, "reason": "Fundo não é o padrão camuflado oficial"}

Se ambas validações passarem:
{"valid": true, "id": "123456", "reason": null}

Se não conseguir ver um número:
{"valid": false, "id": null, "reason": "Não foi possível identificar um número na imagem"}

Responda APENAS com o JSON, sem markdown ou texto adicional.`
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
                temperature: 0 // Resposta determinística
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('[OCR API] OpenAI error:', errorData)

            // Verificar se é erro de rate limit
            if (errorData.error?.code === 'rate_limit_exceeded') {
                return NextResponse.json({
                    success: false,
                    error: 'Limite de requisições atingido. Aguarde alguns minutos e tente novamente.',
                    code: 'RATE_LIMIT'
                })
            }

            return NextResponse.json(
                { error: 'Erro ao processar imagem', details: errorData },
                { status: 500 }
            )
        }

        const data = await response.json()
        const extractedText = data.choices?.[0]?.message?.content?.trim() || ''

        console.log('[OCR API] Resposta IA:', extractedText)

        // Tentar parsear como JSON
        try {
            // Limpar possíveis caracteres extras (markdown, etc)
            const cleanJson = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            const result = JSON.parse(cleanJson)

            console.log('[OCR API] Resultado parseado:', result)

            if (result.valid === true && result.id) {
                // Validação passou!
                const cleanNumber = result.id.replace(/\D/g, '')

                if (cleanNumber.length >= 5 && cleanNumber.length <= 7) {
                    return NextResponse.json({
                        success: true,
                        id: cleanNumber,
                        raw: extractedText
                    })
                }
            }

            // Validação falhou - retornar motivo específico
            return NextResponse.json({
                success: false,
                error: result.reason || 'Imagem não reconhecida como boné oficial',
                code: 'VALIDATION_FAILED',
                raw: extractedText
            })

        } catch (jsonError) {
            // Fallback: tentar extrair número do texto (compatibilidade)
            console.log('[OCR API] Fallback: extraindo número do texto')
            const cleanNumber = extractedText.replace(/\D/g, '')

            if (cleanNumber.length >= 5 && cleanNumber.length <= 7) {
                return NextResponse.json({
                    success: true,
                    id: cleanNumber,
                    raw: extractedText,
                    warning: 'Validação de autenticidade não realizada'
                })
            }

            return NextResponse.json({
                success: false,
                error: 'Não foi possível identificar o número na imagem',
                raw: extractedText
            })
        }

    } catch (error) {
        console.error('[OCR API] Erro:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
