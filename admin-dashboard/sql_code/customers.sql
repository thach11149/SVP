create table public.customers (
  id uuid not null default gen_random_uuid (),
  customer_code text not null,
  customer_type text not null,
  name text not null,
  tax_code text null,
  primary_contact_name text not null,
  primary_contact_phone text not null,
  primary_contact_email text not null,
  primary_contact_position text null,
  notes text null,
  created_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  constraint customers_pkey primary key (id),
  constraint customers_customer_code_key unique (customer_code)
) TABLESPACE pg_default;