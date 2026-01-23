# 🏗️ ROTA DO VALENTE v2.0 - SCHEMA DE BANCO

*Executar no Supabase SQL Editor*

---

## 1. TABELA DE PROEZAS (Mensais)

```sql
CREATE TABLE IF NOT EXISTS proezas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_base INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    criteria_type TEXT DEFAULT 'manual',
    criteria_value INTEGER DEFAULT 1,
    icon TEXT DEFAULT '🔥',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proezas_category ON proezas(category);
CREATE INDEX IF NOT EXISTS idx_proezas_active ON proezas(is_active);
```

## 2. PROEZAS DO USUÁRIO (Histórico por mês)

```sql
CREATE TABLE IF NOT EXISTS user_proezas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    proeza_id TEXT NOT NULL REFERENCES proezas(id) ON DELETE CASCADE,
    season_month TEXT NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, proeza_id, season_month)
);

CREATE INDEX IF NOT EXISTS idx_user_proezas_user ON user_proezas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_proezas_month ON user_proezas(season_month);
```

## 3. TABELA DE AÇÕES DE PONTOS

```sql
CREATE TABLE IF NOT EXISTS point_actions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_base INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    max_per_day INTEGER DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_actions_category ON point_actions(category);
```

## 4. MISSÕES DIÁRIAS (Configuração)

```sql
CREATE TABLE IF NOT EXISTS daily_missions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_base INTEGER NOT NULL DEFAULT 10,
    category TEXT DEFAULT 'general',
    icon TEXT DEFAULT '✨',
    action_type TEXT,
    is_active BOOLEAN DEFAULT true,
    rotation_weight INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. MISSÕES DIÁRIAS DO USUÁRIO

```sql
CREATE TABLE IF NOT EXISTS user_daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mission_id TEXT NOT NULL REFERENCES daily_missions(id) ON DELETE CASCADE,
    mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    points_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, mission_id, mission_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_missions_user ON user_daily_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_date ON user_daily_missions(mission_date);
```

## 6. ESTATÍSTICAS DA TEMPORADA

```sql
CREATE TABLE IF NOT EXISTS user_season_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    season_month TEXT NOT NULL,
    total_vigor INTEGER DEFAULT 0,
    proezas_earned INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    ranking_position INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, season_month)
);

