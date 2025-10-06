CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- Ví dụ: 'admin', 'technician', 'manager'
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Ho_Chi_Minh'::text, now()),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Insert dữ liệu mẫu
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Quản trị viên: Toàn quyền truy cập'),
  ('technician', 'Kỹ thuật viên: Thực hiện công việc, báo cáo'),
  ('manager', 'Quản lý: Phê duyệt, giám sát');