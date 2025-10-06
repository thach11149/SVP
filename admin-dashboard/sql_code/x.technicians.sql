create table public.technicians (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  tech_code text not null,
  name text not null,
  phone text null,
  email text null,
  position text null,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint technicians_pkey primary key (id),
  constraint technicians_tech_code_key unique (tech_code),
  constraint technicians_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;