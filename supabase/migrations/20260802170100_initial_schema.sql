-- profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) primary key,
  role text not null check (role in ('developer','admin')) default 'developer',
  display_name text,
  created_at timestamptz default now()
);

-- developers
create table developers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  studio_name text not null,
  contact_email text not null,
  agreement_signed_at timestamptz,
  agreement_document_url text,
  revenue_share_percent numeric(5,2) check (revenue_share_percent between 0 and 100) 
    default 60.00,
  payout_email text,
  status text not null check (status in ('pending','approved','suspended')) 
    default 'pending',
  created_at timestamptz default now()
);

-- games
create table games (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references developers(id) not null,
  title text not null,
  slug text unique not null,
  description text,
  category text not null,
  tags text[] default '{}',
  thumbnail_url text,
  iframe_url text not null,
  -- enforce https and basic URL sanity at the DB level as a first line of defense
  constraint iframe_url_https check (iframe_url ~ '^https://'),
  orientation text check (orientation in ('landscape','portrait','both')) 
    default 'both',
  platform_support text[] default '{"desktop"}',
  status text not null check (
    status in ('pending_review','approved','rejected','delisted')
  ) default 'pending_review',
  last_verified_at timestamptz,
  last_verification_status text check (
    last_verification_status in ('healthy','broken','blocked_embedding','unknown')
  ) default 'unknown',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_games_status on games(status);
create index idx_games_category on games(category);
create index idx_games_slug on games(slug);

-- game_submissions (audit trail of review decisions)
create table game_submissions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) not null,
  reviewed_by uuid references profiles(id),
  review_status text check (review_status in ('pending','approved','rejected')),
  reviewer_notes text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

-- analytics_events (keep lean, no PII)
create table analytics_events (
  id bigint generated always as identity primary key,
  game_id uuid references games(id) not null,
  event_type text not null check (
    event_type in ('page_view','game_loaded','gameplay_start','gameplay_end','ad_shown')
  ),
  session_id uuid not null,
  occurred_at timestamptz default now()
);

create index idx_analytics_game_time on analytics_events(game_id, occurred_at);

-- takedown_requests (DMCA / IP complaints)
create table takedown_requests (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id),
  requester_name text not null,
  requester_email text not null,
  claim_details text not null,
  status text check (status in ('open','reviewing','resolved','dismissed')) 
    default 'open',
  created_at timestamptz default now()
);
