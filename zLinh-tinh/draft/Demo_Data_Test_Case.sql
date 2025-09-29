-- 1. customers
INSERT INTO public.customers (id, customer_code, customer_type, name, tax_code, primary_contact_name, primary_contact_phone, primary_contact_email, address, ward, district, province) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'KH011', 'Doanh nghiệp', 'Công ty TNHH Mặt Trời', '0123456701', 'Chị Mai', '0901111111', 'mai@matroi.com', '11 Đường Sáng', 'Phường 1', 'Quận 1', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440012', 'KH012', 'Cửa hàng', 'Cửa hàng Hoa Mai', '0123456702', 'Anh Sơn', '0902222222', 'son@hoamai.com', '12 Đường Hoa', 'Phường 2', 'Quận 2', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440013', 'KH013', 'Cá nhân', 'Nhà riêng Chị Hạnh', NULL, 'Chị Hạnh', '0903333333', 'hanh@email.com', '13 Đường Hạnh Phúc', 'Phường 3', 'Quận 3', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440014', 'KH014', 'Doanh nghiệp', 'Công ty TNHH Sao Mai', '0123456704', 'Anh Quang', '0904444444', 'quang@saomai.com', '14 Đường Sao', 'Phường 4', 'Quận 4', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440015', 'KH015', 'Cửa hàng', 'Cửa hàng Bách Hóa', '0123456705', 'Chị Ngọc', '0905555555', 'ngoc@bachhoa.com', '15 Đường Bách', 'Phường 5', 'Quận 5', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440016', 'KH016', 'Cá nhân', 'Nhà riêng Anh Phúc', NULL, 'Anh Phúc', '0906666666', 'phuc@email.com', '16 Đường Phúc Lộc', 'Phường 6', 'Quận 6', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440017', 'KH017', 'Doanh nghiệp', 'Công ty TNHH Bình Minh', '0123456707', 'Chị Bình', '0907777777', 'binh@binhminh.com', '17 Đường Bình Minh', 'Phường 7', 'Quận 7', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440018', 'KH018', 'Cửa hàng', 'Cửa hàng Sáng Tạo', '0123456708', 'Anh Tạo', '0908888888', 'tao@sangtao.com', '18 Đường Sáng Tạo', 'Phường 8', 'Quận 8', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440019', 'KH019', 'Cá nhân', 'Nhà riêng Chị Lan', NULL, 'Chị Lan', '0909999999', 'lan@email.com', '19 Đường Lan', 'Phường 9', 'Quận 9', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440020', 'KH020', 'Doanh nghiệp', 'Công ty TNHH Phú Quý', '0123456720', 'Anh Quý', '0910000000', 'quy@phuquy.com', '20 Đường Phú Quý', 'Phường 10', 'Quận 10', 'TP.HCM');

--2. materials
INSERT INTO public.materials (id, name, unit, category) VALUES
('660e8400-e29b-41d4-a716-446655440011', 'Ga lạnh R32', 'kg', 'hóa chất'),
('660e8400-e29b-41d4-a716-446655440012', 'Chất tẩy rửa đa năng', 'lít', 'hóa chất'),
('660e8400-e29b-41d4-a716-446655440013', 'Thuốc diệt kiến', 'gram', 'thuốc diệt côn trùng'),
('660e8400-e29b-41d4-a716-446655440014', 'Thuốc diệt chuột', 'gram', 'thuốc diệt côn trùng'),
('660e8400-e29b-41d4-a716-446655440015', 'Dụng cụ đo nhiệt độ', 'cái', 'dụng cụ'),
('660e8400-e29b-41d4-a716-446655440016', 'Bẫy chuột', 'cái', 'dụng cụ'),
('660e8400-e29b-41d4-a716-446655440017', 'Băng keo cách điện', 'cuộn', 'vật tư'),
('660e8400-e29b-41d4-a716-446655440018', 'Ống nước PVC', 'mét', 'vật tư'),
('660e8400-e29b-41d4-a716-446655440019', 'Dung dịch sát khuẩn', 'lít', 'hóa chất'),
('660e8400-e29b-41d4-a716-446655440020', 'Bộ dụng cụ sửa điện', 'bộ', 'dụng cụ');

