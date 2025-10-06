create table public.checklist (
  id uuid not null default gen_random_uuid (),
  label text not null,
  value text not null,
  quantity integer null default 1,
  unit text null default 'cái'::text,
  notes text null,
  created_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  constraint checklist_pkey primary key (id),
  constraint checklist_value_key unique (value)
) TABLESPACE pg_default;

