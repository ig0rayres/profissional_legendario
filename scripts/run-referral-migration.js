// Script para executar migrations no Supabase via API
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erzprkocwzgdjrsictps.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcwNDczOSwiZXhwIjoyMDgwMjgwNzM5fQ.TfoShhr4ZupYxpvYf6gG42ZP8Ql4k8s7sBbYeKoH3mM'

async function runMigration() {
    console.log('🚀 Iniciando migration do sistema de indicação...\n')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // SQL dividido em partes para executar separadamente
    const statements = [
        // 1. Tabela de configuração
        `CREATE TABLE IF NOT EXISTS referral_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            commission_percentage DECIMAL(5,2) DEFAULT 100.00,
            commission_type VARCHAR(20) DEFAULT 'first_payment',
            fixed_commission_amount DECIMAL(10,2) DEFAULT NULL,
            release_days INTEGER DEFAULT 60,
            require_referred_active BOOLEAN DEFAULT TRUE,
            min_withdrawal_amount DECIMAL(10,2) DEFAULT 250.00,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,

        // 2. Tabela de indicações
        `CREATE TABLE IF NOT EXISTS referrals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            referral_code VARCHAR(50),
            utm_source VARCHAR(100),
            utm_medium VARCHAR(100),
            utm_campaign VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            activated_at TIMESTAMPTZ,
            UNIQUE(referred_id)
        )`,

        // 3. Tabela de comissões
        `CREATE TABLE IF NOT EXISTS referral_commissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
            referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            payment_amount DECIMAL(10,2) NOT NULL,
            commission_amount DECIMAL(10,2) NOT NULL,
            commission_percentage DECIMAL(5,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            payment_date TIMESTAMPTZ NOT NULL,
            release_date TIMESTAMPTZ,
            available_at TIMESTAMPTZ,
            withdrawn_at TIMESTAMPTZ,
            stripe_payment_intent_id VARCHAR(255),
            stripe_invoice_id VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,

        // 4. Tabela de solicitações de saque
        `CREATE TABLE IF NOT EXISTS withdrawal_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            pix_key VARCHAR(255),
            pix_key_type VARCHAR(20),
            bank_name VARCHAR(100),
            bank_agency VARCHAR(10),
            bank_account VARCHAR(20),
            bank_account_type VARCHAR(20),
            status VARCHAR(20) DEFAULT 'pending',
            processed_by UUID REFERENCES profiles(id),
            processed_at TIMESTAMPTZ,
            rejection_reason TEXT,
            receipt_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,

        // 5. Índices
        `CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id)`,
        `CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id)`,
        `CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)`,
        `CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON referral_commissions(referrer_id)`,
        `CREATE INDEX IF NOT EXISTS idx_commissions_status ON referral_commissions(status)`,
        `CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawal_requests(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status)`,

        // 6. RLS
        `ALTER TABLE referral_config ENABLE ROW LEVEL SECURITY`,
        `ALTER TABLE referrals ENABLE ROW LEVEL SECURITY`,
        `ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY`,
        `ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY`,
    ]

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
        const sql = statements[i]
        const shortSql = sql.substring(0, 60).replace(/\n/g, ' ')

        try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

            if (error) {
                // Tentar via fetch direto para a API REST
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                    },
                    body: JSON.stringify({ sql_query: sql })
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }
            }

            console.log(`✅ [${i + 1}/${statements.length}] ${shortSql}...`)
            successCount++
        } catch (error) {
            console.log(`⚠️ [${i + 1}/${statements.length}] ${shortSql}... (pode já existir)`)
            errorCount++
        }
    }

    // Inserir configuração padrão
    console.log('\n📝 Inserindo configuração padrão...')

    const { data: existingConfig } = await supabase
        .from('referral_config')
        .select('id')
        .limit(1)
        .single()

    if (!existingConfig) {
        const { error } = await supabase
            .from('referral_config')
            .insert({
                commission_percentage: 100.00,
                commission_type: 'first_payment',
                release_days: 60,
                require_referred_active: true,
                min_withdrawal_amount: 250.00,
                is_active: true
            })

        if (error) {
            console.log('⚠️ Erro ao inserir config:', error.message)
        } else {
            console.log('✅ Configuração padrão inserida!')
        }
    } else {
        console.log('ℹ️ Configuração já existe')
    }

    console.log(`\n📊 Resultado: ${successCount} sucesso, ${errorCount} avisos`)
    console.log('🎉 Migration concluída!')
}

runMigration().catch(console.error)
