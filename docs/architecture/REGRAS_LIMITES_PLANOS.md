# 🔒 REGRAS DE NEGÓCIO - LIMITES POR PLANO
**Sistema de Controle de Acesso e Limites**

> ⚠️ **ATUALIZADO 2026-01-29:** Planos unificados na tabela `plan_config`.  
> Ver também: [PLANOS_UNIFICADOS.md](./PLANOS_UNIFICADOS.md)

---

## 📊 MATRIZ DE PERMISSÕES POR PLANO:

| Funcionalidade | RECRUTA | VETERANO | ELITE | LENDÁRIO |
|----------------|---------|----------|-------|----------|
| **Preço/mês** | Grátis | R$ 97 | R$ 127 | R$ 247 |
| **Multi. XP** | 1.0x | 1.5x | 3.0x | 5.0x |
| **Convites Confraria/mês** | ❌ 0 | ✅ 4 | ✅ 10 | ✅ ∞ |
| **Responder Confraria** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Elos (Amigos)** | 10 máx | 100 máx | ∞ | ∞ |
| **Anúncios Marketplace** | ❌ 0 | ✅ 2 | ✅ 10 | ✅ ∞ |
| **Enviar Mensagens** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Orar por outros** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Classificar usuários** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |

---

## 🛡️ IMPLEMENTAÇÃO DE CONTROLES:

### 1. **TABELA `plan_tiers` (já existe)**
```sql
-- Verificar se tem os campos de limites:
ALTER TABLE plan_tiers ADD COLUMN IF NOT EXISTS max_confraternities_per_month INT DEFAULT 0;
ALTER TABLE plan_tiers ADD COLUMN IF NOT EXISTS max_connections INT; -- NULL = ilimitado
ALTER TABLE plan_tiers ADD COLUMN IF NOT EXISTS max_marketplace_listings INT DEFAULT 0;

-- Atualizar limites
UPDATE plan_tiers SET 
  max_confraternities_per_month = 0,
  max_connections = 10,
  max_marketplace_listings = 0
WHERE id = 'recruta';

UPDATE plan_tiers SET 
  max_confraternities_per_month = 4,
  max_connections = 100,
  max_marketplace_listings = 2
WHERE id = 'veterano';

UPDATE plan_tiers SET 
  max_confraternities_per_month = 10,
  max_connections = NULL, -- ilimitado
  max_marketplace_listings = 10
WHERE id = 'elite';
```

---

