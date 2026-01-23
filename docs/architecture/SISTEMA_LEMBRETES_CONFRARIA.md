# Sistema de Lembretes de Confraria

## Visão Geral
24 horas antes de uma confraria agendada, ambos os participantes recebem:
- ✉️ Email de lembrete
- 🔔 Notificação na plataforma

## Arquivos Criados

### 1. SQL Script - `DEPLOY_CONFRATERNITY_REMINDER.sql`
- Adiciona coluna `reminder_sent` na tabela
- Cria função `get_confraternities_needing_reminder()`
- Cria função `mark_reminder_sent(invite_uuid)`

**Execute este script no Supabase SQL Editor primeiro!**

### 2. Edge Function - `supabase/functions/send-confraternity-reminders/index.ts`
- Busca confrarias que precisam de lembrete
- Envia notificações na plataforma
- Envia emails via Resend (se configurado)
- Marca lembrete como enviado

## Configuração

### Passo 1: Executar o SQL
```bash
# No Supabase Dashboard > SQL Editor
# Cole e execute o conteúdo de DEPLOY_CONFRATERNITY_REMINDER.sql
```

### Passo 2: Deploy da Edge Function
```bash
# Terminal no diretório do projeto
supabase functions deploy send-confraternity-reminders
```

### Passo 3: Configurar Variáveis de Ambiente
No Supabase Dashboard > Edge Functions > send-confraternity-reminders > Settings:
- `RESEND_API_KEY`: Sua API key do Resend (opcional, mas recomendado)

### Passo 4: Configurar Cron Job
No Supabase Dashboard > Database > Extensions > pg_cron

```sql
-- Habilitar extensão pg_cron (se não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar job para rodar a cada hora
SELECT cron.schedule(
    'confraternity-reminders',
    '0 * * * *',  -- A cada hora, no minuto 0
    $$
    SELECT net.http_post(
        url := 'https://SEU_PROJECT_ID.supabase.co/functions/v1/send-confraternity-reminders',
        headers := '{"Authorization": "Bearer SEU_SERVICE_ROLE_KEY"}'::jsonb
    );
    $$
);
```

### Passo 5: Testar manualmente
```bash
curl -X POST https://SEU_PROJECT_ID.supabase.co/functions/v1/send-confraternity-reminders \
  -H "Authorization: Bearer SEU_ANON_KEY"
```

## Tipo de Notificação

A notificação criada tem:
- **type**: `confraternity_reminder`
- **title**: "⏰ Confraria Amanhã!"
- **body**: Mensagem personalizada com nome do parceiro e data
- **priority**: high

## Comportamento do Card "Próximas Confrarias"

O card já filtra automaticamente por `proposed_date >= NOW()`, então:
- ✅ Confrarias passadas somem automaticamente
- ✅ Apenas confrarias futuras são exibidas
