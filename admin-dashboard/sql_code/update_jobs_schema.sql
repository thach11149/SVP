-- Add missing columns to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_id uuid;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_name text;

-- Add foreign key constraint
ALTER TABLE public.jobs ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE;

-- Update existing jobs if needed (assuming plan_id links to customer_sites_plans which links to customer_sites which links to customers)
-- This might need adjustment based on your data
