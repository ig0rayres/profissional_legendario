-- ============================================
-- GAMIFICATION SYSTEM - COMPLETE DEPLOYMENT
-- Execute this in Supabase SQL Editor
-- ============================================

-- Part 1: Schema (from gamification_schema.sql - lines 1-273)
-- Part 2: Triggers (from gamification_triggers.sql - lines 1-174)

-- This combines both files for easy deployment
-- Total: ~450 lines

-- ====== PART 1: BASE SCHEMA ======

-- 1. Ranks Definition
create table if not exists public.ranks (
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
('lenda', 'Lenda', 3500, null, 3.00, 6)
on conflict (id) do nothing;

-- 2. User Gamification Stats
create table if not exists public.gamification_stats (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    total_xp integer default 0 not null,
    current_rank_id text references public.ranks(id) default 'recruta',
    season_xp integer default 0 not null,
    daily_xp_count integer default 0 not null,
    last_xp_date date default current_date,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. XP Logs for Audit
create table if not exists public.xp_logs (
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
create table if not exists public.badges (
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
('alistamento_concluido', 'Alistamento Concluído', 'Completar 100% do perfil', 100, 'profile_completion', 'Desbloqueia aparição em buscas', 'user-check'),
('primeiro_sangue', 'Primeiro Sangue', 'Primeira venda/contrato fechado', 50, 'first_contract', 'Selo "Profissional Ativo"', 'sword'),
('batismo_excelencia', 'Batismo de Excelência', 'Primeira avaliação 5 estrelas', 80, 'first_five_star', 'Tag "Altamente Recomendado" por 7 dias', 'sparkles'),
('cinegrafista_campo', 'Cinegrafista de Campo', 'Primeiro upload de relatório/foto', 30, 'first_report', 'Desbloqueia aba "Portfólio"', 'video'),
('missao_cumprida', 'Missão Cumprida', 'Marcar 1º serviço como concluído', 100, 'first_service_done', 'Boost de prioridade nas buscas por 48h', 'flag'),
('inabalavel', 'Inabalável', 'Manter média 5★ após 5 trabalhos avaliados', 150, 'five_star_streak', 'Selo "Padrão Ouro"', 'hammer'),
('irmandade', 'Irmandade', 'Contratar outro membro do Club', 75, 'peer_hire', 'Badge "Membro da Confraria"', 'heart-handshake'),
('pronto_missao', 'Pronto para a Missão', 'Responder 5 demandas em <2h', 50, 'fast_response_streak', 'Tag "Resposta Rápida" por 7 dias', 'zap'),
('recrutador', 'Recrutador', 'Indicar 3 novos membros', 150, 'referral_streak', 'Desconto de 10% na mensalidade', 'megaphone'),
('veterano_guerra', 'Veterano de Guerra', 'Completar 20 serviços', 300, 'services_count', 'Acesso ao fórum exclusivo', 'mountain'),
('sentinela_elite', 'Sentinela de Elite', 'Manter Plano Elite por 3 meses', 500, 'premium_loyalty', 'Convite ao grupo de líderes', 'gem'),
('sentinela_inabalavel', 'Sentinela Inabalável', 'Manter-se ativo por 30 dias consecutivos', 200, 'retention_streak', 'Selo "Membro Resiliente"', 'anchor')
on conflict (id) do nothing;

-- 5. User Badges
create table if not exists public.user_badges (
    user_id uuid references public.profiles(id) on delete cascade not null,
    badge_id text references public.badges(id) on delete cascade not null,
    earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, badge_id)
);

-- Create indexes for performance
create index if not exists idx_gamification_stats_user on gamification_stats(user_id);
create index if not exists idx_xp_logs_user on xp_logs(user_id);
create index if not exists idx_xp_logs_created on xp_logs(created_at desc);
create index if not exists idx_user_badges_user on user_badges(user_id);

-- RLS Policies (Row Level Security)
alter table public.ranks enable row level security;
alter table public.gamification_stats enable row level security;
alter table public.xp_logs enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Anyone can view ranks" on ranks;
drop policy if exists "Anyone can view badges" on badges;
drop policy if exists "Users can view own stats" on gamification_stats;
drop policy if exists "Users can view own xp logs" on xp_logs;
drop policy if exists "Users can view own badges" on user_badges;

-- Create policies
create policy "Anyone can view ranks" on ranks for select using (true);
create policy "Anyone can view badges" on badges for select using (is_active = true);
create policy "Users can view own stats" on gamification_stats for select using (auth.uid() = user_id);
create policy "Users can view own xp logs" on xp_logs for select using (auth.uid() = user_id);
create policy "Users can view own badges" on user_badges for select using (auth.uid() = user_id);

-- ====== PART 2: CORE FUNCTIONS ======

-- Function to Add XP (with multipliers and limits)
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

    -- 3. Get Rank Multiplier
    select multiplier into v_rank_multiplier 
    from public.ranks 
    where id = v_stats.current_rank_id;

    -- 4. Calculate Final XP
    v_final_amount := floor(p_base_amount * v_rank_multiplier);

    -- 5. Apply Daily Cap (for repetitive actions only)
    if p_action_type not in ('contract_closed', 'service_completed', 'badge_reward', 'challenge_completed') then
        if v_stats.daily_xp_count + v_final_amount > v_daily_cap then
            v_final_amount := v_daily_cap - v_stats.daily_xp_count;
            if v_final_amount < 0 then v_final_amount := 0; end if;
        end if;
    end if;

    if v_final_amount <= 0 then
        return 0;
    end if;

    -- 6. Update Stats
    update public.gamification_stats
    set 
        total_xp = total_xp + v_final_amount,
        season_xp = season_xp + v_final_amount,
        daily_xp_count = daily_xp_count + v_final_amount,
        updated_at = now()
    where user_id = p_user_id;

    -- 7. Log Transaction
    insert into public.xp_logs (user_id, amount, base_amount, action_type, description, metadata)
    values (p_user_id, v_final_amount, p_base_amount, p_action_type, p_description, p_metadata);

    -- 8. Check for Rank Up
    perform public.check_rank_up(p_user_id);

    return v_final_amount;
end;
$$;

-- Function to Check and Update Rank
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
        
        return v_new_rank;
    end if;

    return v_current_rank;
end;
$$;

-- Function to Award Badge
create or replace function public.award_badge(p_user_id uuid, p_badge_id text)
returns boolean
language plpgsql
security definer
as $$
declare
    v_xp_reward integer;
    v_badge_name text;
begin
    -- Check if user already has badge
    if exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = p_badge_id) then
        return false;
    end if;

    -- Get Badge Info
    select xp_reward, name into v_xp_reward, v_badge_name 
    from public.badges 
    where id = p_badge_id;

    if not found then return false; end if;

    -- Insert badge
    insert into public.user_badges (user_id, badge_id) 
    values (p_user_id, p_badge_id)
    on conflict do nothing;

    -- Award XP via engine
    perform public.add_user_xp(
        p_user_id, 
        v_xp_reward, 
        'badge_reward', 
        'Conquista desbloqueada: ' || v_badge_name,
        jsonb_build_object('badge_id', p_badge_id)
    );

    return true;
end;
$$;

-- ====== PART 3: AUTOMATIC TRIGGERS ======

-- Trigger: Profile Completion
create or replace function public.check_profile_completion_reward()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Check if basic required fields are filled
    -- Adjust these fields based on your actual profiles table structure
    if new.full_name is not null 
       and new.phone is not null 
       and new.avatar_url is not null
    then
        perform public.award_badge(new.id, 'alistamento_concluido');
    end if;
    return new;
end;
$$;

drop trigger if exists on_profile_update_gamification on public.profiles;
create trigger on_profile_update_gamification
    after update of full_name, phone, avatar_url on public.profiles
    for each row execute procedure public.check_profile_completion_reward();

-- Success message
do $$
begin
    raise notice '✅ Gamification system deployed successfully!';
    raise notice '📊 Tables created: ranks, badges, gamification_stats, xp_logs, user_badges';
    raise notice '⚡ Functions created: add_user_xp, check_rank_up, award_badge';
    raise notice '🎯 Triggers created: profile_completion';
    raise notice '';
    raise notice 'Next steps:';
    raise notice '1. Test by updating a user profile';
    raise notice '2. Check gamification_stats table for XP';
    raise notice '3. Verify admin panel shows real data';
end $$;
