-- ===========================
-- SCRIPT SỬA LẠI SCHEMA CHO JOB ASSIGNMENTS (SỬ DỤNG TECHNICIANS.ID)
-- ===========================

-- Bước 0: Tạo technician records cho các auth users chưa có
INSERT INTO technicians (user_id, tech_code, name, email, active)
SELECT 
  au.id as user_id,
  'TECH_' || SUBSTRING(au.id::text, 1, 8) as tech_code,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as name,
  au.email,
  true as active
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM technicians t WHERE t.user_id = au.id
)
AND au.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Tạo function để tự động tạo technician record khi user đăng ký
CREATE OR REPLACE FUNCTION create_technician_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.technicians (user_id, tech_code, name, email, active)
  VALUES (
    NEW.id,
    'TECH_' || SUBSTRING(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để tự động tạo technician profile
DROP TRIGGER IF EXISTS trigger_create_technician_profile ON auth.users;
CREATE TRIGGER trigger_create_technician_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_technician_profile();

-- Bước 1: Thêm field created_by vào bảng jobs để track ai tạo job
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Bước 2: Cập nhật constraint cho user_id trong jobs (làm cho nó optional)
-- Vì giờ jobs sẽ được assign qua job_assignments table
ALTER TABLE public.jobs 
ALTER COLUMN user_id DROP NOT NULL;

-- Bước 3: Thêm index cho performance
CREATE INDEX IF NOT EXISTS jobs_created_by_idx ON public.jobs USING btree (created_by);
CREATE INDEX IF NOT EXISTS jobs_scheduled_date_idx ON public.jobs USING btree (scheduled_date);

-- Bước 4: Tạo function để tự động tạo job_assignments khi tạo job mới
CREATE OR REPLACE FUNCTION create_job_assignments_trigger()
RETURNS TRIGGER AS $$
DECLARE
  tech_id uuid;
BEGIN
  -- Nếu có user_id trong jobs, tự động tạo assignment
  IF NEW.user_id IS NOT NULL THEN
    -- Lấy technician_id từ user_id
    SELECT id INTO tech_id FROM technicians WHERE user_id = NEW.user_id;
    
    IF tech_id IS NOT NULL THEN
      INSERT INTO job_assignments (job_id, technician_id, role, status)
      VALUES (NEW.id, tech_id, 
        CASE WHEN NEW.team_lead_id = NEW.user_id THEN 'lead' ELSE 'member' END,
        'assigned');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bước 5: Tạo trigger để tự động tạo assignments
DROP TRIGGER IF EXISTS trigger_create_job_assignments ON public.jobs;
CREATE TRIGGER trigger_create_job_assignments
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_assignments_trigger();

-- ===========================
-- DATA MIGRATION: Chuyển dữ liệu cũ sang job_assignments
-- ===========================

-- Bước 6: Migrate dữ liệu hiện có từ jobs.user_id sang job_assignments
INSERT INTO job_assignments (job_id, technician_id, role, status, assigned_at)
SELECT 
  j.id as job_id,
  t.id as technician_id,  -- Sử dụng technicians.id thay vì user_id
  CASE 
    WHEN j.team_lead_id = j.user_id THEN 'lead'
    ELSE 'member'
  END as role,
  'assigned' as status,
  j.created_at as assigned_at
FROM jobs j
JOIN technicians t ON j.user_id = t.user_id  -- Join qua user_id
WHERE j.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM job_assignments ja 
    WHERE ja.job_id = j.id AND ja.technician_id = t.id
  );

-- Bước 7: Cập nhật created_by field cho jobs hiện có
UPDATE jobs 
SET created_by = user_id 
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- ===========================
-- VIEW để dễ query jobs with assignments
-- ===========================

-- Bước 8: Tạo view để dễ dàng query jobs với assignments
CREATE OR REPLACE VIEW job_assignments_view AS
SELECT 
  j.*,
  ja.technician_id,
  ja.role as assignment_role,
  ja.status as assignment_status,
  ja.assigned_at,
  t.name as technician_name,
  t.email as technician_email,
  t.phone as technician_phone,
  c.name as customer_name,
  c.address as customer_address,
  c.primary_contact_name,
  c.primary_contact_phone
FROM jobs j
LEFT JOIN job_assignments ja ON j.id = ja.job_id
LEFT JOIN technicians t ON ja.technician_id = t.user_id
LEFT JOIN customers c ON j.customer_id = c.id;

-- ===========================
-- FUNCTIONS hỗ trợ
-- ===========================

-- Function để assign job cho technician
CREATE OR REPLACE FUNCTION assign_job_to_technician(
  p_job_id bigint,
  p_user_id uuid,  -- Nhận user_id
  p_role text DEFAULT 'member'
)
RETURNS boolean AS $$
DECLARE
  tech_id uuid;
BEGIN
  -- Lấy technician_id từ user_id
  SELECT id INTO tech_id FROM technicians WHERE user_id = p_user_id;
  
  IF tech_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO job_assignments (job_id, technician_id, role, status)
  VALUES (p_job_id, tech_id, p_role, 'assigned')
  ON CONFLICT (job_id, technician_id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    assigned_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function để lấy jobs của technician
CREATE OR REPLACE FUNCTION get_technician_jobs(p_user_id uuid)
RETURNS TABLE (
  job_id bigint,
  customer_name text,
  job_description text,
  scheduled_date timestamp with time zone,
  scheduled_time text,
  status text,
  role text,
  team_size integer,
  team_members text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    c.name,
    j.job_description,
    j.scheduled_date,
    j.scheduled_time,
    j.status,
    ja.role,
    j.team_size,
    j.team_members
  FROM jobs j
  JOIN job_assignments ja ON j.id = ja.job_id
  JOIN customers c ON j.customer_id = c.id
  WHERE ja.technician_id = p_user_id
    AND ja.status = 'assigned'
  ORDER BY j.scheduled_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- SECURITY: RLS Policies
-- ===========================

-- Enable RLS for job_assignments
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Technician chỉ thấy assignments của mình
CREATE POLICY "Technicians can view their own assignments" ON job_assignments
  FOR SELECT USING (
    technician_id IN (
      SELECT id FROM technicians WHERE user_id = auth.uid()
    )
  );

-- Policy: Admin có thể thấy tất cả
CREATE POLICY "Admins can view all assignments" ON job_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- ===========================
-- INDEXES cho performance
-- ===========================

CREATE INDEX IF NOT EXISTS job_assignments_compound_idx 
ON job_assignments (technician_id, status, assigned_at DESC);

CREATE INDEX IF NOT EXISTS jobs_customer_date_idx 
ON jobs (customer_id, scheduled_date);

-- ===========================
-- DONE!
-- ===========================

-- Kiểm tra kết quả
SELECT 'Migration completed successfully!' as status;
