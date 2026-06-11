-- Enable pg_cron extension (requires superuser — available on Supabase Pro+)
create extension if not exists pg_cron;

-- Schedule release_expired_reservations() every minute
select cron.schedule(
  'release-expired-reservations',
  '* * * * *',
  $$ select release_expired_reservations(); $$
);
