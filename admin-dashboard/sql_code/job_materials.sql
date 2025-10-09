create table public.job_materials (
  job_id uuid not null,
  material_id uuid not null,
  required_quantity numeric(10, 2) not null default 0,
  actual_quantity numeric(10, 2) not null default 0,
  notes text null,
  created_at timestamp with time zone not null default now(),
  constraint job_materials_pkey primary key (job_id, material_id),
  constraint job_materials_job_id_fkey foreign KEY (job_id) references jobs (id) on delete CASCADE,
  constraint job_materials_material_id_fkey foreign KEY (material_id) references materials (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists job_materials_material_id_idx on public.job_materials using btree (material_id) TABLESPACE pg_default;