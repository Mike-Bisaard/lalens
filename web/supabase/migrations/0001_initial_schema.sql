-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SHOPS
-- ============================================================
create table shops (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  slug            text not null unique,
  description     text,
  avatar_url      text,
  -- Bank account stored encrypted, never displayed raw
  bank_account_encrypted text not null,
  bank_name       text not null,
  created_at      timestamptz default now() not null
);

create index idx_shops_slug on shops(slug);
create index idx_shops_owner on shops(owner_id);

-- ============================================================
-- BATCH UPLOADS
-- ============================================================
create table batch_uploads (
  id                  uuid primary key default uuid_generate_v4(),
  shop_id             uuid references shops(id) on delete cascade not null,
  original_image_url  text not null,
  caption             text,
  is_active           boolean default true not null,
  created_at          timestamptz default now() not null
);

create index idx_batches_shop on batch_uploads(shop_id);

-- ============================================================
-- CARDS
-- ============================================================
create type card_condition as enum ('NM', 'LP', 'MP', 'HP', 'DMG');
create type card_status as enum ('available', 'reserved', 'sold', 'removed');

create table cards (
  id          uuid primary key default uuid_generate_v4(),
  batch_id    uuid references batch_uploads(id) on delete cascade not null,
  shop_id     uuid references shops(id) on delete cascade not null,
  name        text not null default '',
  image_url   text not null,
  crop_coords jsonb,             -- { x, y, w, h } in original image pixels
  price       integer not null,  -- stored in satang (1 THB = 100)
  condition   card_condition not null default 'NM',
  status      card_status not null default 'available',
  sort_order  integer not null default 0,
  created_at  timestamptz default now() not null
);

create index idx_cards_shop on cards(shop_id);
create index idx_cards_batch on cards(batch_id);
create index idx_cards_status on cards(status);

-- ============================================================
-- ORDERS
-- ============================================================
create type order_status as enum (
  'pending_payment', 'verifying', 'paid', 'shipped', 'completed', 'cancelled'
);

create table orders (
  id                  uuid primary key default uuid_generate_v4(),
  shop_id             uuid references shops(id) not null,
  buyer_email         text,
  buyer_user_id       uuid references auth.users(id),
  status              order_status not null default 'pending_payment',
  total_amount        integer not null,   -- satang
  slip_url            text,
  slip_verified_at    timestamptz,
  tracking_number     text,
  reserved_at         timestamptz,
  slip_submitted_at   timestamptz,        -- timer starts here (not verification time)
  expires_at          timestamptz,        -- reserved_at + 10 minutes
  created_at          timestamptz default now() not null
);

create index idx_orders_shop on orders(shop_id);
create index idx_orders_status on orders(status);
create index idx_orders_buyer on orders(buyer_user_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references orders(id) on delete cascade not null,
  card_id         uuid references cards(id) not null,
  price_snapshot  integer not null,   -- price frozen at checkout time (satang)
  created_at      timestamptz default now() not null
);

create index idx_order_items_order on order_items(order_id);
create index idx_order_items_card on order_items(card_id);

-- ============================================================
-- SLIP TRANSACTION LOG (prevent duplicate slip reuse)
-- ============================================================
create table slip_transactions (
  id              uuid primary key default uuid_generate_v4(),
  transaction_ref text not null unique,  -- from slip2go transRef
  order_id        uuid references orders(id) not null,
  amount          integer not null,
  used_at         timestamptz default now() not null
);

create index idx_slip_ref on slip_transactions(transaction_ref);

-- ============================================================
-- BUSINESS RULE FUNCTIONS
-- ============================================================

-- Lock cards to 'reserved' atomically when checkout begins.
-- Returns FALSE if any card is not available (concurrent buy protection).
create or replace function reserve_cards(
  p_card_ids uuid[],
  p_order_id uuid,
  p_expires_at timestamptz
) returns boolean
language plpgsql
as $$
declare
  locked_count int;
begin
  update cards
  set status = 'reserved'
  where id = any(p_card_ids)
    and status = 'available';

  get diagnostics locked_count = row_count;

  if locked_count <> array_length(p_card_ids, 1) then
    -- Rollback partial locks
    update cards
    set status = 'available'
    where id = any(p_card_ids)
      and status = 'reserved';
    return false;
  end if;

  update orders
  set reserved_at = now(), expires_at = p_expires_at
  where id = p_order_id;

  return true;
end;
$$;

-- Release expired reservations (run via cron or on-demand)
create or replace function release_expired_reservations()
returns void
language plpgsql
as $$
begin
  -- Release cards
  update cards
  set status = 'available'
  where status = 'reserved'
    and id in (
      select oi.card_id
      from order_items oi
      join orders o on o.id = oi.order_id
      where o.status = 'pending_payment'
        and o.expires_at < now()
    );

  -- Cancel expired orders
  update orders
  set status = 'cancelled'
  where status = 'pending_payment'
    and expires_at < now();
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table shops enable row level security;
alter table batch_uploads enable row level security;
alter table cards enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Shops: owner can manage, public can read
create policy "shops_public_read" on shops for select using (true);
create policy "shops_owner_all"   on shops for all using (auth.uid() = owner_id);

-- Batch uploads: owner can manage, public can read active
create policy "batches_public_read" on batch_uploads for select using (is_active = true);
create policy "batches_owner_all"   on batch_uploads for all
  using (shop_id in (select id from shops where owner_id = auth.uid()));

-- Cards: public can read available/reserved, owner can manage
create policy "cards_public_read" on cards for select
  using (status in ('available', 'reserved', 'sold'));
create policy "cards_owner_all"   on cards for all
  using (shop_id in (select id from shops where owner_id = auth.uid()));

-- Orders: buyer can read own, shop owner can read their shop's orders
create policy "orders_buyer_read" on orders for select
  using (buyer_user_id = auth.uid() or
         shop_id in (select id from shops where owner_id = auth.uid()));
create policy "orders_insert_anon" on orders for insert with check (true);

-- Order items: follow order access
create policy "order_items_read" on order_items for select
  using (order_id in (
    select id from orders
    where buyer_user_id = auth.uid()
       or shop_id in (select id from shops where owner_id = auth.uid())
  ));
