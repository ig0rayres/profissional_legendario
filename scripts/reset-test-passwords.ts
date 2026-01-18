// Script para redefinir senhas dos usuários de teste
// Execute com: npx tsx scripts/reset-test-passwords.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Usuários e suas novas senhas
const users = [
    { id: 'efed140e-14e1-456c-b6df-643c974106a3', email: 'recruta@rotabusiness.com.br', newPassword: 'Recruta123!' },
    { id: '458489a5-49d1-41a5-9d79-c36c0752e7b6', email: 'veterano@rotabusiness.com.br', newPassword: 'Veterano123!' },
    { id: 'ccdc0524-6803-4017-b08c-944785e14338', email: 'elite@rotabusiness.com.br', newPassword: 'Elite123!' },
    { id: '58063204-c8a2-493b-8488-846cc02ef7b6', email: 'admin@rotaclub.com', newPassword: 'Admin123!' },
]

async function resetPasswords() {
    console.log('🔐 Redefinindo senhas dos usuários de teste...\n')

    for (const user of users) {
        try {
            const { error } = await supabase.auth.admin.updateUserById(
                user.id,
                { password: user.newPassword }
            )

            if (error) {
                console.error(`❌ ${user.email}: ${error.message}`)
            } else {
                console.log(`✅ ${user.email}: senha = ${user.newPassword}`)
            }
        } catch (err: any) {
            console.error(`❌ ${user.email}: ${err.message}`)
        }
    }

    console.log('\n🎉 Processo concluído!')
}

resetPasswords()
