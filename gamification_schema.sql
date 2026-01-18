-- ============================================================
-- Rota do Valente - Gamification System Migration
-- ============================================================
-- 
-- ⚠️ ATENÇÃO: VERSÃO DESATUALIZADA!
-- 
-- Este arquivo é o schema ORIGINAL. O multiplicador de XP agora
-- é determinado SOMENTE pelo PLANO DE ASSINATURA:
--   - Recruta: 1.0x
--   - Veterano: 1.5x
--   - Elite: 3.0x
-- 
-- O campo "multiplier" na tabela ranks NÃO é mais utilizado.
-- Para o schema atualizado, consulte:
-- - docs/GAMIFICATION_TECHNICAL.md
-- - docs/GAMIFICATION_MONTHLY_SYSTEM.md
-- ============================================================

-- 1. Ranks Definition
create table public.ranks (
    id text primary key,
    name text not null,
    min_xp integer not null,
    max_xp integer,
    multiplier numeric(3,2) default 1.00,
    display_order integer not null
);

insert into public.ranks (id, name, min_xp, max_xp, multiplier, display_order) values
('recruta', 'Recruta', 0, 199, 1.00, 1),
('especialista', 'Especialista', 200, 499, 1.00, 2),
('veterano', 'Veterano', 500, 999, 1.00, 3),
('comandante', 'Comandante', 1000, 1999, 1.50, 4),
('general', 'General', 2000, 3499, 2.00, 5),
('lenda', 'Lenda', 3500, null, 3.00, 6);

-- 2. User Gamification Stats
create table public.gamification_stats (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    total_xp integer default 0 not null,
    current_rank_id text references public.ranks(id) default 'recruta',
    season_xp integer default 0 not null,
    daily_xp_count integer default 0 not null,
    last_xp_date date default current_date,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. XP Logs for Audit
create table public.xp_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    amount integer not null,
    base_amount integer not null,
    action_type text not null,
    description text,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Badges Definition
create table public.badges (
    id text primary key,
    name text not null,
    description text not null,
    xp_reward integer not null,
    criteria_type text not null,
    benefit_description text,
    icon_key text,
    is_active boolean default true
);

insert into public.badges (id, name, description, xp_reward, criteria_type, benefit_description, icon_key) values
('alistamento_concluido', 'Alistamento Concluído', 'Completar 100% do perfil', 100, 'profile_completion', 'Desbloqueia aparição em buscas', 'shield-check'),
('primeiro_sangue', 'Primeiro Sangue', 'Primeira venda/contrato fechado', 50, 'first_contract', 'Selo "Profissional Ativo"', 'droplet'),
('batismo_excelencia', 'Batismo de Excelência', 'Primeira avaliação 5 estrelas', 80, 'first_five_star', 'Tag "Altamente Recomendado" por 7 dias', 'star'),
('cinegrafista_campo', 'Cinegrafista de Campo', 'Primeiro upload de relatório/foto', 30, 'first_report', 'Desbloqueia aba "Portfólio"', 'camera'),
('missao_cumprida', 'Missão Cumprida', 'Marcar 1º serviço como concluído (com confirmação)', 100, 'first_service_done', 'Boost de prioridade nas buscas por 48h', 'check-circle'),
('inabalavel', 'Inabalável', 'Manter média 5★ após 5 trabalhos avaliados', 150, 'five_star_streak', 'Selo "Padrão Ouro"', 'award'),
('irmandade', 'Irmandade', 'Contratar outro membro do Club', 75, 'peer_hire', 'Badge "Membro da Confraria"', 'users'),
('pronto_missao', 'Pronto para a Missão', 'Responder 5 demandas em <2h', 50, 'fast_response_streak', 'Tag "Resposta Rápida" por 7 dias', 'clock'),
('recrutador', 'Recrutador', 'Indicar 3 novos membros (cadastro completo)', 150, 'referral_streak', 'Desconto de 10% na próxima mensalidade', 'user-plus'),
('veterano_guerra', 'Veterano de Guerra', 'Completar 20 serviços', 300, 'services_count', 'Acesso ao fórum exclusivo de estratégias', 'medal'),
('sentinela_elite', 'Sentinela de Elite', 'Manter Plano Elite por 3 meses consecutivos', 500, 'premium_loyalty', 'Convite ao grupo de líderes', 'crown');

-- 5. User Badges
create table public.user_badges (
    user_id uuid references public.profiles(id) on delete cascade not null,
    badge_id text references public.badges(id) on delete cascade not null,
    earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, badge_id)
);

