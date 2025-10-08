create table public.error_logs (
  id uuid not null default gen_random_uuid (),
  level text not null, -- 'error', 'warning', 'info'
  message text not null,
  stack_trace text null,
  user_id uuid null,
  user_agent text null,
  url text null,
  method text null,
  ip_address text null,
  request_data jsonb null,
  response_data jsonb null,
  timestamp timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  resolved boolean null default false,
  resolved_at timestamp with time zone null,
  resolved_by uuid null,
  notes text null,
  constraint error_logs_pkey primary key (id)
) TABLESPACE pg_default;

-- Indexes for better performance
create index IF not exists idx_error_logs_level on public.error_logs using btree (level) TABLESPACE pg_default;
create index IF not exists idx_error_logs_timestamp on public.error_logs using btree (timestamp desc) TABLESPACE pg_default;
create index IF not exists idx_error_logs_resolved on public.error_logs using btree (resolved) TABLESPACE pg_default;
create index IF not exists idx_error_logs_user_id on public.error_logs using btree (user_id) TABLESPACE pg_default;
