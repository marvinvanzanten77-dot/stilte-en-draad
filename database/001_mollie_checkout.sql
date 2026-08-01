begin;
select pg_advisory_xact_lock(hashtext('stilte-en-draad:migrations'));

create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key,
  order_number text not null unique,
  idempotency_key text not null unique,
  kind text not null,
  status text not null,
  status_reason text,
  subtotal_cents integer not null,
  shipping_cents integer not null,
  total_cents integer not null,
  fulfillment text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  address text,
  postal_code text,
  city text,
  country char(2),
  anonymous boolean not null default false,
  message text,
  mollie_payment_id text unique,
  checkout_url text,
  qr_code_url text,
  payment_status_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders add column if not exists status_reason text;
alter table orders add column if not exists payment_status_checked_at timestamptz;
alter table orders drop constraint if exists orders_kind_check;
alter table orders add constraint orders_kind_check check (kind in ('purchase', 'donation'));
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('draft', 'pending', 'paid', 'failed', 'canceled', 'expired', 'refunded', 'payment_review'));
alter table orders drop constraint if exists orders_subtotal_cents_check;
alter table orders add constraint orders_subtotal_cents_check check (subtotal_cents >= 0);
alter table orders drop constraint if exists orders_shipping_cents_check;
alter table orders add constraint orders_shipping_cents_check check (shipping_cents >= 0);
alter table orders drop constraint if exists orders_total_cents_check;
alter table orders add constraint orders_total_cents_check check (total_cents > 0);
alter table orders drop constraint if exists orders_fulfillment_check;
alter table orders add constraint orders_fulfillment_check check (fulfillment in ('shipping', 'pickup', 'none'));

create table if not exists order_items (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id integer not null,
  title text not null,
  unit_price_cents integer not null check (unit_price_cents > 0),
  quantity integer not null default 1 check (quantity = 1),
  unique (order_id, product_id)
);

create table if not exists product_inventory (
  product_id integer primary key,
  stock integer not null default 1 check (stock >= 0),
  reserved_order_id uuid references orders(id),
  reserved_until timestamptz,
  sold_order_id uuid references orders(id),
  sold_at timestamptz
);

alter table product_inventory add column if not exists sold_order_id uuid references orders(id);
alter table product_inventory drop constraint if exists product_inventory_reservation_pair_check;
alter table product_inventory add constraint product_inventory_reservation_pair_check
  check ((reserved_order_id is null) = (reserved_until is null));
alter table product_inventory drop constraint if exists product_inventory_sold_pair_check;
alter table product_inventory add constraint product_inventory_sold_pair_check
  check ((sold_order_id is null) = (sold_at is null));
alter table product_inventory drop constraint if exists product_inventory_not_reserved_and_sold_check;
alter table product_inventory add constraint product_inventory_not_reserved_and_sold_check
  check (not (reserved_order_id is not null and sold_order_id is not null));

create index if not exists product_inventory_reservation_idx on product_inventory (reserved_until) where reserved_until is not null;
create index if not exists product_inventory_sold_order_idx on product_inventory (sold_order_id) where sold_order_id is not null;
create index if not exists orders_payment_idx on orders (mollie_payment_id) where mollie_payment_id is not null;
create index if not exists orders_status_idx on orders (status, updated_at);

create table if not exists order_audit_log (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  reason text,
  actor text not null default 'system',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists order_audit_order_idx on order_audit_log (order_id, created_at);

create table if not exists inventory_audit_log (
  id bigserial primary key,
  product_id integer not null,
  order_id uuid references orders(id) on delete set null,
  event_type text not null check (event_type in ('reserved', 'released', 'sold', 'payment_conflict')),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists inventory_audit_product_idx on inventory_audit_log (product_id, created_at);
create index if not exists inventory_audit_order_idx on inventory_audit_log (order_id, created_at);

create table if not exists email_outbox (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  message_type text not null check (message_type in ('order_received', 'payment_succeeded', 'payment_failed_or_canceled', 'payment_review', 'donation_confirmed')),
  recipient_email text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, message_type)
);
create index if not exists email_outbox_retry_idx on email_outbox (status, next_attempt_at) where status in ('pending', 'failed');

create table if not exists rate_limits (
  key text primary key,
  window_started_at timestamptz not null,
  count integer not null check (count > 0)
);

insert into schema_migrations (version) values ('001_mollie_checkout') on conflict (version) do nothing;
commit;