CREATE INDEX IF NOT EXISTS idx_user_season_stats_user ON user_season_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_stats_month ON user_season_stats(season_month);
```

## 7. LOGIN DIÁRIO (Para streaks)

```sql
CREATE TABLE IF NOT EXISTS user_daily_login (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    login_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, login_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_login_user ON user_daily_login(user_id);
```

## 8. ATUALIZAR TABELA MEDALS

```sql
ALTER TABLE medals ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT true;
ALTER TABLE medals ADD COLUMN IF NOT EXISTS criteria_type TEXT DEFAULT 'manual';
ALTER TABLE medals ADD COLUMN IF NOT EXISTS criteria_value INTEGER DEFAULT 1;
ALTER TABLE medals ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
```

---

## 9. DADOS INICIAIS - PROEZAS (27)

```sql
INSERT INTO proezas (id, name, description, points_base, category, icon, display_order) VALUES
-- Negócios (6)
('primeiro_sangue', 'Primeiro Sangue', '1ª venda/contrato no mês', 50, 'business', '🩸', 1),
('missao_cumprida', 'Missão Cumprida', '1º serviço concluído no mês', 100, 'business', '✅', 2),
('irmandade', 'Irmandade', 'Contratar membro no mês', 75, 'business', '🤝', 3),
('lancador', 'Lançador', '1 projeto lançado', 30, 'business', '🚀', 4),
('empreendedor', 'Empreendedor', '3 projetos lançados', 80, 'business', '💼', 5),
('maquina_negocios', 'Máquina de Negócios', '5 projetos lançados', 150, 'business', '⚡', 6),
-- Conexões (3)
('presente', 'Presente', '1º elo aceito no mês', 50, 'connections', '🎁', 7),
('recrutador', 'Recrutador', 'Indicar 3 membros', 150, 'connections', '📢', 8),
('embaixador', 'Embaixador', 'Indicar 10 membros', 400, 'connections', '🏆', 9),
-- Confrarias (5)
('primeira_confraria', 'Primeira Confraria', '1ª confraria no mês', 50, 'confraternity', '🎉', 10),
('networker_ativo', 'Networker Ativo', '5 confrarias', 100, 'confraternity', '🔥', 11),
('lider_confraria', 'Líder de Confraria', '10 confrarias', 200, 'confraternity', '👑', 12),
('anfitriao', 'Anfitrião', '1+ confraria como anfitrião', 100, 'confraternity', '🏠', 13),
('cronista', 'Cronista', 'Upload foto em confraria', 50, 'confraternity', '📸', 14),
-- Engajamento (5)
('pronto_missao', 'Pronto para Missão', '5 respostas em menos de 2h', 50, 'engagement', '⚡', 15),
('sentinela_inabalavel', 'Sentinela Inabalável', '30 dias ativos', 200, 'engagement', '🛡️', 16),
('sentinela_elite', 'Sentinela de Elite', 'Manter plano Elite', 500, 'engagement', '💎', 17),
('engajado', 'Engajado', '15+ logins no mês', 30, 'engagement', '📱', 18),
('comunicador', 'Comunicador', '5+ mensagens no chat', 30, 'engagement', '💬', 19),
-- Avaliações (3)
('batismo_excelencia', 'Batismo de Excelência', '1ª avaliação 5 estrelas', 80, 'reviews', '⭐', 20),
('colaborador', 'Colaborador', '5 avaliações dadas', 50, 'reviews', '📝', 21),
('avaliador_ativo', 'Avaliador Ativo', '10 avaliações dadas', 100, 'reviews', '🎯', 22),
-- Feed (5)
('cinegrafista', 'Cinegrafista', '1º upload de foto', 30, 'feed', '🎬', 23),
('influenciador', 'Influenciador', '10 posts', 50, 'feed', '📣', 24),
('voz_da_rota', 'Voz da Rota', '50 posts', 150, 'feed', '🎤', 25),
('viral', 'Viral', 'Post com 20+ likes', 100, 'feed', '🔥', 26),
('engajador_feed', 'Engajador', '50 comentários', 80, 'feed', '💭', 27)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    points_base = EXCLUDED.points_base;
```

## 10. DADOS INICIAIS - AÇÕES (17)

```sql
INSERT INTO point_actions (id, name, description, points_base, category, max_per_day) VALUES
('elo_sent', 'Enviar elo', 'Enviar solicitação de conexão', 20, 'connections', 10),
('elo_accepted', 'Aceitar elo', 'Aceitar solicitação de conexão', 30, 'connections', 10),
('confraternity_created', 'Criar confraria', 'Criar nova confraria', 40, 'confraternity', 3),
('confraternity_invite', 'Enviar convite', 'Convidar para confraria', 5, 'confraternity', 20),
('confraternity_accepted', 'Aceitar convite', 'Aceitar convite de confraria', 15, 'confraternity', 5),
('confraternity_host', 'Participar anfitrião', 'Participar como anfitrião', 80, 'confraternity', 3),
('confraternity_guest', 'Participar convidado', 'Participar como convidado', 50, 'confraternity', 5),
('confraternity_photo', 'Upload foto', 'Upload foto de confraria', 25, 'confraternity', 5),
('daily_login', 'Login diário', 'Primeiro login do dia', 5, 'engagement', 1),
('feed_post', 'Publicar post', 'Publicar no feed', 15, 'feed', 5),
('post_like_received', 'Receber like', 'Receber curtida', 2, 'feed', 50),
('post_comment_received', 'Receber comentário', 'Receber comentário', 5, 'feed', 20),
('post_comment_sent', 'Comentar', 'Comentar em post', 5, 'feed', 10),
('portfolio_upload', 'Upload portfolio', 'Upload no portfolio', 20, 'portfolio', 5),
('project_requested', 'Lançar projeto', 'Solicitar orçamento', 100, 'business', 3),
('project_closed', 'Fechar contrato', 'Fechar negócio', 200, 'business', NULL),
('rating_given', 'Dar avaliação', 'Avaliar profissional', 10, 'reviews', 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    points_base = EXCLUDED.points_base;
```

## 11. DADOS INICIAIS - MISSÕES DIÁRIAS (10)

```sql
INSERT INTO daily_missions (id, name, description, points_base, category, icon, rotation_weight) VALUES
('orar', 'Orar por alguém', 'Ore por um membro da comunidade', 10, 'spiritual', '🙏', 2),
('elogiar', 'Fazer um elogio', 'Envie um elogio sincero a alguém', 10, 'social', '💝', 2),
('mensagem', 'Enviar mensagem', 'Envie uma mensagem para um membro', 10, 'social', '💬', 2),
('curtir_posts', 'Curtir 3 posts', 'Curta 3 posts no feed', 10, 'feed', '❤️', 1),
('comentar_post', 'Comentar em post', 'Deixe um comentário construtivo', 10, 'feed', '💭', 1),
('atualizar_status', 'Atualizar status', 'Atualize seu status/disponibilidade', 5, 'profile', '📝', 1),
('visitar_perfis', 'Visitar 5 perfis', 'Explore perfis de outros membros', 10, 'exploration', '👀', 1),
('agradecer', 'Agradecer publicamente', 'Agradeça alguém no feed', 15, 'social', '🎁', 1),
('indicar_membro', 'Indicar membro', 'Indique alguém para o Club', 20, 'referral', '📢', 1),
('compartilhar_trabalho', 'Compartilhar trabalho', 'Poste uma foto de serviço realizado', 15, 'content', '📸', 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    points_base = EXCLUDED.points_base;
```

## 12. MEDALHAS PERMANENTES (11)

```sql
INSERT INTO medals (id, name, description, points_reward, category, icon, is_permanent, display_order) VALUES
('alistamento_concluido', 'Alistamento Concluído', 'Completar 100% do perfil', 100, 'profile', '📋', true, 1),
('veterano_guerra', 'Veterano de Guerra', '20 serviços concluídos total', 300, 'services', '🎖️', true, 2),
('fechador_elite', 'Fechador de Elite', '50 contratos fechados total', 500, 'contracts', '💰', true, 3),
('primeira_venda_mkt', 'Primeira Venda MKT', '1ª venda no marketplace', 50, 'marketplace', '🛒', true, 4),
('vendedor_ativo', 'Vendedor Ativo', '5 vendas no marketplace', 100, 'marketplace', '🏪', true, 5),
('comerciante', 'Comerciante', '10 vendas no marketplace', 200, 'marketplace', '🏢', true, 6),
('mestre_marketplace', 'Mestre do Marketplace', '20 vendas no marketplace', 400, 'marketplace', '👑', true, 7),
('mestre_conexoes', 'Mestre das Conexões', '20 confrarias total', 300, 'confraternity', '🌐', true, 8),
('inabalavel', 'Inabalável', 'Média 5 estrelas após 5 trabalhos', 150, 'quality', '💎', true, 9),
('portfolio_premium', 'Portfólio Premium', '10 fotos no portfólio total', 100, 'portfolio', '🖼️', true, 10),
('veterano_rota', 'Veterano da Rota', '1 ano na plataforma', 300, 'engagement', '🏆', true, 11)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    points_reward = EXCLUDED.points_reward,
    is_permanent = true;
```

---

## RESUMO

| Tabela | Registros |
|--------|-----------|
| proezas | 27 |
| point_actions | 17 |
| daily_missions | 10 |
| medals | 11 |

**TOTAL: 65 itens configuráveis**
