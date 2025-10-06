create table public.customer_service_plans (
  id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  service_types text[] not null,
  plan text not null,
  days_of_week text[] null,
  frequency text null,
  created_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  updated_at timestamp with time zone null default timezone ('Asia/Ho_Chi_Minh'::text, now()),
  start_date date null,
  end_date date null,
  report_date date null,
  report_frequency text null,
  site_id uuid not null,
  constraint customer_service_plans_pkey primary key (id),
  constraint customer_service_plans_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE,
  constraint customer_service_plans_customer_sites_id_fkey foreign KEY (site_id) references customer_sites (id) on delete RESTRICT,
  constraint check_frequency check (
    (
      (frequency is null)
      or (
        frequency = any (
          array[
            'Hàng tuần'::text,
            '2 tuần/lần'::text,
            'Hàng tháng'::text
          ]
        )
      )
    )
  ),
  constraint check_plan check (
    (
      plan = any (array['Lịch Định kỳ'::text, '1 lần'::text])
    )
  ),
  constraint customer_service_plans_report_frequency_check check (
    (
      report_frequency = any (
        array[
          '1 tuần/lần'::text,
          '2 tuần/lần'::text,
          '1 tháng/lần'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_customer_service_plans_customer_id on public.customer_service_plans using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_customer_service_plans_plan on public.customer_service_plans using btree (plan) TABLESPACE pg_default;

create index IF not exists idx_customer_service_plans_days_of_week on public.customer_service_plans using gin (days_of_week) TABLESPACE pg_default;

create index IF not exists idx_customer_service_plans_start_date on public.customer_service_plans using btree (start_date) TABLESPACE pg_default;

create index IF not exists idx_customer_service_plans_end_date on public.customer_service_plans using btree (end_date) TABLESPACE pg_default;

create index IF not exists idx_customer_service_plans_site_id on public.customer_service_plans using btree (site_id) TABLESPACE pg_default;

create trigger update_customer_service_plans_updated_at BEFORE
update on customer_service_plans for EACH row
execute FUNCTION update_updated_at_column ();