### 2. **FUNCTION: Verificar se pode criar confraria**
```sql
CREATE OR REPLACE FUNCTION can_create_confraternity(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_count_this_month INT;
BEGIN
  -- Buscar plano do usuário
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta'; -- Default
  END IF;
  
  -- Buscar limite do plano
  SELECT max_confraternities_per_month INTO v_max_allowed
  FROM plan_tiers
  WHERE id = v_plan_id;
  
  -- Se limite é 0, não pode criar
  IF v_max_allowed = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Contar confraternities criadas este mês
  SELECT COUNT(*) INTO v_count_this_month
  FROM confraternities
  WHERE created_by = p_user_id
  AND created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Verificar se ainda pode criar
  RETURN v_count_this_month < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3. **FUNCTION: Verificar se pode adicionar elo**
```sql
CREATE OR REPLACE FUNCTION can_add_connection(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_current_count INT;
BEGIN
  -- Buscar plano
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta';
  END IF;
  
  -- Buscar limite
  SELECT max_connections INTO v_max_allowed
  FROM plan_tiers
  WHERE id = v_plan_id;
  
  -- NULL = ilimitado
  IF v_max_allowed IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Contar elos aceitos
  SELECT COUNT(*) INTO v_current_count
  FROM user_connections
  WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
  AND status = 'accepted';
  
  RETURN v_current_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 4. **FUNCTION: Verificar se pode criar anúncio**
```sql
CREATE OR REPLACE FUNCTION can_create_marketplace_listing(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_max_allowed INT;
  v_active_count INT;
BEGIN
  -- Buscar plano
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta';
  END IF;
  
  -- Buscar limite
  SELECT max_marketplace_listings INTO v_max_allowed
  FROM plan_tiers
  WHERE id = v_plan_id;
  
  IF v_max_allowed = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Contar anúncios ativos
  SELECT COUNT(*) INTO v_active_count
  FROM marketplace_listings
  WHERE seller_id = p_user_id
  AND status = 'active';
  
  RETURN v_active_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 5. **FUNCTION: Obter limites do usuário**
```sql
CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_plan_id TEXT;
  v_result JSON;
BEGIN
  -- Buscar plano
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := 'recruta';
  END IF;
  
  -- Buscar limites e uso atual
  SELECT json_build_object(
    'plan_id', v_plan_id,
    'plan_name', pt.name,
    'confraternities', json_build_object(
      'max', pt.max_confraternities_per_month,
      'used', (
        SELECT COUNT(*)
        FROM confraternities
        WHERE created_by = p_user_id
        AND created_at >= date_trunc('month', CURRENT_DATE)
      ),
      'can_create', can_create_confraternity(p_user_id)
    ),
    'connections', json_build_object(
      'max', pt.max_connections,
      'used', (
        SELECT COUNT(*)
        FROM user_connections
        WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
        AND status = 'accepted'
      ),
      'can_add', can_add_connection(p_user_id)
    ),
    'marketplace', json_build_object(
      'max', pt.max_marketplace_listings,
      'used', (
        SELECT COUNT(*)
        FROM marketplace_listings
        WHERE seller_id = p_user_id
        AND status = 'active'
      ),
      'can_create', can_create_marketplace_listing(p_user_id)
    )
  ) INTO v_result
  FROM plan_tiers pt
  WHERE pt.id = v_plan_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎨 IMPLEMENTAÇÃO NA UI:

### **Exemplo: Botão "Solicitar Confraria"**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export function ConfraternityButton({ targetUserId }: { targetUserId: string }) {
  const [canCreate, setCanCreate] = useState(false)
  const [limits, setLimits] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => {
    checkLimits()
  }, [])
  
  async function checkLimits() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase.rpc('get_user_limits', {
      p_user_id: user.id
    })
    
    setLimits(data)
    setCanCreate(data?.confraternities?.can_create || false)
    setLoading(false)
  }
  
  if (loading) return <Button disabled>Carregando...</Button>
  
  return (
    <div>
      <Button 
        disabled={!canCreate}
        onClick={() => {/* abrir modal de confraria */}}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Solicitar Confraria
      </Button>
      
      {!canCreate && limits && (
        <p className="text-xs text-destructive mt-1">
          Limite atingido: {limits.confraternities.used}/{limits.confraternities.max} este mês
          {limits.plan_id === 'recruta' && ' - Faça upgrade para criar convites'}
        </p>
      )}
    </div>
  )
}
```

---

## 🔐 RLS POLICIES:

```sql
-- Apenas usuários com permissão podem criar confrarias
CREATE POLICY "Users can create confraternities if within plan limits"
ON confraternities FOR INSERT
WITH CHECK (
  auth.uid() = created_by 
  AND can_create_confraternity(auth.uid())
);

-- Apenas usuários com permissão podem adicionar elos
CREATE POLICY "Users can add connections if within plan limits"
ON user_connections FOR INSERT
WITH CHECK (
  auth.uid() = requester_id 
  AND can_add_connection(auth.uid())
);

-- Apenas usuários com permissão podem criar anúncios
CREATE POLICY "Users can create listings if within plan limits"
ON marketplace_listings FOR INSERT
WITH CHECK (
  auth.uid() = seller_id 
  AND can_create_marketplace_listing(auth.uid())
);
```

---

## 📊 DASHBOARD DE LIMITES (Admin):

```tsx
// Ver uso de limites de todos os usuários
const { data } = await supabase
  .rpc('get_all_users_limits')
  
// Mostra quem está perto do limite
// Mostra quem precisa upgrade
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO:

- [ ] Adicionar colunas de limites em `plan_tiers`
- [ ] Criar functions de verificação
- [ ] Criar RLS policies
- [ ] Implementar UI com verificações
- [ ] Mostrar limites no perfil do usuário
- [ ] Mensagens de erro claras quando atingir limite
- [ ] Botão de upgrade visível quando bloqueado

---

**TUDO FUNCIONAL E RESPEITANDO LIMITES!** 🚀
