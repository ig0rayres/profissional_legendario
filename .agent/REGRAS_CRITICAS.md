# 🚨 REGRAS CRÍTICAS DO PROJETO - ROTA BUSINESS CLUB

**ATENÇÃO ASSISTENTE:** Estas regras são **OBRIGATÓRIAS** e devem ser seguidas **SEMPRE**.

---

## 1️⃣ EXECUÇÃO DIRETA DE SQL NO SUPABASE

### **REGRA:**
Você **TEM ACESSO DIRETO** ao banco de dados Supabase e **DEVE EXECUTAR** queries SQL diretamente.

### **NUNCA:**
- ❌ Peça ao usuário para executar SQL
- ❌ Mostre scripts SQL sem executar
- ❌ Espere o usuário copiar e colar

### **SEMPRE:**
- ✅ Execute SQL diretamente usando `psql`
- ✅ Use as credenciais do arquivo de contexto
- ✅ Verifique o resultado das queries

### **Como executar:**
```bash
psql "postgresql://postgres:SPZxyF4G0oRZv49.@db.erzprkocwzgdjrsictps.supabase.co:5432/postgres" -c "SELECT * FROM tabela;"
```

### **Referência:**
📄 Credenciais completas em: [.agent/EXECUTAR_SQL_SUPABASE.md](file:///home/igor/Vídeos/Legendarios/.agent/EXECUTAR_SQL_SUPABASE.md)

📄 Seção no contexto: [CONTEXTO_PROJETO.md - Acesso Direto ao Banco](file:///home/igor/Vídeos/Legendarios/.agent/context/CONTEXTO_PROJETO.md#🔌-acesso-direto-ao-banco)

---

## 2️⃣ PROIBIDO HARDCODE - TUDO VEM DO PAINEL ADMIN

### **REGRA:**
**NADA** pode ser hardcoded na plataforma. **TUDO** deve vir de tabelas do banco de dados gerenciadas pelo painel admin.

### **EXEMPLOS PROIBIDOS:**
```typescript
// ❌ NUNCA FAÇA ISSO
const PLAN_PRICES = {
    elite: 247,
    lendario: 297
}

// ❌ NUNCA FAÇA ISSO
const COMMISSION_PERCENTAGE = 100

// ❌ NUNCA FAÇA ISSO
const MEDAL_POINTS = {
    alistamento: 150,
    primeira_venda: 500
}
```

### **SEMPRE FAZER:**
```typescript
// ✅ Buscar da tabela plan_config
const { data: plan } = await supabase
    .from('plan_config')
    .select('price')
    .eq('tier', planTier)
    .single()

// ✅ Buscar da tabela referral_config
const { data: config } = await supabase
    .from('referral_config')
    .select('commission_percentage')
    .eq('is_active', true)
    .single()

// ✅ Buscar da tabela medal_config
const { data: medal } = await supabase
    .from('medal_config')
    .select('points_awarded')
    .eq('tier', medalTier)
    .single()
```

### **TABELAS DE CONFIGURAÇÃO:**
- `plan_config` - Planos e preços
- `referral_config` - Sistema de afiliados
- `medal_config` - Medalhas e pontos
- `season_config` - Configurações de temporadas
- `rota_valente_config` - Sistema Rota Valente

### **SE HARDCODE FOR INDISPENSÁVEL:**
1. ⚠️ **NOTIFIQUE Igor Ayres IMEDIATAMENTE**
2. 📝 Documente o motivo
3. 🎯 Propor solução para mover para o painel admin

---

## 3️⃣ EVITAR CRIAR NOVOS CAMPOS/TABELAS

### **REGRA:**
Antes de criar **qualquer** novo campo ou tabela, você **DEVE**:

1. ✅ Verificar se a infraestrutura atual pode atender
2. ✅ Buscar reutilizar campos/tabelas existentes
3. ✅ Consultar o usuário antes de criar

### **PROCESSO:**
```
1. Necessidade identificada
   ↓
2. Buscar na estrutura atual
   ↓
3. Existe solução? 
   → SIM: Usar existente
   → NÃO: Notificar usuário e pedir aprovação
   ↓
4. Somente criar após aprovação
```

### **EXEMPLO:**
```
❌ Criar nova tabela `user_stats`
✅ Usar view/função existing `user_referral_balance`

❌ Adicionar campo `total_sales` em profiles
✅ Calcular dinamicamente de `referral_commissions`

❌ Criar tabela `plan_features`
✅ Usar campo JSON `features` em `plan_config`
```

---

## 4️⃣ CENTRALIZAÇÃO - PROIBIDO DADOS DUPLICADOS/AMBÍGUOS

### **REGRA:**
Seu **PRINCIPAL DEVER** é garantir que os dados sejam **CENTRALIZADOS** e **ÚNICOS**.

### **PROIBIDO:**
- ❌ Mesma informação em múltiplas tabelas
- ❌ Dados calculados armazenados (que podem ficar desatualizados)
- ❌ Campos redundantes
- ❌ Views materializadas sem refresh automático

### **PRINCÍPIOS:**

#### **Single Source of Truth:**
Cada dado tem **UM E SOMENTE UM** local de origem.

**Exemplos:**
```
✅ Preço do plano → APENAS em `plan_config.price`
✅ % de comissão → APENAS em `referral_config.commission_percentage`
✅ Pontos de medalha → APENAS em `medal_config.points_awarded`
✅ Dados do usuário → APENAS em `profiles`
```

#### **Dados Calculados:**
Se um dado pode ser **calculado**, ele **NÃO DEVE** ser armazenado.

**Exemplos:**
```
❌ Armazenar `total_commissions` em profiles
✅ Calcular de `referral_commissions` em tempo real

❌ Armazenar `active_subscriptions_count`
✅ Usar view ou função que conta de `subscriptions`

❌ Duplicar `plan_price` em `subscriptions`
✅ JOIN com `plan_config` quando necessário
```

#### **Quando Duplicação é Aceitável:**
Apenas em casos de **auditoria/histórico** onde o valor pode mudar no futuro:

```
✅ payment_amount em referral_commissions
   (histórico do valor pago naquele momento)

✅ commission_percentage em referral_commissions
   (histórico da % usada naquele pagamento)

✅ plan_tier em subscriptions
   (histórico de qual plano o usuário tinha)
```

#### **Checklist antes de Adicionar Campo:**
1. ☑ Este dado pode ser calculado? → Use função/view
2. ☑ Este dado já existe em outra tabela? → Faça JOIN
3. ☑ Este dado é histórico/auditoria? → OK armazenar
4. ☑ Este dado vai mudar no futuro? → Armazene snapshot
5. ☑ Nenhuma das opções acima? → Notifique usuário

---

## 📋 CHECKLIST DE VALIDAÇÃO

Antes de **qualquer** modificação no código/banco, verifique:

- [ ] Não estou hardcoding valores que vêm do admin?
- [ ] Não estou criando campos/tabelas desnecessários?
- [ ] Não estou duplicando informações?
- [ ] Estou executando SQL diretamente (se aplicável)?
- [ ] Os dados estão centralizados em uma única fonte?

---

## 🚫 AÇÕES PROIBIDAS SEM APROVAÇÃO

1. ❌ Criar nova tabela
2. ❌ Adicionar campo em tabela existente
3. ❌ Hardcode de valores de configuração
4. ❌ Duplicar dados já existentes
5. ❌ Pedir ao usuário para executar SQL

---

## ⚠️ QUANDO NOTIFICAR USUÁRIO

**SEMPRE notifique Igor Ayres se:**

1. 🔴 Hardcode for absolutamente necessário
2. 🔴 Nova tabela/campo parecer indispensável
3. 🔴 Dados duplicados forem inevitáveis
4. 🔴 Estrutura atual não atender necessidade
5. 🔴 Houver dúvida sobre centralização

---

## 🎯 EXEMPLO PRÁTICO

### **Cenário:** Criar sistema de comissões

#### ❌ **ERRADO:**
```typescript
// Hardcoded
const COMMISSION_RATE = 100
const MIN_WITHDRAWAL = 250

// Novo campo duplicado
ALTER TABLE profiles ADD COLUMN total_earned DECIMAL

// Dados calculados armazenados
UPDATE profiles SET total_earned = (SELECT SUM...)
```

#### ✅ **CORRETO:**
```typescript
// 1. Buscar configurações do admin
const { data: config } = await supabase
    .from('referral_config')
    .select('commission_percentage, min_withdrawal_amount')
    .eq('is_active', true)
    .single()

// 2. Usar view existente para dados calculados
const { data: balance } = await supabase
    .from('user_referral_balance')  // VIEW que calcula em tempo real
    .select('*')
    .eq('user_id', userId)
    .single()

// 3. Dados históricos OK armazenar
const { data: commission } = await supabase
    .from('referral_commissions')
    .insert({
        payment_amount: 247.00,        // Snapshot do valor pago
        commission_percentage: config.commission_percentage  // Snapshot da %
    })
```

---

**Data de Criação:** 03/02/2026  
**Última Atualização:** 03/02/2026  
**Versão:** 1.0  
**Autor:** Igor Ayres
