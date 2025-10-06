create table public.materials (
  id uuid not null default gen_random_uuid (),
  name text not null,
  unit text not null default 'lít'::text,
  category text null default 'hóa chất'::text,
  notes text null,
  active boolean not null default true,
  created_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  constraint materials_pkey primary key (id),
  constraint materials_name_key unique (name)
) TABLESPACE pg_default;