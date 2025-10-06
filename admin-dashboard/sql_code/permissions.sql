CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- Ví dụ: 'create_job', 'delete_job', 'view_reports'
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Ho_Chi_Minh'::text, now()),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Insert dữ liệu mẫu
INSERT INTO public.permissions (name, description) VALUES
  ('create_job', 'Tạo công việc mới'),
  ('edit_job', 'Chỉnh sửa công việc'),
  ('delete_job', 'Xóa công việc'),
  ('view_jobs', 'Xem danh sách công việc'),
  ('assign_job', 'Phân công công việc'),
  ('complete_job', 'Hoàn thành công việc'),
  ('view_reports', 'Xem báo cáo'),
  ('manage_users', 'Quản lý người dùng'),
  ('manage_materials', 'Quản lý vật tư');