-- Add a generated tsvector column for full-text search
alter table games
add column fts tsvector generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) stored;

-- Create a GIN index to make searches lightning fast
create index idx_games_fts on games using gin(fts);
