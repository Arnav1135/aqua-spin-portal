-- 1. Helper function: is_admin()
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Helper function: get_my_developer_id()
create or replace function get_my_developer_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select id from developers
  where profile_id = auth.uid()
  limit 1;
$$;

-- Enable RLS everywhere
alter table profiles enable row level security;
alter table developers enable row level security;
alter table games enable row level security;
alter table game_submissions enable row level security;
alter table analytics_events enable row level security;
alter table takedown_requests enable row level security;

-- PROFILES Policies
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select using (is_admin());
create policy "Admins can update all profiles" on profiles for update using (is_admin());
create policy "Admins can insert profiles" on profiles for insert with check (is_admin());

-- DEVELOPERS Policies
create policy "Developers can read own row" on developers for select using (profile_id = auth.uid());
create policy "Developers can update own row" on developers for update using (profile_id = auth.uid());
create policy "Admins can read all developers" on developers for select using (is_admin());
create policy "Admins can update all developers" on developers for update using (is_admin());
create policy "Admins can insert developers" on developers for insert with check (is_admin());

-- GAMES Policies
-- Public can read approved games
create policy "Public can read approved games" on games for select using (status = 'approved');
-- Admins can read all games
create policy "Admins can read all games" on games for select using (is_admin());
-- Developers can read their own games regardless of status
create policy "Developers can read own games" on games for select using (developer_id = get_my_developer_id());
-- Developers can insert games
create policy "Developers can insert games" on games for insert with check (developer_id = get_my_developer_id());
-- Developers can update their own games
create policy "Developers can update own games" on games for update using (developer_id = get_my_developer_id());
-- Admins can update any game
create policy "Admins can update any game" on games for update using (is_admin());

-- GAME SUBMISSIONS Policies
create policy "Developers can read own game submissions" on game_submissions for select 
using (
  game_id in (select id from games where developer_id = get_my_developer_id())
);
create policy "Admins can read all submissions" on game_submissions for select using (is_admin());
create policy "Admins can insert submissions" on game_submissions for insert with check (is_admin());
create policy "Admins can update submissions" on game_submissions for update using (is_admin());

-- ANALYTICS EVENTS Policies
-- Append only for public/authenticated users (events are generated client-side)
create policy "Anyone can insert analytics" on analytics_events for insert with check (true);
-- Nobody can read raw analytics directly (we'll use a SECURITY DEFINER view/rpc in Phase 5)

-- TAKEDOWN REQUESTS Policies
-- Anyone can submit a claim
create policy "Anyone can submit takedown" on takedown_requests for insert with check (true);
-- Only admins can read/update
create policy "Admins can read takedowns" on takedown_requests for select using (is_admin());
create policy "Admins can update takedowns" on takedown_requests for update using (is_admin());

-- Trigger to prevent Developers from modifying game status directly
create or replace function prevent_status_tampering()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If status changed, and the user is NOT an admin...
  if NEW.status is distinct from OLD.status and not is_admin() then
    -- Developers can only change status back to 'pending_review' (e.g. if they edit their game)
    -- They cannot set it to 'approved' or 'delisted' themselves.
    if NEW.status = 'pending_review' then
      return NEW;
    else
      raise exception 'Unauthorized: Only admins can transition game status to %', NEW.status;
    end if;
  end if;
  return NEW;
end;
$$;

create trigger enforce_game_status_rules
before update on games
for each row
execute function prevent_status_tampering();