-- 6. Seasons and Challenges
create table public.seasons (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    start_date date not null,
    end_date date not null,
    is_active boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.challenges (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    xp_reward integer not null,
    badge_id text references public.badges(id),
    target_value integer not null,
    target_type text not null,
    active_from date,
    active_until date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_challenges (
    user_id uuid references public.profiles(id) on delete cascade not null,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    current_value integer default 0 not null,
    completed boolean default false,
    completed_at timestamp with time zone,
    primary key (user_id, challenge_id)
);

-- RLS Policies
alter table public.ranks enable row level security;
alter table public.gamification_stats enable row level security;
alter table public.xp_logs enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.seasons enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;

-- Public read access
create policy "Anyone can view ranks" on ranks for select using (true);
create policy "Anyone can view active badges" on badges for select using (active = true);
create policy "Anyone can view seasons" on seasons for select using (true);

-- User specific access
create policy "Users can view own stats" on gamification_stats for select using (auth.uid() = user_id);
create policy "Users can view own xp logs" on xp_logs for select using (auth.uid() = user_id);
create policy "Users can view own badges" on user_badges for select using (auth.uid() = user_id);
create policy "Users can view own challenges" on user_challenges for select using (auth.uid() = user_id);

-- 7. Functions & Logic Engine

-- Function to calculate and add XP
create or replace function public.add_user_xp(
    p_user_id uuid,
    p_base_amount integer,
    p_action_type text,
    p_description text default null,
    p_metadata jsonb default '{}'
)
returns integer
language plpgsql
security definer
as $$
declare
    v_plan_multiplier numeric(3,2) := 1.00;
    v_rank_multiplier numeric(3,2) := 1.00;
    v_final_amount integer;
    v_daily_cap integer := 500;
    v_today date := current_date;
    v_stats record;
    v_plan_slug text;
begin
    -- 1. Initialize stats if not exist
    insert into public.gamification_stats (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select * into v_stats from public.gamification_stats where user_id = p_user_id;

    -- 2. Reset daily count if date changed
    if v_stats.last_xp_date < v_today then
        v_stats.daily_xp_count := 0;
        update public.gamification_stats 
        set daily_xp_count = 0, last_xp_date = v_today 
        where user_id = p_user_id;
    end if;

    -- 3. Get Plan Multiplier
    -- Join with subscriptions and plans. Assumes table 'subscriptions' and 'plans' exist as per database.ts
    select p.slug into v_plan_slug
    from public.subscriptions s
    join public.plans p on s.plan_id = p.id
    where s.user_id = p_user_id and s.status = 'active'
    order by s.created_at desc limit 1;

    if v_plan_slug = 'professional' then v_plan_multiplier := 1.50;
    elsif v_plan_slug = 'elite' then v_plan_multiplier := 2.00;
    else v_plan_multiplier := 1.00;
    end if;

    -- 4. Get Rank Multiplier
    select multiplier into v_rank_multiplier 
    from public.ranks 
    where id = v_stats.current_rank_id;

    -- 5. Calculate Final XP
    v_final_amount := floor(p_base_amount * v_plan_multiplier * v_rank_multiplier);

    -- 6. Apply Daily Cap (Anti-fraud)
    -- Only for repeatable actions (can define which actions are capped)
    -- For now, let's say all actions are capped except "Contract", "Service", "Badges"
    if p_action_type not in ('contract_closed', 'service_completed', 'badge_reward', 'challenge_completed') then
        if v_stats.daily_xp_count + v_final_amount > v_daily_cap then
            v_final_amount := v_daily_cap - v_stats.daily_xp_count;
            if v_final_amount < 0 then v_final_amount := 0; end if;
        end if;
    end if;

    if v_final_amount <= 0 then
        return 0;
    end if;

    -- 7. Update Stats
    update public.gamification_stats
    set 
        total_xp = total_xp + v_final_amount,
        season_xp = season_xp + v_final_amount,
        daily_xp_count = daily_xp_count + v_final_amount,
        updated_at = now()
    where user_id = p_user_id;

    -- 8. Log Transaction
    insert into public.xp_logs (user_id, amount, base_amount, action_type, description, metadata)
    values (p_user_id, v_final_amount, p_base_amount, p_action_type, p_description, p_metadata);

    -- 9. Check for Rank Up
    perform public.check_rank_up(p_user_id);

    return v_final_amount;
end;
$$;

-- Function to check and update rank
create or replace function public.check_rank_up(p_user_id uuid)
returns text
language plpgsql
security definer
as $$
declare
    v_total_xp integer;
    v_current_rank text;
    v_new_rank text;
begin
    select total_xp, current_rank_id into v_total_xp, v_current_rank
    from public.gamification_stats
    where user_id = p_user_id;

    select id into v_new_rank
    from public.ranks
    where v_total_xp >= min_xp
    order by min_xp desc
    limit 1;

    if v_new_rank <> v_current_rank then
        update public.gamification_stats
        set current_rank_id = v_new_rank
        where user_id = p_user_id;
        
        -- Logic to notify or log rank up can be added here
        return v_new_rank;
    end if;

    return v_current_rank;
end;
$$;

-- 8. Auto-initialize stats on profile creation
create or replace function public.handle_new_gamification_profile()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.gamification_stats (user_id)
    values (new.id);
    return new;
end;
$$;

create trigger on_profile_created_gamification
    after insert on public.profiles
    for each row execute procedure public.handle_new_gamification_profile();
