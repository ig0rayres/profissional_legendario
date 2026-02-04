import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBMW320iAd() {
    console.log('🚗 Criando anúncio da BMW 320i...\n')

    // 1. Buscar categoria de Veículos
    const { data: category } = await supabase
        .from('marketplace_categories')
        .select('id')
        .eq('slug', 'veiculos')
        .single()

    if (!category) {
        console.error('❌ Categoria "veiculos" não encontrada!')
        return
    }

    console.log(`✅ Categoria encontrada: ${category.id}`)

    // 2. Buscar tier "Elite" (plano do meio)
    const { data: tier } = await supabase
        .from('marketplace_ad_tiers')
        .select('id, name')
        .eq('tier_level', 'elite')
        .single()

    if (!tier) {
        console.error('❌ Tier "Elite" não encontrado!')
        return
    }

    console.log(`✅ Tier encontrado: ${tier.name} (${tier.id})`)

    // 3. Buscar usuários para associar
    const { data: users } = await supabase
        .from('profiles')
        .select('id, name, email')
        .limit(10)

    if (!users || users.length === 0) {
        console.error('❌ Nenhum usuário encontrado!')
        return
    }

    // Escolher usuário aleatório
    const randomUser = users[Math.floor(Math.random() * users.length)]
    console.log(`✅ Usuário selecionado: ${randomUser.name} (${randomUser.email})`)

    // 4. Listar fotos do diretório (excluir documentos)
    const vehicleDir = '/home/igor/Vídeos/Legendarios/public/veiculos/BMW 320i'
    const files = fs.readdirSync(vehicleDir)
    const photoFiles = files
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .filter(f => !f.toLowerCase().includes('documento'))
        .filter(f => !f.toLowerCase().includes('cnh'))
        .filter(f => !f.toLowerCase().includes('doc'))
        .slice(0, 10) // Max 10 fotos para tier Elite

    console.log(`✅ ${photoFiles.length} fotos encontradas`)

    // 5. Criar array de URLs das fotos
    const photos = photoFiles.map(f => `/veiculos/BMW 320i/${f}`)

    // 6. Dados mock realistas do anúncio
    const adData = {
        user_id: randomUser.id,
        category_id: category.id,
        tier_id: tier.id,
        title: 'BMW 320i 2017 - Impecável - Único Dono',
        description: `🚗 BMW 320i 2017 em estado impecável!

📋 ESPECIFICAÇÕES:
• Marca: BMW
• Modelo: 320i Sport GP
• Ano: 2017/2018
• Cor: Prata Metálico
• Câmbio: Automático 8 velocidades
• Motor: 2.0 Turbo 184cv
• Km: 58.000 km (único dono)

🔧 DIFERENCIAIS:
• Teto solar panorâmico
• Bancos em couro bege
• Faróis full LED
• Rodas aro 18"
• Paddle Shift
• Sistema de som Harman Kardon
• Sensores de estacionamento dianteiro e traseiro
• Câmera de ré
• Controle de cruzeiro adaptativo
• Piloto automático

📚 DOCUMENTAÇÃO:
• Manual completo
• Chave reserva
• Todas as revisões em concessionária
• IPVA 2024 pago
• Licenciamento em dia

💎 ESTADO DE CONSERVAÇÃO:
• Motor sem barulhos
• Ar condicionado gelando perfeito
• Pneus com 80% vida útil
• Pintura original sem retoques
• Interior impecável, sem rasgos

🤝 ACEITO PROPOSTA!
📱 Chama no WhatsApp para mais info
🔄 Aceito troca com volta

Carro está em Ribeirão Preto/SP
Disponível para test drive!`,
        price: 145000,
        status: 'active',
        condition: 'usado',
        location: 'Ribeirão Preto, SP',
        photos: photos,
        expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias
        metadata: {
            marca: 'BMW',
            modelo: '320i Sport GP',
            ano: 2017,
            combustivel: 'Gasolina',
            cambio: 'Automático',
            km: 58000,
            cor: 'Prata',
            portas: 4,
            final_placa: '7',
            unico_dono: true,
            ipva_pago: true,
            aceita_troca: true
        }
    }

    // 7. Inserir anúncio
    console.log('\n📤 Inserindo anúncio no banco...')
    const { data: ad, error } = await supabase
        .from('marketplace_listings')
        .insert(adData)
        .select()
        .single()

    if (error) {
        console.error('❌ Erro ao inserir anúncio:', error)
        return
    }

    console.log('✅ Anúncio criado com sucesso!')
    console.log(`\n📊 RESUMO:`)
    console.log(`   ID: ${ad.id}`)
    console.log(`   Título: ${ad.title}`)
    console.log(`   Preço: R$ ${ad.price.toLocaleString('pt-BR')}`)
    console.log(`   Vendedor: ${randomUser.name}`)
    console.log(`   Fotos: ${photos.length}`)
    console.log(`   Status: ${ad.status}`)
    console.log(`   Expira em: ${new Date(ad.expires_at).toLocaleDateString('pt-BR')}`)
    console.log(`\n🎉 Primeiro anúncio populado no marketplace!`)
}

createBMW320iAd().catch(console.error)
