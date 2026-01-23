# 🎮 CHECKLIST DE TESTES MANUAIS - GAMIFICAÇÃO

## 📊 STATUS DAS MEDALHAS

### ✅ IMPLEMENTADAS (podem ser testadas):
Nenhuma ainda! Precisamos implementar os triggers.

### ⚠️ PENDENTES DE IMPLEMENTAÇÃO:
Todas as 16 medalhas precisam de lógica.

---

## 🎯 PLANO DE IMPLEMENTAÇÃO E TESTES

### **FASE 1: Medalhas de Perfil** (PRIORITÁRIO)

#### 1. **Alistamento Concluído** (50 pts)
**Trigger:** Completar perfil (avatar + bio)
**Como testar:**
1. Login com `recruta@rotabusiness.com.br`
2. Ir em "Meu Perfil"
3. Upload de avatar
4. Preencher biografia
5. Salvar
6. ✅ Verificar se ganhou medalha
7. ✅ Verificar se ganhou 50 pontos (x1.0)
8. ✅ Verificar se medalha aparece no perfil

**Implementar:**
- Trigger no UPDATE de profiles
- Checar se avatar_url E bio estão preenchidos
- Chamar award_medal('alistamento_concluido')

---

#### 2. **Primeiro Sangue** (100 pts)
**Trigger:** Primeira venda/contrato fechado
**Como testar:**
1. Login com `veterano@rotabusiness.com.br`
2. Ir em "Projetos" ou "Marketplace"
3. Criar primeiro contrato/venda
4. ✅ Verificar se ganhou medalha
5. ✅ Verificar se ganhou 150 pontos (100 x 1.5)
6. ✅ Verificar se subiu para "Guardião"

**Implementar:**
- Trigger em tabela de contratos/vendas
- Chamar award_medal('primeiro_sangue')

---

#### 3. **Cinegrafista de Campo** (100 pts)
**Trigger:** Upload de foto em evento/atividade
**Como testar:**
1. Login com `elite@rotabusiness.com.br`
2. Ir em uma atividade ou evento
3. Fazer upload de foto
4. ✅ Verificar se ganhou medalha
5. ✅ Verificar se ganhou 300 pontos (100 x 3.0)

**Implementar:**
- Trigger em tabela de uploads/gallery
- Chamar award_medal('cinegrafista_campo')

---

### **FASE 2: Medalhas de Confraria** (após Confraternity)

#### 4. **Anfitrião** (150 pts)
**Trigger:** Agendar primeiro Confraternity
**Como testar:**
1. Login no módulo Confraternity
2. Criar evento
3. ✅ Verificar medalha + pontos

---

#### 5. **Presente** (50 pts)
**Trigger:** Participar de primeiro Confraternity
**Como testar:**
1. Receber convite
2. Aceitar
3. ✅ Verificar medalha + pontos

---

#### 6. **Cronista** (100 pts)
**Trigger:** Upload de foto em Confraternity
**Como testar:**
1. Participar de evento
2. Upload de foto
3. ✅ Verificar medalha + pontos

---

#### 7. **Líder de Confraria** (200 pts)
**Trigger:** Criar 10 Confraternities
**Como testar:**
1. Criar 10 eventos
2. ✅ Verificar medalha + pontos

---

### **FASE 3: Medalhas de Engajamento**

#### 8-16. **Outras medalhas**
Precisam ser definidas com você!

---

## 🔧 IMPLEMENTAÇÃO NECESSÁRIA

### **Arquivo a criar:** `lib/gamification/triggers.ts`

```typescript
// Função para dar medalha após completar perfil
export async function checkProfileCompletion(userId: string, profile: any) {
  if (profile.avatar_url && profile.bio) {
    await awardMedalIfNotEarned(userId, 'alistamento_concluido')
  }
}

// Função para dar medalha após primeira venda
export async function checkFirstSale(userId: string) {
  const { data: sales } = await supabase
    .from('sales')
    .select('id')
    .eq('user_id', userId)
  
  if (sales?.length === 1) {
    await awardMedalIfNotEarned(userId, 'primeiro_sangue')
  }
}

// Helper para não dar medalha duplicada
async function awardMedalIfNotEarned(userId: string, medalId: string) {
  const { data: existing } = await supabase
    .from('user_medals')
    .select('id')
    .eq('user_id', userId)
    .eq('medal_id', medalId)
    .single()
  
  if (!existing) {
    await supabase.rpc('award_medal', { 
      p_user_id: userId, 
      p_medal_id: medalId 
    })
  }
}
```

---

## 📋 PARA COMEÇAR AGORA:

**Qual medalha quer implementar PRIMEIRO?**
1. ✅ Alistamento Concluído (mais fácil)
2. ✅ Primeiro Sangue (precisa módulo de vendas)
3. ✅ Cinegrafista (precisa galeria de fotos)
4. ✅ Medalhas Confraria (já tem módulo!)

**Recomendo começar pelas medalhas de Confraria** porque o módulo já existe!
