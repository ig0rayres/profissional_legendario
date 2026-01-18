-- Migration: Criar tabela de Pistas (Localizações)
-- Data: 2026-01-18

-- Tabela de Pistas/Localizações
CREATE TABLE IF NOT EXISTS public.pistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,              -- Nome completo (ex: "São Paulo, SP")
    city TEXT NOT NULL,               -- Cidade
    state TEXT NOT NULL,              -- Estado (sigla)
    state_name TEXT,                  -- Estado (nome completo)
    region TEXT,                      -- Região (ex: "Sudeste")
    country TEXT DEFAULT 'Brasil',
    active BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,   -- Contador de membros (para ordenação)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(city, state)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pistas_state ON public.pistas(state);
CREATE INDEX IF NOT EXISTS idx_pistas_active ON public.pistas(active);
CREATE INDEX IF NOT EXISTS idx_pistas_member_count ON public.pistas(member_count DESC);

-- RLS
ALTER TABLE public.pistas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pistas são públicas para leitura" ON public.pistas
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar pistas" ON public.pistas
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas admins podem editar pistas" ON public.pistas
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas admins podem deletar pistas" ON public.pistas
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inserir pistas iniciais (principais cidades)
INSERT INTO public.pistas (name, city, state, state_name, region) VALUES
-- São Paulo
('São Paulo, SP', 'São Paulo', 'SP', 'São Paulo', 'Sudeste'),
('Ribeirão Preto, SP', 'Ribeirão Preto', 'SP', 'São Paulo', 'Sudeste'),
('Campinas, SP', 'Campinas', 'SP', 'São Paulo', 'Sudeste'),
('Santos, SP', 'Santos', 'SP', 'São Paulo', 'Sudeste'),
('São José dos Campos, SP', 'São José dos Campos', 'SP', 'São Paulo', 'Sudeste'),
('Sorocaba, SP', 'Sorocaba', 'SP', 'São Paulo', 'Sudeste'),
-- Rio de Janeiro
('Rio de Janeiro, RJ', 'Rio de Janeiro', 'RJ', 'Rio de Janeiro', 'Sudeste'),
('Niterói, RJ', 'Niterói', 'RJ', 'Rio de Janeiro', 'Sudeste'),
-- Minas Gerais
('Belo Horizonte, MG', 'Belo Horizonte', 'MG', 'Minas Gerais', 'Sudeste'),
('Uberlândia, MG', 'Uberlândia', 'MG', 'Minas Gerais', 'Sudeste'),
-- Sul
('Curitiba, PR', 'Curitiba', 'PR', 'Paraná', 'Sul'),
('Porto Alegre, RS', 'Porto Alegre', 'RS', 'Rio Grande do Sul', 'Sul'),
('Florianópolis, SC', 'Florianópolis', 'SC', 'Santa Catarina', 'Sul'),
-- Nordeste
('Salvador, BA', 'Salvador', 'BA', 'Bahia', 'Nordeste'),
('Recife, PE', 'Recife', 'PE', 'Pernambuco', 'Nordeste'),
('Fortaleza, CE', 'Fortaleza', 'CE', 'Ceará', 'Nordeste'),
-- Centro-Oeste
('Brasília, DF', 'Brasília', 'DF', 'Distrito Federal', 'Centro-Oeste'),
('Goiânia, GO', 'Goiânia', 'GO', 'Goiás', 'Centro-Oeste'),
-- Norte
('Manaus, AM', 'Manaus', 'AM', 'Amazonas', 'Norte'),
('Belém, PA', 'Belém', 'PA', 'Pará', 'Norte')
ON CONFLICT (city, state) DO NOTHING;

-- Adicionar referência de pista ao perfil (se ainda não existir)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pista_id UUID REFERENCES public.pistas(id);

CREATE INDEX IF NOT EXISTS idx_profiles_pista_id ON public.profiles(pista_id);

-- Comentários
COMMENT ON TABLE public.pistas IS 'Localizações/Pistas disponíveis para membros da plataforma';
COMMENT ON COLUMN public.pistas.member_count IS 'Contador de membros nesta pista para ordenação e estatísticas';
