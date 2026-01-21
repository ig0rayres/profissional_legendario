import { NextRequest, NextResponse } from 'next/server'

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
                                text: `Analise esta imagem de uma gorra (boné) que contém um número de identificação impresso na aba.
                                
O número é composto por 5 a 7 dígitos e está em cor laranja/terracota sobre fundo camuflado.

Extraia APENAS o número de identificação. Responda SOMENTE com os dígitos numéricos, sem texto adicional.

Se não conseguir identificar um número, responda: ERRO

Exemplos de resposta correta: 141018, 123456, 9876543
Exemplo de resposta incorreta: O número é 141018`
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
                max_tokens: 50,
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

        console.log('[OCR API] Texto extraído:', extractedText)

        // Validar se é um número válido
        const cleanNumber = extractedText.replace(/\D/g, '')

        if (extractedText === 'ERRO' || cleanNumber.length < 5 || cleanNumber.length > 7) {
            return NextResponse.json({
                success: false,
                error: 'Não foi possível identificar o número na imagem',
                raw: extractedText
            })
        }

        return NextResponse.json({
            success: true,
            id: cleanNumber,
            raw: extractedText
        })

    } catch (error) {
        console.error('[OCR API] Erro:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
