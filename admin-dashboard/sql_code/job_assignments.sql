create table public.job_assignments (
  job_id uuid not null,
  technician_id uuid not null,
  created_at timestamp with time zone not null default now(),
  assigned_at timestamp with time zone not null default now(),
  status text not null default 'assigned'::text,
  notes text null,
  role text not null default 'member'::text,
  constraint job_assignments_pkey primary key (job_id, technician_id),
  constraint job_assignments_job_id_fkey foreign KEY (job_id) references jobs (id) on delete CASCADE,
  constraint job_assignments_technician_id_fkey foreign KEY (technician_id) references profiles (id) on delete RESTRICT,
  constraint job_assignments_role_check check (
    (
      (role = 'lead'::text)
      or (role = 'member'::text)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_job_assignments_technician_id on public.job_assignments using btree (technician_id) TABLESPACE pg_default;

create unique INDEX IF not exists single_lead_per_job on public.job_assignments using btree (job_id) TABLESPACE pg_default
where
  (role = 'lead'::text);