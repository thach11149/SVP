create table public.jobs (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  job_description text null,
  status text null default 'Mới tạo'::text,
  scheduled_date date not null,
  scheduled_time time without time zone null,
  start_time time without time zone null,
  end_time time without time zone null,
  job_content text null,
  service_content text null,
  notes text null,
  checklist jsonb null default '[]'::jsonb,
  completed boolean not null default false,
  contact_person text null,
  contact_phone text null,
  special_requests text null,
  team_size integer null default 1,
  is_deleted boolean null default false,
  delete_note text null,
  plan_id uuid not null,
  constraint jobs_new_pkey primary key (id),
  constraint jobs_new_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint jobs_plan_id_fkey foreign KEY (plan_id) references customer_sites_plans (id) on delete CASCADE,
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

create index IF not exists idx_jobs_new_scheduled_date on public.jobs using btree (scheduled_date) TABLESPACE pg_default;

create index IF not exists idx_jobs_new_status on public.jobs using btree (status) TABLESPACE pg_default;

create index IF not exists idx_jobs_new_is_deleted on public.jobs using btree (is_deleted) TABLESPACE pg_default;

create trigger update_jobs_new_updated_at BEFORE
update on jobs for EACH row
execute FUNCTION update_updated_at_column ();