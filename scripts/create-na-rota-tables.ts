import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Ler .env.local manualmente
const envContent = readFileSync('.env.local', 'utf8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/)
    if (match) {
        envVars[match[1].trim()] = match[2].trim()
    }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createTables() {
    console.log('🚀 Criando tabelas do módulo NA ROTA...\n')

    const tables = [
        {
            name: 'posts',
            sql: `
                CREATE TABLE IF NOT EXISTS public.posts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                    content TEXT,
                    media_urls JSONB DEFAULT '[]'::jsonb,
                    confraternity_id UUID,
                    ai_validation JSONB,
                    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
                    likes_count INTEGER DEFAULT 0,
                    comments_count INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
                CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
            `
        },
        {
            name: 'post_likes',
            sql: `
                CREATE TABLE IF NOT EXISTS public.post_likes (
                    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
                    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                    PRIMARY KEY (post_id, user_id)
                );
                
                CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
            `
        },
        {
            name: 'post_comments',
            sql: `
                CREATE TABLE IF NOT EXISTS public.post_comments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
                    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_comments_post ON public.post_comments(post_id);
            `
        }
    ]

    for (const table of tables) {
        console.log(`📦 Criando tabela: ${table.name}...`)

        try {
            // Executar via query direta
            const { error } = await supabase.rpc('exec', { sql: table.sql })

            if (error) {
                console.log(`   ⚠️  ${error.message}`)
            } else {
                console.log(`   ✅ OK`)
            }
        } catch (error: any) {
            console.log(`   ⚠️  ${error.message}`)
        }
    }

    console.log('\n✅ Tabelas criadas!')
    console.log('\n💡 Próximo passo: Execute o SQL completo no Supabase Dashboard')
    console.log('   para adicionar RLS policies, triggers e storage buckets')
    console.log('\n📋 Arquivo: supabase/migrations/20260125_na_rota_feed.sql')
}

createTables().catch(console.error)
