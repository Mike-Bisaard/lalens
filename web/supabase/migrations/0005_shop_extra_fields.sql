-- Add optional contact / address fields to shops
alter table shops add column if not exists phone              text;
alter table shops add column if not exists account_holder_name text;
alter table shops add column if not exists address            text;
