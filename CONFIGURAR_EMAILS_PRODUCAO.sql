-- =============================================
-- DESABILITAR CONFIRMAÇÃO DE EMAIL (DESENVOLVIMENTO)
-- =============================================
-- ATENÇÃO: Isso é para DEV. Em produção, use SMTP customizado!

-- 1. No Supabase Dashboard:
-- Authentication → Settings → Email Auth
-- Desmarque "Enable email confirmations"

-- OU via SQL (se tiver acesso):
-- UPDATE auth.config 
-- SET email_confirm_required = false;

-- 2. Para testar se funcionou, tente cadastrar novo usuário
-- Deve funcionar sem confirmar email

-- =============================================
-- PARA PRODUÇÃO: CONFIGURAR SMTP CUSTOMIZADO
-- =============================================

/**
 * 📧 PROVIDERS RECOMENDADOS (gratuitos até 10k emails/mês):
 * 
 * 1. RESEND (Recomendado)
 *    - 3,000 emails/mês grátis
 *    - Fácil setup
 *    - https://resend.com
 * 
 * 2. SendGrid
 *    - 100 emails/dia grátis
 *    - Mais complexo
 *    - https://sendgrid.com
 * 
 * 3. Mailgun
 *    - 5,000 emails/mês grátis (3 meses)
 *    - Bom suporte
 *    - https://mailgun.com
 * 
 * CONFIGURAR EM:
 * Supabase Dashboard → Settings → Auth → Email Provider
 * - Email Provider: "Custom SMTP"
 * - Preencher credenciais do provider escolhido
 */

-- =============================================
-- IMPORTANTE PARA PRODUÇÃO
-- =============================================
-- ✅ SMTP Customizado = emails ilimitados
-- ✅ Sem rate limit
-- ✅ Melhor deliverability
-- ✅ Métricas de entrega
-- ✅ Templates personalizados
