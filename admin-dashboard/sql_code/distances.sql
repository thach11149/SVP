create table public.distances (
  id uuid not null default gen_random_uuid (),
  diem_di text not null,
  diem_den text not null,
  khoang_cach numeric not null,
  ten_chang text not null,
  created_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  updated_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  constraint distances_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_distances_updated_at BEFORE
update on distances for EACH row
execute FUNCTION update_updated_at_column ();