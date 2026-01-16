# 🚀 Solução Definitiva: Registro + Promoção a Admin

## Problema
- Trigger `handle_new_user()` está quebrado
- Não temos permissão para desabilitar triggers
- Criação direta via SQL não funciona

## ✅ Solução em 2 Passos Simples

### Passo 1: Registre-se normalmente pelo site
1. Abra http://localhost:3000/auth/register
2. Preencha o formulário com:
   - **Nome Completo**: Administrador
   - **Email**: admin@rotaclub.com
   - **CPF**: 00000000000
   - **Unidade**: (escolha qualquer uma)
   - **Senha**: Admin@2024
   - **Confirmar Senha**: Admin@2024
3. Clique em "Criar Conta"

### Passo 2: Promova a Admin via SQL
Execute no Supabase SQL Editor:
```sql
UPDATE public.profiles 
SET 
    role = 'admin',
    verification_status = 'verified'
WHERE email = 'admin@rotaclub.com';
```

## 🎯 Credenciais Finais
```
Email: admin@rotaclub.com
Senha: Admin@2024
```

## Por que funciona?
- O registro normal pelo site usa a API correta do Supabase
- A API sabe lidar com o trigger quebrado
- Depois só promovemos o usuário criado a admin via SQL

---

## ⚡ Atalho (se o registro falhar)
Se ainda der erro "Database error" ao registrar, execute ESTE script primeiro para consertar o trigger:

```sql
-- Consertar o trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    cpf,
    email,
    role,
    top_id
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'cpf', '00000000000'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'professional'),
    (new.raw_user_meta_data->>'top_id')::uuid
  );
  RETURN new;
END;
$$;
```

Depois tente registrar novamente pelo site.
