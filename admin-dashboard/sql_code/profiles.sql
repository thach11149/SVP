create table public.profiles (
  id uuid not null,
  name text not null,
  phone text null,
  position text null,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  role_id uuid not null,
  tech_code text null,
  email text not null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_tech_code_key unique (tech_code),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_id_fkey foreign KEY (role_id) references profile_roles (id) on delete RESTRICT
) TABLESPACE pg_default;