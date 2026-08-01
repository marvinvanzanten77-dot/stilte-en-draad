begin;
select pg_advisory_xact_lock(hashtext('stilte-en-draad:migrations'));

create table if not exists withdrawal_requests (
  id uuid primary key,
  request_number text not null unique,
  idempotency_key text not null unique,
  order_id uuid not null references orders(id) on delete restrict,
  customer_email text not null,
  scope text not null check (scope in ('full', 'partial')),
  item_description text,
  status text not null default 'received' check (status in ('received', 'reviewing', 'accepted', 'rejected', 'completed')),
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists withdrawal_order_idx on withdrawal_requests (order_id, received_at);
create index if not exists withdrawal_status_idx on withdrawal_requests (status, received_at);

alter table email_outbox drop constraint if exists email_outbox_message_type_check;
alter table email_outbox add constraint email_outbox_message_type_check check (
  message_type in (
    'order_received',
    'payment_succeeded',
    'payment_failed_or_canceled',
    'payment_review',
    'donation_confirmed',
    'withdrawal_received'
  )
);

insert into schema_migrations (version) values ('002_withdrawals') on conflict (version) do nothing;
commit;
