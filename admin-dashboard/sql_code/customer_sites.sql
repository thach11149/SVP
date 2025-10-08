create table public.customer_sites (
  id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  site_name text not null,
  google_map_code text null,
  address text null,
  ward smallint null,
  district smallint null,
  province smallint null,
  ward_name text null,
  district_name text null,
  province_name text null,
  site_contact_name text null,
  site_contact_position text null,
  site_contact_phone text null,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint customer_sites_pkey primary key (id),
  constraint customer_sites_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_sites_customer_id on public.customer_sites using btree (customer_id) TABLESPACE pg_default;