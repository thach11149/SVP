create table public.profiles (
  id uuid not null,
  name text not null,
  phone text null,
  position text null,
  role text not null default 'technician'::text,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  role_id uuid null,
  tech_code text null,
  email text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_id_fkey foreign KEY (role_id) references roles (id) on delete set null
) TABLESPACE pg_default;



INSERT INTO "public"."profiles" ("id", "name", "phone", "position", "role", "active", "created_at", "role_id", "tech_code", "email") VALUES ('067a009e-b0f2-432f-91df-e4aa8cc6fc47', 'quanly1', null, null, 'technician', 'true', '2025-08-15 04:47:45.138583+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'TECH_067a009e', 'quanly1@gmail.com'), ('62fa0954-7e9f-421d-9407-8a3175b80913', 'Phạm Văn Tài', '0908123459', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV004', 'nhanvien4@gmail.com'), ('7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Nguyễn Minh Nhựt', '0908123456', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 02:04:58.937215+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV001', 'nhanvien1@gmail.com'), ('cd2b634c-857e-42f2-81dd-b780b33c86a5', 'admin1', null, null, 'technician', 'true', '2025-08-15 04:47:45.138583+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'TECH_cd2b634c', 'admin1@gmail.com'), ('cff541be-9c8d-4412-ba99-cd5d87c5b982', 'Lê Thị Hoa', '0908123458', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV003', 'nhanvien3@gmail.com'), ('eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'Trần Văn Hùng', '0908123457', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV002', 'nhanvien2@gmail.com'), ('f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'Nguyễn Thị Mai', '0908123460', 'Kỹ thuật viên', 'technician', 'true', '2025-08-14 20:21:26.374146+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'KTV005', 'nhanvien5@gmail.com'), ('fb16ff41-a1cd-422c-b40c-978a1937ca2b', 'Tèo', '0909123456', null, 'admin', 'true', '2025-08-15 04:47:45.138583+00', '4e3dd69c-aec5-4747-a28b-703347817f4a', 'TECH_fb16ff41', 'thach11149@gmail.com');