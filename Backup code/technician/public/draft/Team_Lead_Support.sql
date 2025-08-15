-- Cập nhật bảng jobs để hỗ trợ team work và lead assignment
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS team_lead_id uuid, -- ID của người lead
ADD COLUMN IF NOT EXISTS team_size integer DEFAULT 1; -- Số lượng người trong team

-- Thêm foreign key constraint cho team_lead_id
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_team_lead_id_fkey 
FOREIGN KEY (team_lead_id) REFERENCES auth.users (id) ON DELETE SET NULL;

-- Cập nhật bảng job_assignments để phân biệt role
ALTER TABLE public.job_assignments 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member'; -- 'lead' hoặc 'member'

-- Index cho performance
CREATE INDEX IF NOT EXISTS jobs_team_lead_idx ON public.jobs USING btree (team_lead_id);
CREATE INDEX IF NOT EXISTS job_assignments_role_idx ON public.job_assignments USING btree (role);
