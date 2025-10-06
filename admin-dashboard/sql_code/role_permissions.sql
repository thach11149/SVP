CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Ho_Chi_Minh'::text, now()),
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id)  -- Tránh trùng lặp
) TABLESPACE pg_default;

-- Insert dữ liệu mẫu (gán permissions cho roles)
-- Admin: Tất cả permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin';

-- Technician: Chỉ permissions liên quan đến công việc
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'technician' AND p.name IN ('view_jobs', 'complete_job', 'view_reports');

-- Manager: Phê duyệt và giám sát
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager' AND p.name IN ('create_job', 'edit_job', 'assign_job', 'view_jobs', 'view_reports');