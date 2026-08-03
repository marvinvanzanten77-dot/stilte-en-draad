begin;
select pg_advisory_xact_lock(hashtext('stilte-en-draad:migrations'));

alter table orders drop constraint if exists orders_fulfillment_details_check;
alter table orders add constraint orders_fulfillment_details_check check (
  (kind = 'donation' and fulfillment = 'none' and shipping_cents = 0 and address is null and postal_code is null and city is null and country is null)
  or
  (kind = 'purchase' and fulfillment = 'pickup' and shipping_cents = 0 and address is null and postal_code is null and city is null and country is null)
  or
  (kind = 'purchase' and fulfillment = 'shipping' and shipping_cents = 695 and nullif(trim(address), '') is not null and postal_code ~ '^[0-9]{4} [A-Z]{2}$' and nullif(trim(city), '') is not null and country = 'NL')
);

insert into schema_migrations (version) values ('003_fulfillment') on conflict (version) do nothing;
commit;
