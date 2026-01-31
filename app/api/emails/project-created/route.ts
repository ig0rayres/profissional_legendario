// app/api/emails/project-created/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { to, clientName, project, viewProposalsUrl } = body

        // TODO: Integrar com serviço de email real (SendGrid, Resend, etc)
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1E4D40 0%, #2A6B5A 100%); padding: 40px 20px; text-center; }
        .logo { font-size: 32px; color: white; font-weight: bold; }
        .subtitle { color: rgba(255,255,255,0.9); margin-top: 8px; }
        .content { padding: 40px 30px; }
        .project-card { background: #f9fafb; border-left: 4px solid #D4742C; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .project-title { font-size: 20px; font-weight: bold; color: #1E4D40; margin-bottom: 10px; }
        .project-detail { color: #666; margin: 8px 0; font-size: 14px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #D4742C 0%, #FF8C42 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
        .cta-button:hover { opacity: 0.9; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .highlight { color: #D4742C; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔥 Rota Business Club</div>
            <div class="subtitle">Conectando profissionais de elite</div>
        </div>
        
        <div class="content">
            <h1>Olá, ${clientName}!</h1>
            <p>Seu projeto foi publicado com sucesso e já está sendo distribuído para os melhores profissionais da plataforma!</p>
            
            <div class="project-card">
                <div class="project-title">${project.title}</div>
                <div class="project-detail">📂 <strong>Categoria:</strong> ${project.category}</div>
                ${project.estimated_budget ? `<div class="project-detail">💰 <strong>Orçamento:</strong> R$ ${project.estimated_budget.toFixed(2)}</div>` : ''}
                ${project.deadline ? `<div class="project-detail">📅 <strong>Prazo:</strong> ${project.deadline}</div>` : ''}
            </div>
            
            <h2>📬 Como funciona?</h2>
            <ol style="color: #666; line-height: 1.8;">
                <li>Profissionais qualificados estão recebendo notificações do seu projeto agora</li>
                <li>Eles enviarão <strong class="highlight">propostas com orçamentos</strong> personalizados</li>
                <li>Você receberá um email para cada nova proposta</li>
                <li>Poderá <strong class="highlight">comparar e escolher</strong> a melhor opção</li>
            </ol>
            
            <center>
                <a href="${viewProposalsUrl}" class="cta-button">
                    👁️ VISUALIZAR PROPOSTAS
                </a>
            </center>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>💡 Dica:</strong> Salve este email! Você usará o link acima para acompanhar todas as propostas recebidas.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Rota Business Club</strong> - A comunidade dos legendários</p>
            <p>Este é um email automático. Por favor, não responda.</p>
        </div>
    </div>
</body>
</html>
        `

        // Log para desenvolvimento (substituir por envio real)
        console.log('📧 Email enviado para:', to)
        console.log('🔗 Link:', viewProposalsUrl)

        return NextResponse.json({
            success: true,
            message: 'Email enviado com sucesso',
            // Em produção, retornar ID do email enviado
        })

    } catch (error) {
        console.error('Erro ao enviar email:', error)
        return NextResponse.json(
            { error: 'Erro ao enviar email' },
            { status: 500 }
        )
    }
}
