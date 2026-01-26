import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * API para validação automática de posts com IA
 * POST /api/posts/auto-validate
 * 
 * Fluxo:
 * 1. Post é criado
 * 2. Se tem confraria/projeto vinculado, chama esta API
 * 3. IA analisa fotos
 * 4. Se aprovado: valida automaticamente e concede medalhas
 * 5. Se rejeitado: marca como rejeitado com motivo
 */

interface ValidationResult {
    approved: boolean
    people_count?: number
    confidence: 'high' | 'medium' | 'low'
    reason: string
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const body = await request.json()
        const { postId } = body

        if (!postId) {
            return NextResponse.json({ error: 'postId obrigatório' }, { status: 400 })
        }

        // Buscar post
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('*, confraternity_invites(*), portfolio_items(*)')
            .eq('id', postId)
            .single()

        if (postError || !post) {
            return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
        }

        // Verificar se tem mídia
        if (!post.media_urls || post.media_urls.length === 0) {
            return NextResponse.json({
                error: 'Post sem mídia não pode ser validado automaticamente'
            }, { status: 400 })
        }

        // Determinar tipo de validação
        const validationType = post.confraternity_id ? 'confraternity' :
            post.project_id ? 'project' : null

        if (!validationType) {
            return NextResponse.json({
                error: 'Post não vinculado a confraria ou projeto'
            }, { status: 400 })
        }

        console.log(`[Auto-Validate] Validando ${validationType} para post ${postId}`)

        // Validar primeira foto com IA
        const firstPhotoUrl = post.media_urls[0]
        const validation = await validateWithAI(firstPhotoUrl, validationType)

        console.log(`[Auto-Validate] Resultado:`, validation)

        // Se aprovado automaticamente (confiança alta)
        if (validation.approved && validation.confidence === 'high') {
            // Validar no banco
            if (validationType === 'confraternity') {
                const { error } = await supabase.rpc('validate_confraternity_proof_safe', {
                    p_confraternity_id: post.confraternity_id,
                    p_validator_id: 'auto-ia' // ID especial para IA
                })

                if (error) {
                    console.error('[Auto-Validate] Erro ao validar confraria:', error)
                } else {
                    console.log('[Auto-Validate] Confraria validada automaticamente!')

                    // TODO: Conceder medalhas automaticamente
                    // await awardMedalsForConfraternity(post.user_id)
                }
            } else if (validationType === 'project') {
                const { error } = await supabase.rpc('validate_project_delivery_safe', {
                    p_project_id: post.project_id,
                    p_validator_id: 'auto-ia'
                })

                if (error) {
                    console.error('[Auto-Validate] Erro ao validar projeto:', error)
                } else {
                    console.log('[Auto-Validate] Projeto validado automaticamente!')

                    // TODO: Conceder medalhas automaticamente
                    // await awardMedalsForProject(post.user_id)
                }
            }

            return NextResponse.json({
                success: true,
                validated: true,
                validation
            })
        }

        // Se confiança média/baixa ou rejeitado, marcar como pendente para revisão manual
        if (!validation.approved || validation.confidence !== 'high') {
            await supabase
                .from('posts')
                .update({
                    validation_status: 'pending',
                    // Salvar resultado da IA em metadata
                })
                .eq('id', postId)

            return NextResponse.json({
                success: true,
                validated: false,
                needsManualReview: true,
                validation
            })
        }

        return NextResponse.json({
            success: true,
            validated: false,
            validation
        })

    } catch (error) {
        console.error('[Auto-Validate] Erro:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

/**
 * Valida foto com IA
 */
async function validateWithAI(
    photoUrl: string,
    type: 'confraternity' | 'project'
): Promise<ValidationResult> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        throw new Error('OpenAI API não configurada')
    }

    // Buscar imagem
    const imageResponse = await fetch(photoUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Prompt específico por tipo
    const prompt = type === 'confraternity'
        ? getConfraternityPrompt()
        : getProjectPrompt()

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
        throw new Error('Erro ao chamar OpenAI')
    }

    const data = await response.json()
    const rawResponse = data.choices?.[0]?.message?.content?.trim() || ''

    // Parsear resposta
    const cleanJson = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

    return JSON.parse(cleanJson)
}

function getConfraternityPrompt(): string {
    return `Analise esta imagem e verifique se ela mostra uma reunião ou confraternização entre 2 ou mais pessoas.

Critérios para APROVAÇÃO (confidence: high):
- Deve haver pelo menos 2 pessoas CLARAMENTE visíveis na foto
- Deve parecer uma reunião, encontro, confraternização ou momento social
- Pode ser em restaurante, café, escritório, área externa, casa, etc.
- Selfies com 2+ pessoas são aceitas
- Pessoas devem estar interagindo ou juntas

Critérios para APROVAÇÃO COM REVISÃO (confidence: medium):
- 2+ pessoas mas foto desfocada
- Pessoas visíveis mas não claramente interagindo
- Ambiente social mas qualidade da foto ruim

Critérios para REJEIÇÃO (approved: false):
- Foto de apenas 1 pessoa (selfie solo)
- Foto de paisagem/cenário sem pessoas
- Foto de objetos/comida sem pessoas visíveis
- Imagem muito desfocada ou escura para identificar pessoas
- Fotos de tela/prints de outras fotos

Responda APENAS com um JSON válido no formato:
{
  "approved": true ou false,
  "people_count": número de pessoas detectadas (0 se não conseguir identificar),
  "confidence": "high" ou "medium" ou "low",
  "reason": "explicação breve em português"
}

IMPORTANTE: Responda SOMENTE o JSON, sem texto adicional.`
}

function getProjectPrompt(): string {
    return `Analise esta imagem e verifique se ela mostra um trabalho/serviço profissional concluído.

Critérios para APROVAÇÃO (confidence: high):
- Mostra claramente um trabalho finalizado (website, design, instalação, etc)
- Qualidade profissional visível
- Evidência clara de conclusão do projeto

Critérios para APROVAÇÃO COM REVISÃO (confidence: medium):
- Trabalho visível mas qualidade da foto ruim
- Projeto aparentemente concluído mas sem detalhes claros

Critérios para REJEIÇÃO (approved: false):
- Foto não mostra trabalho profissional
- Apenas selfie ou foto pessoal
- Foto de paisagem/objetos não relacionados a trabalho
- Imagem muito desfocada

Responda APENAS com um JSON válido no formato:
{
  "approved": true ou false,
  "confidence": "high" ou "medium" ou "low",
  "reason": "explicação breve em português"
}

IMPORTANTE: Responda SOMENTE o JSON, sem texto adicional.`
}
