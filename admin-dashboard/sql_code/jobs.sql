create table public.jobs (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  customer_id uuid not null,
  customer_name text null,
  created_by uuid null,
  job_description text null,
  status text null default 'Mới tạo'::text,
  scheduled_date date not null,
  scheduled_time time without time zone null,
  start_time time without time zone null default '08:00:00'::time without time zone,
  end_time time without time zone null default '10:00:00'::time without time zone,
  service_type text null,
  job_content text null,
  service_content text null,
  notes text null,
  checklist jsonb null default '[]'::jsonb,
  assigned_technicians jsonb null default '[]'::jsonb,
  completed boolean not null default false,
  contact_person text null,
  contact_phone text null,
  special_requests text null,
  address text null,
  team_lead_id uuid null,
  team_size integer null default 1,
  team_members text null,
  is_deleted boolean null default false,
  delete_note text null,
  constraint jobs_new_pkey primary key (id),
  constraint jobs_new_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint jobs_new_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE,
  constraint jobs_new_status_check check (
    (
      status = any (
        array[
          'Mới tạo'::text,
          'Đã giao'::text,
          'unassigned'::text,
          'assigned'::text,
          'Hoàn thành'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists jobs_new_team_lead_idx on public.jobs using btree (team_lead_id) TABLESPACE pg_default;

create index IF not exists idx_jobs_new_customer_id on public.jobs using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_jobs_new_scheduled_date on public.jobs using btree (scheduled_date) TABLESPACE pg_default;

create index IF not exists idx_jobs_new_status on public.jobs using btree (status) TABLESPACE pg_default;

create index IF not exists idx_jobs_new_is_deleted on public.jobs using btree (is_deleted) TABLESPACE pg_default;

create trigger update_jobs_new_updated_at BEFORE
update on jobs for EACH row
execute FUNCTION update_updated_at_column ();