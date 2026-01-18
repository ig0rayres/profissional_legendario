-- PERMITIR VISUALIZAÇÃO PÚBLICA DE ELOS (CONEXÕES) ACEITOS no perfil de outros usuários
-- Atualmente pode estar restrito apenas ao próprio usuário

-- Política para user_connections
DROP POLICY IF EXISTS "Public view accepted connections" ON user_connections;
CREATE POLICY "Public view accepted connections"
ON user_connections FOR SELECT
USING (status = 'accepted');

-- Política para confraternity_invites (apenas aceitas e futuras, ou histórico aceito)
-- Permitir ver confrarias aceitas para mostrar no perfil público
DROP POLICY IF EXISTS "Public view accepted confraternities" ON confraternity_invites;
CREATE POLICY "Public view accepted confraternities"
ON confraternity_invites FOR SELECT
USING (status = 'accepted');

-- Política para user_gamification (já deve ser pública, mas reforçando)
DROP POLICY IF EXISTS "Public view gamification" ON user_gamification;
CREATE POLICY "Public view gamification"
ON user_gamification FOR SELECT
USING (true);

-- Política para user_medals (já deve ser pública, mas reforçando)
DROP POLICY IF EXISTS "Public view user medals" ON user_medals;
CREATE POLICY "Public view user medals"
ON user_medals FOR SELECT
USING (true);
