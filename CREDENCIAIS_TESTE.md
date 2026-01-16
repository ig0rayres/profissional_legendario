# 🔐 CREDENCIAIS DE TESTE

## 👑 ADMIN
```
Email: admin@rotaclub.com
Senha: Admin@2024
Acesso: http://localhost:3000/admin
```

## 👤 USUÁRIO NORMAL (Criar abaixo)
```
Email: usuario@teste.com
Senha: Teste@2024
Acesso: http://localhost:3000/dashboard
```

---

## 📝 COMO TESTAR:

### 1. Teste com ADMIN:
- Limpe o cache do navegador (`Ctrl+Shift+Delete`)
- Vá para: http://localhost:3000/auth/login
- Entre com: `admin@rotaclub.com` / `Admin@2024`
- Deve ver menu "Admin" no topo
- Acesse: http://localhost:3000/admin

### 2. Teste com USUÁRIO NORMAL:
- Faça logout
- Registre-se em: http://localhost:3000/auth/register
- Use: `usuario@teste.com` / `Teste@2024`
- CPF: `12345678909`
- Escolha uma unidade
- Após registrar, você NÃO deve ver o menu "Admin"
- Só deve acessar: http://localhost:3000/dashboard

---

## 🛠️ CRIAR USUÁRIO TESTE NO BANCO (Opcional):

Se quiser criar direto no banco, execute no Supabase:

```sql
-- Execute o script CRIAR_USUARIO_TESTE.sql que vou criar abaixo
```
