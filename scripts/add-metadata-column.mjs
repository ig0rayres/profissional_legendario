// Script para adicionar coluna metadata na tabela posts
// Execute com: node scripts/add-metadata-column.mjs

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não encontradas')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addMetadataColumn() {
    console.log('🔧 Adicionando coluna metadata na tabela posts...')

    // O Supabase JS não permite executar DDL diretamente
    // Vamos usar a RPC ou verificar se a coluna já existe tentando um select

    try {
        // Tentar selecionar a coluna para ver se existe
        const { data, error } = await supabase
            .from('posts')
            .select('metadata')
            .limit(1)

        if (error && error.message.includes('does not exist')) {
            console.log('❌ Coluna metadata não existe.')
            console.log('')
            console.log('📋 Execute este SQL manualmente no Supabase Dashboard:')
            console.log('   https://supabase.com/dashboard > SQL Editor')
            console.log('')
            console.log('   ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;')
            console.log('')
        } else if (error) {
            console.error('Erro:', error.message)
        } else {
            console.log('✅ Coluna metadata já existe!')
        }
    } catch (err) {
        console.error('Erro:', err)
    }
}

addMetadataColumn()
