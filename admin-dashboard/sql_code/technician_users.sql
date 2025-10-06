create view public.technician_users as
select
  p.id as technician_id,
  p.id as user_id,
  p.tech_code,
  p.name,
  p.email,
  p.phone,
  true as active,
  au.email as auth_email,
  au.raw_user_meta_data ->> 'full_name'::text as full_name
from
  profiles p
  join auth.users au on p.id = au.id
where
  p.role_id = (
    (
      select
        roles.id
      from
        roles
      where
        roles.name = 'technician'::text
    )
  )
  and p.active = true;

  create view public.technician_users as
select
  p.id as technician_id,
  p.id as user_id,
  p.tech_code,
  p.name,
  p.email,
  p.phone,
  true as active,
  au.email as auth_email,
  au.raw_user_meta_data ->> 'full_name'::text as full_name
from
  profiles p
  join auth.users au on p.id = au.id
where
  p.role_id = (
    (
      select
        roles.id
      from
        roles
      where
        roles.name = 'technician'::text
    )
  )
  and p.active = true;