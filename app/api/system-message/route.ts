import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Função para criar cliente admin (chamada dentro da request, não no build)
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    })
}

export async function POST(request: NextRequest) {
    try {
        const { userId, message } = await request.json()

        if (!userId || !message) {
            return NextResponse.json(
                { error: 'userId e message são obrigatórios' },
                { status: 400 }
            )
        }

        // Criar cliente admin dentro da request
        const supabaseAdmin = getSupabaseAdmin()

        // Buscar ID do usuário do sistema (Rota Business)
        const { data: systemUser } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('slug', 'rotabusiness')
            .single()

        if (!systemUser) {
            console.error('[API system-message] Usuário do sistema (rotabusiness) não encontrado!')
            return NextResponse.json(
                { error: 'Usuário do sistema não encontrado' },
                { status: 500 }
            )
        }

        const SYSTEM_USER_ID = systemUser.id

        // Buscar ou criar conversa com o sistema
        let conversationId: string | null = null

        // Verificar se já existe conversa
        const { data: existingConv } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .or(`and(participant_1.eq.${SYSTEM_USER_ID},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${SYSTEM_USER_ID})`)
            .single()

        if (existingConv) {
            conversationId = existingConv.id
        } else {
            // Criar nova conversa
            const { data: newConv, error: convError } = await supabaseAdmin
                .from('conversations')
                .insert({
                    participant_1: SYSTEM_USER_ID < userId ? SYSTEM_USER_ID : userId,
                    participant_2: SYSTEM_USER_ID < userId ? userId : SYSTEM_USER_ID
                })
                .select('id')
                .single()

            if (convError) {
                console.error('[API system-message] Erro ao criar conversa:', convError)
                return NextResponse.json(
                    { error: 'Erro ao criar conversa' },
                    { status: 500 }
                )
            }
            conversationId = newConv?.id
        }

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Não foi possível obter conversa' },
                { status: 500 }
            )
        }

        // Inserir mensagem (com Service Role, bypassa RLS)
        const { error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: SYSTEM_USER_ID,
                content: message
            })

        if (msgError) {
            console.error('[API system-message] Erro ao inserir mensagem:', msgError)
            return NextResponse.json(
                { error: 'Erro ao inserir mensagem' },
                { status: 500 }
            )
        }

        // Atualizar last_message na conversa
        await supabaseAdmin
            .from('conversations')
            .update({
                last_message_at: new Date().toISOString(),
                last_message_preview: message.substring(0, 100)
            })
            .eq('id', conversationId)

        console.log('[API system-message] ✅ Mensagem enviada para', userId)

        return NextResponse.json({ success: true, conversationId })
    } catch (error: any) {
        console.error('[API system-message] Exception:', error)
        return NextResponse.json(
            { error: error.message || 'Erro interno' },
            { status: 500 }
        )
    }
}

