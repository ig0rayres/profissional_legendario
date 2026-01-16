-- Project Requests System Migration

-- Project requests table
create table public.project_requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references auth.users not null,
  professional_id uuid references auth.users not null,
  title text not null,
  description text not null,
  budget_range text,
  deadline date,
  status text check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Project proposals (professionals can counter-propose)
create table public.project_proposals (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.project_requests(id) on delete cascade not null,
  proposed_price numeric not null,
  proposed_deadline date,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.project_requests enable row level security;
alter table public.project_proposals enable row level security;

-- Users can view requests where they are client or professional
create policy "Users can view own requests"
  on project_requests for select
  using (auth.uid() = client_id or auth.uid() = professional_id);

-- Users can create requests as clients
create policy "Users can create requests"
  on project_requests for insert
  with check (auth.uid() = client_id);

-- Clients can update their own requests
create policy "Clients can update own requests"
  on project_requests for update
  using (auth.uid() = client_id);

-- Professionals can update request status
create policy "Professionals can update request status"
  on project_requests for update
  using (auth.uid() = professional_id);

-- Users can view proposals for their requests
create policy "Users can view proposals for their requests"
  on project_proposals for select
  using (
    exists (
      select 1 from project_requests
      where id = request_id and (client_id = auth.uid() or professional_id = auth.uid())
    )
  );

-- Professionals can create proposals for requests to them
create policy "Professionals can create proposals"
  on project_proposals for insert
  with check (
    exists (
      select 1 from project_requests
      where id = request_id and professional_id = auth.uid()
    )
  );

-- Professionals can update their own proposals
create policy "Professionals can update own proposals"
  on project_proposals for update
  using (
    exists (
      select 1 from project_requests
      where id = request_id and professional_id = auth.uid()
    )
  );
