INSERT INTO "public"."technicians" ("id", "user_id", "tech_code", "name", "phone", "email", "position", "active", "created_at") VALUES ('4304a276-30e9-4465-8be9-97b582a7da56', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'KTV001', 'Nguyễn Minh Nhựt', '0908123456', 'nhanvien1@gmail.com', 'Kỹ thuật viên', 'true', '2025-08-14 02:04:58.937215+00'), ('5498874a-b5fa-433e-9427-851e43a93a51', 'fb16ff41-a1cd-422c-b40c-978a1937ca2b', 'TECH_fb16ff41', 'Tèo', '0909123456', 'thach11149@gmail.com', null, 'true', '2025-08-15 04:47:45.138583+00'), ('7e3ebcf0-6995-471c-8928-65e3ce9e1d4f', 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'KTV002', 'Trần Văn Hùng', '0908123457', 'nhanvien2@gmail.com', 'Kỹ thuật viên', 'true', '2025-08-14 20:21:26.374146+00'), ('7e3ebcf0-6995-471c-8928-65e3ce9e1d50', 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'KTV003', 'Lê Thị Hoa', '0908123458', 'nhanvien3@gmail.com', 'Kỹ thuật viên', 'true', '2025-08-14 20:21:26.374146+00'), ('7e3ebcf0-6995-471c-8928-65e3ce9e1d51', '62fa0954-7e9f-421d-9407-8a3175b80913', 'KTV004', 'Phạm Văn Tài', '0908123459', 'nhanvien4@gmail.com', 'Kỹ thuật viên', 'true', '2025-08-14 20:21:26.374146+00'), ('7e3ebcf0-6995-471c-8928-65e3ce9e1d52', 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'KTV005', 'Nguyễn Thị Mai', '0908123460', 'nhanvien5@gmail.com', 'Kỹ thuật viên', 'true', '2025-08-14 20:21:26.374146+00'), ('be5562f8-c1f3-42b8-b7f9-3a607dd014a8', '067a009e-b0f2-432f-91df-e4aa8cc6fc47', 'TECH_067a009e', 'quanly1', null, 'quanly1@gmail.com', null, 'true', '2025-08-15 04:47:45.138583+00'), ('ce13b958-d365-420d-8eff-55eb68a203c0', 'cd2b634c-857e-42f2-81dd-b780b33c86a5', 'TECH_cd2b634c', 'admin1', null, 'admin1@gmail.com', null, 'true', '2025-08-15 04:47:45.138583+00');

INSERT INTO "public"."technician_users" ("technician_id", "user_id", "tech_code", "name", "email", "phone", "active", "auth_email", "full_name") VALUES ('7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'KTV001', 'Nguyễn Minh Nhựt', 'nhanvien1@gmail.com', '0908123456', 'true', 'nhanvien1@gmail.com', null);

INSERT INTO "public"."profiles" ("id", "name", "phone", "position", "role", "active", "created_at", "role_id", "tech_code", "email") VALUES ('7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Nguyễn Minh Nhựt', '0908123456', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 02:04:58.937215+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV001', 'nhanvien1@gmail.com');

-- Migrate data từ technicians vào profiles để tránh trùng lặp

-- Thêm cột vào profiles nếu chưa có
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tech_code TEXT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT NULL;

-- Insert profiles mới từ technicians nếu chưa có (để chuyển data cũ)
INSERT INTO public.profiles (id, name, phone, position, role, active, created_at, role_id, tech_code, email)
SELECT t.user_id, t.name, t.phone, t.position, 'technician', t.active, t.created_at, (SELECT id FROM public.roles WHERE name = 'technician'), t.tech_code, t.email
FROM public.technicians t
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = t.user_id);

-- Migrate data: Copy tech_code và email từ technicians sang profiles dựa trên user_id (cho những profile đã có)
UPDATE public.profiles 
SET tech_code = t.tech_code, email = t.email
FROM public.technicians t
WHERE profiles.id = t.user_id;

-- Set role_id cho users là technician active
UPDATE public.profiles 
SET role_id = (SELECT id FROM public.roles WHERE name = 'technician')
WHERE id IN (SELECT user_id FROM public.technicians WHERE active = true);

-- Drop view technician_users cũ (nếu là view)
DROP VIEW IF EXISTS public.technician_users;

-- Tạo view technician_users mới từ profiles
CREATE VIEW public.technician_users AS
SELECT 
  p.id AS technician_id,
  p.id AS user_id,
  p.tech_code,
  p.name,
  p.email,
  p.phone,
  true AS active,
  au.email AS auth_email,
  au.raw_user_meta_data ->> 'full_name'::text AS full_name
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.role_id = (SELECT id FROM public.roles WHERE name = 'technician') AND p.active = true;

-- Drop bảng technicians sau khi migrate
DROP TABLE IF EXISTS public.technicians CASCADE;

-- Thêm data vào profiles dựa trên data cũ từ technicians (vì bảng technicians đã drop)

INSERT INTO "public"."profiles" ("id", "name", "phone", "position", "role", "active", "created_at", "role_id", "tech_code", "email") VALUES
('fb16ff41-a1cd-422c-b40c-978a1937ca2b', 'Tèo', '0909123456', null, 'technician', 'true', '2025-08-15 04:47:45.138583+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'TECH_fb16ff41', 'thach11149@gmail.com'),
('eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'Trần Văn Hùng', '0908123457', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV002', 'nhanvien2@gmail.com'),
('cff541be-9c8d-4412-ba99-cd5d87c5b982', 'Lê Thị Hoa', '0908123458', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV003', 'nhanvien3@gmail.com'),
('62fa0954-7e9f-421d-9407-8a3175b80913', 'Phạm Văn Tài', '0908123459', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV004', 'nhanvien4@gmail.com'),
('f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'Nguyễn Thị Mai', '0908123460', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV005', 'nhanvien5@gmail.com'),
('067a009e-b0f2-432f-91df-e4aa8cc6fc47', 'quanly1', null, null, 'technician', 'true', '2025-08-15 04:47:45.138583+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'TECH_067a009e', 'quanly1@gmail.com'),
('cd2b634c-857e-42f2-81dd-b780b33c86a5', 'admin1', null, null, 'technician', 'true', '2025-08-15 04:47:45.138583+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'TECH_cd2b634c', 'admin1@gmail.com');