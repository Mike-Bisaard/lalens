-- ============================================================
-- Fix 1: GRANT to authenticated, anon, service_role
-- Without these, even valid JWTs get "permission denied for table X"
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

grant select on all tables in schema public to anon;
grant insert on orders, order_items to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ============================================================
-- Fix 2: Make reserve_cards + release SECURITY DEFINER
-- So they run as the function owner (postgres) and can UPDATE cards
-- regardless of the caller's role (needed for guest checkout)
-- ============================================================
alter function reserve_cards(uuid[], uuid, timestamptz) security definer;
alter function release_expired_reservations() security definer;

-- ============================================================
-- Fix 3: INSERT policy for order_items (was missing)
-- ============================================================
create policy "order_items_insert_anon" on order_items
  for insert with check (true);

-- ============================================================
-- Fix 4: INSERT policy for slip_transactions + enable RLS
-- ============================================================
alter table slip_transactions enable row level security;

create policy "slip_transactions_service_only" on slip_transactions
  for all using (true) with check (true);
