-- Card waitlist: stores emails to notify when a reserved card becomes available again
create table if not exists card_waitlist (
  id           uuid default gen_random_uuid() primary key,
  card_id      uuid references cards(id) on delete cascade not null,
  email        text not null,
  created_at   timestamptz default now(),
  notified_at  timestamptz,
  constraint card_waitlist_card_email_key unique(card_id, email)
);

-- Public can insert (guest checkout flow), service role manages everything
alter table card_waitlist enable row level security;

create policy "anon and auth can join waitlist"
  on card_waitlist for insert
  to anon, authenticated
  with check (true);

create policy "service role full access"
  on card_waitlist for all
  to service_role
  using (true);

-- Index for fast lookup when sending notifications
create index if not exists card_waitlist_card_id_idx on card_waitlist(card_id) where notified_at is null;
