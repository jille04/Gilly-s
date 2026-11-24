create table public.gillys_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null default '' check (phone = '' or phone ~ '^09[0-9]{9}$'),
  addresses jsonb not null default '[]'::jsonb
    check (case when jsonb_typeof(addresses) = 'array' then jsonb_array_length(addresses) <= 30 else false end)
);

create table public.gillys_orders (
  id text primary key check (id ~ '^GLY-[0-9]{8}-[A-F0-9]{16}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Pickup Issue', 'Cancelled')),
  status_history jsonb not null default jsonb_build_array(jsonb_build_object('status', 'Pending', 'changedAt', now()))
    check (jsonb_typeof(status_history) = 'array'),
  pickup_confirmation jsonb,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  unique (user_id, request_id)
);
create index gillys_orders_customer_history_idx on public.gillys_orders (user_id, created_at desc, id desc);
create index gillys_orders_recent_idx on public.gillys_orders (created_at desc, id desc);

create table public.gillys_settings (
  id integer primary key check (id = 1),
  tax_treatment text not null check (tax_treatment in ('unconfigured', 'vat-inclusive', 'non-vat'))
);
insert into public.gillys_settings (id, tax_treatment) values (1, 'unconfigured');

alter table public.gillys_profiles enable row level security;
alter table public.gillys_orders enable row level security;
alter table public.gillys_settings enable row level security;

revoke all on table public.gillys_profiles, public.gillys_orders, public.gillys_settings from public, anon, authenticated, service_role;
grant select on public.gillys_profiles, public.gillys_orders to authenticated;
grant select on public.gillys_settings to anon, authenticated;
grant select, insert, update on public.gillys_profiles, public.gillys_orders to service_role;
grant select, update on public.gillys_settings to service_role;

create policy gillys_profile_owned on public.gillys_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy gillys_order_owned on public.gillys_orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy gillys_settings_read on public.gillys_settings
  for select to anon, authenticated using (true);

create function public.gillys_transition_order(
  p_order_id text,
  p_expected_version integer,
  p_next_status text,
  p_actor text,
  p_customer_id uuid default null
) returns setof public.gillys_orders
language sql
security invoker
set search_path = ''
as $$
  update public.gillys_orders
  set status = p_next_status,
      version = version + 1,
      status_history = status_history || jsonb_build_array(
        jsonb_build_object('status', p_next_status, 'changedAt', now(),
          'changedBy', case when p_customer_id is null then p_actor else 'Customer' end)
      ),
      pickup_confirmation = case
        when p_customer_id is not null then jsonb_build_object('received', p_next_status = 'Picked Up', 'confirmedAt', now())
        when status = 'Pickup Issue' then null
        else pickup_confirmation
      end
  where id = p_order_id and version = p_expected_version
    and (
      (p_customer_id is not null and user_id = p_customer_id
        and status = 'Ready for Pickup' and p_next_status in ('Picked Up', 'Pickup Issue'))
      or (p_customer_id is null and (
        (status = 'Pending' and p_next_status in ('Confirmed', 'Cancelled'))
        or (status = 'Confirmed' and p_next_status in ('Preparing', 'Cancelled'))
        or (status in ('Preparing', 'Pickup Issue') and p_next_status = 'Ready for Pickup')
      ))
    )
  returning *;
$$;

revoke all on function public.gillys_transition_order(text, integer, text, text, uuid) from public, anon, authenticated;
grant execute on function public.gillys_transition_order(text, integer, text, text, uuid) to service_role;
