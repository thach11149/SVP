-- distance_km is no longer being stored in the customers table, removing the column
ALTER TABLE public.customers DROP COLUMN IF EXISTS distance_km;

-- Add site_name column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS site_name text NULL;