-- Create takedown_requests table
create table public.takedown_requests (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  reporter_email text not null,
  reason text not null,
  description text,
  status text default 'pending' not null check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.takedown_requests enable row level security;

-- Policies
-- Anyone can insert a report (we can leave this fully open since reports don't need authentication)
create policy "Anyone can insert takedown requests" on public.takedown_requests for insert with check (true);

-- Only admins can view reports
create policy "Admins can view takedown requests" on public.takedown_requests for select using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Only admins can update reports
create policy "Admins can update takedown requests" on public.takedown_requests for update using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
