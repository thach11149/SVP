create table public.profile_role_permissions (
  role_id uuid not null,
  permission_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint profile_role_permissions_pkey primary key (role_id, permission_id),
  constraint profile_role_permissions_permission_id_fkey foreign KEY (permission_id) references permissions (id) on delete CASCADE,
  constraint profile_role_permissions_role_id_fkey foreign KEY (role_id) references profile_roles (id) on delete CASCADE
) TABLESPACE pg_default;