-- Add verification_status to profiles
alter table public.profiles 
add column verification_status text check (verification_status in ('pending', 'verified', 'rejected')) default 'pending';

-- Update RLS Policies for Profiles
-- Allow admins to view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Allow admins to update all profiles
create policy "Admins can update all profiles"
  on profiles for update
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Allow admins to view all subscriptions
create policy "Admins can view all subscriptions"
  on subscriptions for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );
