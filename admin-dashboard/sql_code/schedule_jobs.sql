create table public.scheduled_jobs (
  id uuid not null default gen_random_uuid (),
  customer_id uuid null,
  customer_name text not null,
  scheduled_date date not null,
  status text null default 'unassigned'::text,
  assigned_technicians jsonb null default '[]'::jsonb,
  start_time time without time zone null,
  end_time time without time zone null,
  is_deleted boolean null default false,
  delete_note text null,
  service_content text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  notes text null,
  constraint scheduled_jobs_pkey primary key (id),
  constraint scheduled_jobs_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE,
  constraint scheduled_jobs_status_check check (
    (
      status = any (array['unassigned'::text, 'assigned'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_scheduled_jobs_customer_id on public.scheduled_jobs using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_scheduled_jobs_scheduled_date on public.scheduled_jobs using btree (scheduled_date) TABLESPACE pg_default;

create index IF not exists idx_scheduled_jobs_status on public.scheduled_jobs using btree (status) TABLESPACE pg_default;

create index IF not exists idx_scheduled_jobs_is_deleted on public.scheduled_jobs using btree (is_deleted) TABLESPACE pg_default;

create trigger update_scheduled_jobs_updated_at BEFORE
update on scheduled_jobs for EACH row
execute FUNCTION update_updated_at_column ();