--3. technicians
INSERT INTO public.technicians (id, tech_code, name, phone, email, position) VALUES
('7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'KTV001', 'Nguyễn Minh Nhựt', '0908123456', 'nhanvien1@gmail.com', 'Kỹ thuật viên'),
('eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'KTV002', 'Trần Văn Hùng', '0908123457', 'nhanvien2@gmail.com', 'Kỹ thuật viên'),
('cff541be-9c8d-4412-ba99-cd5d87c5b982', 'KTV003', 'Lê Thị Hoa', '0908123458', 'nhanvien3@gmail.com', 'Kỹ thuật viên'),
('62fa0954-7e9f-421d-9407-8a3175b80913', 'KTV004', 'Phạm Văn Tài', '0908123459', 'nhanvien4@gmail.com', 'Kỹ thuật viên'),
('fb16ff41-a1cd-422c-b40c-978a1937ca2b', 'KTV005', 'Nguyễn Thị Mai', '0908123460', 'nhanvien5@gmail.com', 'Kỹ thuật viên');

--4. checklist
INSERT INTO public.checklist (id, label, value) VALUES
('770e8400-e29b-41d4-a716-446655440011', 'Kiểm tra nhiệt độ', 'check_temperature'),
('770e8400-e29b-41d4-a716-446655440012', 'Vệ sinh khu vực làm việc', 'clean_work_area'),
('770e8400-e29b-41d4-a716-446655440013', 'Kiểm tra hệ thống điện', 'check_electrical_system'),
('770e8400-e29b-41d4-a716-446655440014', 'Phun thuốc diệt kiến', 'spray_ant'),
('770e8400-e29b-41d4-a716-446655440015', 'Đặt bẫy chuột', 'place_mouse_trap'),
('770e8400-e29b-41d4-a716-446655440016', 'Kiểm tra rò rỉ nước', 'check_water_leak'),
('770e8400-e29b-41d4-a716-446655440017', 'Sửa chữa ổ cắm điện', 'fix_electrical_outlet'),
('770e8400-e29b-41d4-a716-446655440018', 'Kiểm tra hệ thống báo cháy', 'check_fire_alarm'),
('770e8400-e29b-41d4-a716-446655440019', 'Vệ sinh máy lạnh', 'clean_air_conditioner'),
('770e8400-e29b-41d4-a716-446655440020', 'Kiểm tra áp suất nước', 'check_water_pressure');

--5. jobs (10 công việc mẫu, mỗi công việc gán cho 1 khách hàng, 1-2 kỹ thuật viên, 2-3 vật tư/hóa chất, 2-3 checklist)
INSERT INTO public.jobs (id, customer_id, user_id, job_description, status, scheduled_date, service_type, job_content, scheduled_time, contact_person, contact_phone, special_requests, address, completed) VALUES
(11, '550e8400-e29b-41d4-a716-446655440011', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Bảo trì máy lạnh', 'Đã giao', '2025-08-15 08:00:00+07', 'Bảo trì', 'Bảo trì máy lạnh', '08:00 - 10:00', 'Chị Mai', '0901111111', 'Mang theo dụng cụ đo nhiệt độ.', '11 Đường Sáng, Q1, TP.HCM', false),
(12, '550e8400-e29b-41d4-a716-446655440012', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4f', 'Diệt kiến định kỳ', 'Đã giao', '2025-08-15 10:30:00+07', 'Diệt côn trùng', 'Diệt kiến định kỳ', '10:30 - 12:00', 'Anh Sơn', '0902222222', 'Cẩn thận với vật nuôi.', '12 Đường Hoa, Q2, TP.HCM', false),
(13, '550e8400-e29b-41d4-a716-446655440013', '7e3ebcf0-6995-471c-8928-65e3ce9e1d50', 'Sửa chữa điện nước', 'Đã giao', '2025-08-16 14:00:00+07', 'Sửa chữa', 'Sửa chữa điện nước', '14:00 - 16:00', 'Chị Hạnh', '0903333333', 'Mang theo thang cao.', '13 Đường Hạnh Phúc, Q3, TP.HCM', false),
(14, '550e8400-e29b-41d4-a716-446655440014', '7e3ebcf0-6995-471c-8928-65e3ce9e1d51', 'Kiểm tra hệ thống báo cháy', 'Đã giao', '2025-08-17 09:00:00+07', 'Kiểm tra', 'Kiểm tra hệ thống báo cháy', '09:00 - 11:00', 'Anh Quang', '0904444444', 'Mang theo bộ dụng cụ sửa điện.', '14 Đường Sao, Q4, TP.HCM', false),
(15, '550e8400-e29b-41d4-a716-446655440015', '7e3ebcf0-6995-471c-8928-65e3ce9e1d52', 'Vệ sinh khu vực làm việc', 'Đã giao', '2025-08-18 13:00:00+07', 'Vệ sinh', 'Vệ sinh khu vực làm việc', '13:00 - 15:00', 'Chị Ngọc', '0905555555', 'Mang theo chất tẩy rửa.', '15 Đường Bách, Q5, TP.HCM', false),
(16, '550e8400-e29b-41d4-a716-446655440016', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Đặt bẫy chuột', 'Đã giao', '2025-08-19 08:00:00+07', 'Diệt côn trùng', 'Đặt bẫy chuột', '08:00 - 10:00', 'Anh Phúc', '0906666666', 'Mang theo bẫy chuột.', '16 Đường Phúc Lộc, Q6, TP.HCM', false),
(17, '550e8400-e29b-41d4-a716-446655440017', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4f', 'Kiểm tra áp suất nước', 'Đã giao', '2025-08-20 10:30:00+07', 'Kiểm tra', 'Kiểm tra áp suất nước', '10:30 - 12:00', 'Chị Bình', '0907777777', 'Mang theo dụng cụ đo áp suất.', '17 Đường Bình Minh, Q7, TP.HCM', false),
(18, '550e8400-e29b-41d4-a716-446655440018', '7e3ebcf0-6995-471c-8928-65e3ce9e1d50', 'Sửa chữa ổ cắm điện', 'Đã giao', '2025-08-21 14:00:00+07', 'Sửa chữa', 'Sửa chữa ổ cắm điện', '14:00 - 16:00', 'Anh Tạo', '0908888888', 'Mang theo băng keo cách điện.', '18 Đường Sáng Tạo, Q8, TP.HCM', false),
(19, '550e8400-e29b-41d4-a716-446655440019', '7e3ebcf0-6995-471c-8928-65e3ce9e1d51', 'Vệ sinh máy lạnh', 'Đã giao', '2025-08-22 09:00:00+07', 'Vệ sinh', 'Vệ sinh máy lạnh', '09:00 - 11:00', 'Chị Lan', '0909999999', 'Mang theo chất tẩy rửa đa năng.', '19 Đường Lan, Q9, TP.HCM', false),
(20, '550e8400-e29b-41d4-a716-446655440020', '7e3ebcf0-6995-471c-8928-65e3ce9e1d52', 'Kiểm tra hệ thống điện', 'Đã giao', '2025-08-23 13:00:00+07', 'Kiểm tra', 'Kiểm tra hệ thống điện', '13:00 - 15:00', 'Anh Quý', '0910000000', 'Mang theo bộ dụng cụ sửa điện.', '20 Đường Phú Quý, Q10, TP.HCM', false);

--6. job_materials (mỗi job 2-3 vật tư/hóa chất)
INSERT INTO public.job_materials (job_id, material_id, required_quantity) VALUES
(11, '660e8400-e29b-41d4-a716-446655440011', 2.0),
(11, '660e8400-e29b-41d4-a716-446655440015', 1),
(12, '660e8400-e29b-41d4-a716-446655440013', 100),
(12, '660e8400-e29b-41d4-a716-446655440012', 0.5),
(13, '660e8400-e29b-41d4-a716-446655440018', 5),
(13, '660e8400-e29b-41d4-a716-446655440017', 2),
(14, '660e8400-e29b-41d4-a716-446655440020', 1),
(14, '660e8400-e29b-41d4-a716-446655440015', 1),
(15, '660e8400-e29b-41d4-a716-446655440012', 1),
(15, '660e8400-e29b-41d4-a716-446655440019', 0.5),
(16, '660e8400-e29b-41d4-a716-446655440016', 2),
(16, '660e8400-e29b-41d4-a716-446655440014', 50),
(17, '660e8400-e29b-41d4-a716-446655440018', 10),
(17, '660e8400-e29b-41d4-a716-446655440011', 1),
(18, '660e8400-e29b-41d4-a716-446655440017', 3),
(18, '660e8400-e29b-41d4-a716-446655440020', 1),
(19, '660e8400-e29b-41d4-a716-446655440012', 1),
(19, '660e8400-e29b-41d4-a716-446655440019', 0.5),
(20, '660e8400-e29b-41d4-a716-446655440020', 1),
(20, '660e8400-e29b-41d4-a716-446655440015', 1);

--7. job_checklist_items (mỗi job 2-3 checklist)
INSERT INTO public.job_checklist_items (job_id, checklist_id) VALUES
(11, '770e8400-e29b-41d4-a716-446655440011'),
(11, '770e8400-e29b-41d4-a716-446655440019'),
(12, '770e8400-e29b-41d4-a716-446655440014'),
(12, '770e8400-e29b-41d4-a716-446655440012'),
(13, '770e8400-e29b-41d4-a716-446655440013'),
(13, '770e8400-e29b-41d4-a716-446655440016'),
(14, '770e8400-e29b-41d4-a716-446655440018'),
(14, '770e8400-e29b-41d4-a716-446655440017'),
(15, '770e8400-e29b-41d4-a716-446655440012'),
(15, '770e8400-e29b-41d4-a716-446655440019'),
(16, '770e8400-e29b-41d4-a716-446655440015'),
(16, '770e8400-e29b-41d4-a716-446655440014'),
(17, '770e8400-e29b-41d4-a716-446655440020'),
(17, '770e8400-e29b-41d4-a716-446655440011'),
(18, '770e8400-e29b-41d4-a716-446655440017'),
(18, '770e8400-e29b-41d4-a716-446655440013'),
(19, '770e8400-e29b-41d4-a716-446655440019'),
(19, '770e8400-e29b-41d4-a716-446655440011'),
(20, '770e8400-e29b-41d4-a716-446655440013'),
(20, '770e8400-e29b-41d4-a716-446655440018');

--8. job_assignments (mỗi job 1-2 kỹ thuật viên)
INSERT INTO public.job_assignments (job_id, technician_id, status) VALUES
(11, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'assigned'),
(12, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4f', 'assigned'),
(13, '7e3ebcf0-6995-471c-8928-65e3ce9e1d50', 'assigned'),
(14, '7e3ebcf0-6995-471c-8928-65e3ce9e1d51', 'assigned'),
(15, '7e3ebcf0-6995-471c-8928-65e3ce9e1d52', 'assigned'),
(16, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'assigned'),
(17, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4f', 'assigned'),
(18, '7e3ebcf0-6995-471c-8928-65e3ce9e1d50', 'assigned'),
(19, '7e3ebcf0-6995-471c-8928-65e3ce9e1d51', 'assigned'),
(20, '7e3ebcf0-6995-471c-8928-65e3ce9e1d52', 'assigned');

