-- Create a generic trigger function for updating 'updated_at'
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Attach the trigger to the games table
create trigger set_updated_at
before update on games
for each row
execute function update_updated_at_column();
