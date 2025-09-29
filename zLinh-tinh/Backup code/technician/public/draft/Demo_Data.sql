-- Demo data cho customers
INSERT INTO public.customers (id, customer_code, customer_type, name, tax_code, primary_contact_name, primary_contact_phone, primary_contact_email, address, ward, district, province) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'KH001', 'Doanh nghiệp', 'Công ty TNHH ABC', '0123456789', 'Chị Lan', '0901234567', 'lan@abc.com', '123 Đường Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440002', 'KH002', 'Cửa hàng', 'Cửa hàng XYZ', '0987654321', 'Anh Bình', '0908765432', 'binh@xyz.com', '456 Đường Trần Hưng Đạo', 'Nguyễn Cư Trinh', 'Quận 5', 'TP.HCM'),
('550e8400-e29b-41d4-a716-446655440003', 'KH003', 'Cá nhân', 'Nhà riêng Anh Tuấn', NULL, 'Anh Tuấn', '0912345678', 'tuan@email.com', '789 Đường Lê Lợi', 'Võ Thị Sáu', 'Quận 3', 'TP.HCM');

-- Demo data cho materials
INSERT INTO public.materials (id, name, unit, category) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Ga lạnh R410A', 'kg', 'hóa chất'),
('660e8400-e29b-41d4-a716-446655440002', 'Chất tẩy rửa dàn lạnh', 'lít', 'hóa chất'),
('660e8400-e29b-41d4-a716-446655440003', 'Thuốc diệt muỗi', 'lít', 'thuốc diệt côn trùng'),
('660e8400-e29b-41d4-a716-446655440004', 'Thuốc diệt gián', 'gram', 'thuốc diệt côn trùng'),
('660e8400-e29b-41d4-a716-446655440005', 'Dụng cụ kiểm tra áp suất', 'cái', 'dụng cụ'),
('660e8400-e29b-41d4-a716-446655440006', 'Bẫy gián', 'cái', 'dụng cụ');

-- Demo data cho checklist
INSERT INTO public.checklist (id, label, value) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Kiểm tra áp suất gas', 'check_gas_pressure'),
('770e8400-e29b-41d4-a716-446655440002', 'Vệ sinh lưới lọc', 'clean_filter'),
('770e8400-e29b-41d4-a716-446655440003', 'Kiểm tra ống thoát nước', 'check_drain_pipe'),
('770e8400-e29b-41d4-a716-446655440004', 'Phun thuốc diệt muỗi khu vực trong nhà', 'spray_mosquito_indoor'),
('770e8400-e29b-41d4-a716-446655440005', 'Đặt bẫy gián tại bếp', 'place_cockroach_trap'),
('770e8400-e29b-41d4-a716-446655440006', 'Kiểm tra các khe hở', 'check_gaps'),
('770e8400-e29b-41d4-a716-446655440007', 'Kiểm tra rò rỉ đường ống nước', 'check_water_leak'),
('770e8400-e29b-41d4-a716-446655440008', 'Sửa chữa ổ cắm điện bị hỏng', 'fix_electrical_outlet');

-- Demo data cho jobs (cần thay thế user_id bằng ID user thực tế của bạn)
-- Giả sử user_id là: 00000000-0000-0000-0000-000000000001
INSERT INTO public.jobs (id, customer_id, user_id, job_description, status, scheduled_date, service_type, job_content, scheduled_time, contact_person, contact_phone, special_requests, address, completed) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Kiểm tra, bảo trì hệ thống điều hòa', 'Đã giao', '2025-08-14 08:00:00+07', 'Bảo trì điều hòa', 'Kiểm tra, bảo trì hệ thống điều hòa', '08:00 - 10:00', 'Chị Lan', '0901234567', 'Mang theo dụng cụ kiểm tra áp suất.', '123 Đường Nguyễn Huệ, Q1, TP.HCM', false),
(2, '550e8400-e29b-41d4-a716-446655440002', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Diệt côn trùng định kỳ', 'Đã giao', '2025-08-14 10:30:00+07', 'Diệt côn trùng', 'Diệt côn trùng định kỳ', '10:30 - 12:00', 'Anh Bình', '0908765432', 'Cẩn thận với vật nuôi trong nhà.', '456 Đường Trần Hưng Đạo, Q5, TP.HCM', false),
(3, '550e8400-e29b-41d4-a716-446655440003', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Sửa chữa điện nước', 'Đã giao', '2025-08-16 14:00:00+07', 'Sửa chữa', 'Sửa chữa điện nước', '14:00 - 16:00', 'Anh Tuấn', '0912345678', 'Mang theo thang cao.', '789 Đường Lê Lợi, Q3, TP.HCM', false);

-- Demo data cho job_materials
INSERT INTO public.job_materials (job_id, material_id, required_quantity) VALUES
(1, '660e8400-e29b-41d4-a716-446655440001', 1.5), -- Ga lạnh R410A
(1, '660e8400-e29b-41d4-a716-446655440002', 0.5), -- Chất tẩy rửa dàn lạnh
(2, '660e8400-e29b-41d4-a716-446655440003', 1.0), -- Thuốc diệt muỗi
(2, '660e8400-e29b-41d4-a716-446655440004', 200); -- Thuốc diệt gián

-- Demo data cho job_checklist_items
INSERT INTO public.job_checklist_items (job_id, checklist_id) VALUES
(1, '770e8400-e29b-41d4-a716-446655440001'), -- Kiểm tra áp suất gas
(1, '770e8400-e29b-41d4-a716-446655440002'), -- Vệ sinh lưới lọc
(1, '770e8400-e29b-41d4-a716-446655440003'), -- Kiểm tra ống thoát nước
(2, '770e8400-e29b-41d4-a716-446655440004'), -- Phun thuốc diệt muỗi
(2, '770e8400-e29b-41d4-a716-446655440005'), -- Đặt bẫy gián
(2, '770e8400-e29b-41d4-a716-446655440006'), -- Kiểm tra các khe hở
(3, '770e8400-e29b-41d4-a716-446655440007'), -- Kiểm tra rò rỉ nước
(3, '770e8400-e29b-41d4-a716-446655440008'); -- Sửa chữa ổ cắm điện

-- Demo data cho profiles (cần thay thế ID bằng user ID thực tế)
INSERT INTO public.profiles (id, name, phone, position, role) VALUES
('7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Nguyễn Minh Nhựt', '0908123456', 'Kỹ thuật viên', 'technician');

-- Lưu ý: Thay thế '00000000-0000-0000-0000-000000000001' bằng user ID thực tế từ auth.users
