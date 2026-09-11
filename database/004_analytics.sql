begin;
select pg_advisory_xact_lock(hashtext('stilte-en-draad:migrations'));

create table if not exists analytics_daily_routes (
  day date not null,
  path text not null,
  views integer not null default 0 check (views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (day, path)
);

create table if not exists analytics_daily_visitors (
  day date not null,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (day, visitor_hash)
);

create table if not exists analytics_daily_reports (
  day date not null,
  recipient_email text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_id text,
  last_error_code text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  primary key (day, recipient_email)
);

create index if not exists analytics_daily_routes_day_idx on analytics_daily_routes (day, views desc);
create index if not exists analytics_daily_reports_status_idx on analytics_daily_reports (status, day);

insert into schema_migrations (version) values ('004_analytics') on conflict (version) do nothing;
commit;
