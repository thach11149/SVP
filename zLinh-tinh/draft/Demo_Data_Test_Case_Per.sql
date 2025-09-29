-- =================
-- 1. CUSTOMERS
-- =================
INSERT INTO public.customers (id, customer_code, customer_type, name, tax_code, primary_contact_name, primary_contact_phone, primary_contact_email, address, ward, district, province)
VALUES
('c1111111-e29b-41d4-a716-446655440001', 'KH0101', 'Doanh nghiệp', 'Công ty Diệt Mối Xanh', '0101010101', 'Anh Hải', '0901111001', 'hai@xanh.com', '101 Đường Xanh', 'Phường 1', 'Quận 1', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440002', 'CN0102', 'Cửa hàng', 'Cửa hàng Tạp hóa Thu Hiền', NULL, 'Chị Hiền', '0901111002', 'hien@taphoa.com', '102 Đường Hoa', 'Phường 2', 'Quận 2', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440003', 'KH0103', 'Nhà xưởng', 'Xưởng Gỗ An Phát', '0101010103', 'Anh Phát', '0901111003', 'phat@goxuong.com', '103 Đường Công Nghiệp', 'Phường 3', 'Quận 3', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440004', 'KH0104', 'Trường học', 'Trường Tiểu học Hoa Sen', NULL, 'Cô Liên', '0901111004', 'lien@hoasen.edu', '104 Đường Học', 'Phường 4', 'Quận 4', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440005', 'KH0105', 'Nhà hàng', 'Nhà hàng Biển Xanh', '0101010105', 'Anh Sơn', '0901111005', 'son@bienxanh.com', '105 Đường Biển', 'Phường 5', 'Quận 5', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440006', 'KH0106', 'Chung cư', 'Chung cư An Lạc', NULL, 'BQL Tầng Trệt', '0901111006', 'bql@anlac.com', '106 Đường An Lạc', 'Phường 6', 'Quận 6', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440007', 'KH0107', 'Cửa hàng', 'Siêu thị Mini Hồng Ngọc', '0101010107', 'Chị Ngọc', '0901111007', 'ngoc@hongngoc.com', '107 Đường Siêu Thị', 'Phường 7', 'Quận 7', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440008', 'CN0108', 'Trang trại', 'Trang trại Gia súc Bình An', NULL, 'Anh Bình', '0901111008', 'binh@binhan.com', '108 Đường Đồng', 'Phường 8', 'Quận 8', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440009', 'KH0109', 'Doanh nghiệp', 'Công ty Sản Xuất Bao Bì Thành Công', '0101010109', 'Anh Công', '0901111009', 'cong@thanhcong.com', '109 Đường Bao Bì', 'Phường 9', 'Quận 9', 'TP.HCM'),
('c1111111-e29b-41d4-a716-446655440010', 'KH0110', 'Kho bãi', 'Kho Hàng Nam Sơn', NULL, 'Anh Nam', '0901111010', 'nam@namson.com', '110 Đường Kho', 'Phường 10', 'Quận 10', 'TP.HCM');

INSERT INTO public.jobs (id, customer_id, user_id, job_description, status, scheduled_date, service_type, job_content, scheduled_time, contact_person, contact_phone, special_requests, address, completed)
VALUES
(101, 'c1111111-e29b-41d4-a716-446655440001', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Xử lý mối trong kho gỗ', 'Đã giao', '2025-08-25 08:00:00+07', 'Diệt côn trùng', 'Diệt mối gỗ', '08:00 - 11:00', 'Anh Hải', '0901111001', 'Mang theo thuốc diệt mối và bảo hộ lao động', '101 Đường Xanh, Q1, TP.HCM', false),
(102, 'c1111111-e29b-41d4-a716-446655440002', 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'Phun thuốc diệt gián', 'Đã giao', '2025-08-25 13:00:00+07', 'Diệt côn trùng', 'Phun diệt gián trong cửa hàng', '13:00 - 14:30', 'Chị Hiền', '0901111002', 'Tránh khu vực bếp', '102 Đường Hoa, Q2, TP.HCM', false),
(103, 'c1111111-e29b-41d4-a716-446655440003', 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'Đặt bẫy chuột quanh xưởng', 'Đã giao', '2025-08-26 08:00:00+07', 'Diệt côn trùng', 'Đặt bẫy chuột tại 5 vị trí', '08:00 - 10:00', 'Anh Phát', '0901111003', 'Sử dụng bẫy an toàn cho vật nuôi', '103 Đường Công Nghiệp, Q3, TP.HCM', false),
(104, 'c1111111-e29b-41d4-a716-446655440004', '62fa0954-7e9f-421d-9407-8a3175b80913', 'Phun thuốc muỗi sân trường', 'Đã giao', '2025-08-26 14:00:00+07', 'Diệt côn trùng', 'Phun thuốc diệt muỗi toàn khuôn viên', '14:00 - 16:00', 'Cô Liên', '0901111004', 'Tránh giờ tan học', '104 Đường Học, Q4, TP.HCM', false),
(105, 'c1111111-e29b-41d4-a716-446655440005', 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'Xử lý ruồi trong nhà hàng', 'Đã giao', '2025-08-27 08:00:00+07', 'Diệt côn trùng', 'Phun & đặt bẫy ruồi', '08:00 - 09:30', 'Anh Sơn', '0901111005', 'Che chắn khu vực chế biến', '105 Đường Biển, Q5, TP.HCM', false),
(106, 'c1111111-e29b-41d4-a716-446655440006', '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'Kiểm tra mối mọt hành lang', 'Đã giao', '2025-08-27 10:00:00+07', 'Kiểm tra', 'Kiểm tra gỗ và nền khu vực hành lang', '10:00 - 11:00', 'BQL Tầng Trệt', '0901111006', 'Mang theo đèn pin, máy đo độ ẩm', '106 Đường An Lạc, Q6, TP.HCM', false),
(107, 'c1111111-e29b-41d4-a716-446655440007', 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'Phun thuốc diệt kiến đỏ', 'Đã giao', '2025-08-28 08:00:00+07', 'Diệt côn trùng', 'Phun thuốc cánh tủ, kho', '08:00 - 09:00', 'Chị Ngọc', '0901111007', 'Sử dụng thuốc không mùi', '107 Đường Siêu Thị, Q7, TP.HCM', false),
(108, 'c1111111-e29b-41d4-a716-446655440008', 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'Vệ sinh và phun trùng chuồng trại', 'Đã giao', '2025-08-28 14:00:00+07', 'Vệ sinh/Diệt côn trùng', 'Vệ sinh & phun thuốc trại bò', '14:00 - 16:00', 'Anh Bình', '0901111008', 'Mang ủng, khẩu trang', '108 Đường Đồng, Q8, TP.HCM', false),
(109, 'c1111111-e29b-41d4-a716-446655440009', '62fa0954-7e9f-421d-9407-8a3175b80913', 'Phun khử trùng kho bao bì', 'Đã giao', '2025-08-29 08:00:00+07', 'Khử trùng', 'Phun dung dịch sát khuẩn toàn kho', '08:00 - 09:30', 'Anh Công', '0901111009', 'Đảm bảo quạt thông gió hoạt động', '109 Đường Bao Bì, Q9, TP.HCM', false),
(110, 'c1111111-e29b-41d4-a716-446655440010', 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'Kiểm tra và xử lý mọt gạo', 'Đã giao', '2025-08-29 14:00:00+07', 'Diệt côn trùng', 'Hút mọt gạo trong kho', '14:00 - 16:00', 'Anh Nam', '0901111010', 'Mang máy hút và thuốc diệt mọt', '110 Đường Kho, Q10, TP.HCM', false);

-- 3. job_materials (mỗi job 2-3 vật tư/hóa chất)
INSERT INTO public.job_materials (job_id, material_id, required_quantity) VALUES
(101, '660e8400-e29b-41d4-a716-446655440003', 2),
(101, '660e8400-e29b-41d4-a716-446655440006', 5),
(102, '660e8400-e29b-41d4-a716-446655440004', 500),
(102, '660e8400-e29b-41d4-a716-446655440006', 3),
(103, '660e8400-e29b-41d4-a716-446655440006', 5),
(103, '660e8400-e29b-41d4-a716-446655440003', 1),
(104, '660e8400-e29b-41d4-a716-446655440003', 3),
(104, '660e8400-e29b-41d4-a716-446655440005', 1),
(105, '660e8400-e29b-41d4-a716-446655440006', 3),
(105, '660e8400-e29b-41d4-a716-446655440002', 1),
(106, '660e8400-e29b-41d4-a716-446655440005', 1),
(106, '660e8400-e29b-41d4-a716-446655440002', 0.5),
(107, '660e8400-e29b-41d4-a716-446655440004', 200),
(107, '660e8400-e29b-41d4-a716-446655440006', 2),
(108, '660e8400-e29b-41d4-a716-446655440002', 2),
(108, '660e8400-e29b-41d4-a716-446655440003', 1),
(109, '660e8400-e29b-41d4-a716-446655440002', 3),
(110, '660e8400-e29b-41d4-a716-446655440003', 1),
(110, '660e8400-e29b-41d4-a716-446655440006', 2);

-- 4. job_checklist_items (2-3 checklist phù hợp)
INSERT INTO public.job_checklist_items (job_id, checklist_id) VALUES
(101, '96dc9588-1851-4ed3-9f6f-b3d178d3b83d'),
(101, '770e8400-e29b-41d4-a716-446655440002'),
(102, '770e8400-e29b-41d4-a716-446655440005'),
(102, '770e8400-e29b-41d4-a716-446655440006'),
(103, '814e098c-c9ec-4206-aa92-fc9b2bba62f4'),
(103, '83dcc388-21a3-4981-8a75-e4c5f0015a7c'),
(104, '770e8400-e29b-41d4-a716-446655440004'),
(104, '770e8400-e29b-41d4-a716-446655440006'),
(105, 'e165e2e1-ddfd-4ebf-a25c-43e7ee42bf15'),
(105, '770e8400-e29b-41d4-a716-446655440002'),
(106, '96dc9588-1851-4ed3-9f6f-b3d178d3b83d'),
(106, '770e8400-e29b-41d4-a716-446655440006'),
(107, '770e8400-e29b-41d4-a716-446655440005'),
(107, '770e8400-e29b-41d4-a716-446655440006'),
(108, '770e8400-e29b-41d4-a716-446655440002'),
(108, '770e8400-e29b-41d4-a716-446655440004'),
(109, '770e8400-e29b-41d4-a716-446655440002'),
(109, '770e8400-e29b-41d4-a716-446655440006'),
(110, '83dcc388-21a3-4981-8a75-e4c5f0015a7c'),
(110, '96dc9588-1851-4ed3-9f6f-b3d178d3b83d');


-- 5. job_assignments (mỗi job 1-2 kỹ thuật viên)
INSERT INTO public.job_assignments (job_id, technician_id, status) VALUES
-- Job 101: 2 KTV
(101, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'assigned'),
(101, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'assigned'),

-- Job 102: 1 KTV
(102, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'assigned'),

-- Job 103: 2 KTV
(103, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'assigned'),
(103, '62fa0954-7e9f-421d-9407-8a3175b80913', 'assigned'),

-- Job 104: 1 KTV
(104, '62fa0954-7e9f-421d-9407-8a3175b80913', 'assigned'),

-- Job 105: 2 KTV
(105, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'assigned'),
(105, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'assigned'),

-- Job 106: 1 KTV
(106, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'assigned'),

-- Job 107: 2 KTV
(107, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'assigned'),
(107, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'assigned'),

-- Job 108: 1 KTV
(108, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'assigned'),

-- Job 109: 2 KTV
(109, '62fa0954-7e9f-421d-9407-8a3175b80913', 'assigned'),
(109, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'assigned'),

-- Job 110: 1 KTV
(110, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'assigned');


-- 1. Báo cáo công việc (work_reports)
INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(101, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'nhanvien1@gmail.com', '2025-08-25 08:05+07', '2025-08-25 10:55+07', 'Phun thuốc mối toàn khu vực, đã xử lý các điểm mối xâm nhập.'),
(101, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'nhanvien2@gmail.com', '2025-08-25 08:00+07', '2025-08-25 10:50+07', 'Phụ trách khu vực kho gỗ và vận hành máy phun.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(102, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'nhanvien2@gmail.com', '2025-08-25 13:02+07', '2025-08-25 14:25+07', 'Phun thuốc gián, đặc biệt khu vực kho và bếp.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(103, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'nhanvien3@gmail.com', '2025-08-26 08:02+07', '2025-08-26 09:55+07', 'Đặt bẫy chuột 5 vị trí.'),
(103, '62fa0954-7e9f-421d-9407-8a3175b80913', 'nhanvien4@gmail.com', '2025-08-26 08:05+07', '2025-08-26 10:00+07', 'Kiểm tra các vị trí mối nguy chuột.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(104, '62fa0954-7e9f-421d-9407-8a3175b80913', 'nhanvien4@gmail.com', '2025-08-26 14:03+07', '2025-08-26 15:55+07', 'Phun thuốc muỗi xung quanh sân trường.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(105, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'nhanvien5@gmail.com', '2025-08-27 08:00+07', '2025-08-27 09:20+07', 'Phun thuốc và đặt bẫy ruồi tại khu vực bếp.'),
(105, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'nhanvien1@gmail.com', '2025-08-27 08:05+07', '2025-08-27 09:25+07', 'Vệ sinh khu vực bàn ăn và đặt bẫy.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(106, '7e3ebcf0-6995-471c-8928-65e3ce9e1d4e', 'nhanvien1@gmail.com', '2025-08-27 10:03+07', '2025-08-27 11:00+07', 'Kiểm tra mối mọt ở hành lang, không phát hiện ổ mối.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(107, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'nhanvien2@gmail.com', '2025-08-28 08:00+07', '2025-08-28 08:55+07', 'Phun thuốc kiến đỏ quanh kệ hàng.'),
(107, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'nhanvien3@gmail.com', '2025-08-28 08:02+07', '2025-08-28 09:00+07', 'Phun tại khu vực kho và cửa ra vào.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(108, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'nhanvien3@gmail.com', '2025-08-28 14:05+07', '2025-08-28 15:55+07', 'Vệ sinh chuồng trại và phun thuốc trừ ruồi muỗi.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(109, '62fa0954-7e9f-421d-9407-8a3175b80913', 'nhanvien4@gmail.com', '2025-08-29 08:04+07', '2025-08-29 09:20+07', 'Phun khử trùng kho bao bì.'),
(109, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'nhanvien5@gmail.com', '2025-08-29 08:02+07', '2025-08-29 09:25+07', 'Hỗ trợ kéo dây điện cho quạt thông gió.');

INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes) VALUES
(110, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'nhanvien5@gmail.com', '2025-08-29 14:02+07', '2025-08-29 15:50+07', 'Hút mọt gạo trong kho, xử lý xung quanh.');


-- Sử dụng SELECT để lấy đúng report_id
INSERT INTO public.job_report_images (report_id, image_url) VALUES
((SELECT id FROM public.work_reports WHERE job_id=101 AND user_id='7e3ebcf0-6995-471c-8928-65e3ce9e1d4e' LIMIT 1), 'https://example.com/images/report101_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=101 AND user_id='7e3ebcf0-6995-471c-8928-65e3ce9e1d4e' LIMIT 1), 'https://example.com/images/report101_2.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=101 AND user_id='eeaa680d-4dc7-46a4-9026-ddc70db72afe' LIMIT 1), 'https://example.com/images/report101_3.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=102 AND user_id='eeaa680d-4dc7-46a4-9026-ddc70db72afe' LIMIT 1), 'https://example.com/images/report102_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=103 AND user_id='cff541be-9c8d-4412-ba99-cd5d87c5b982' LIMIT 1), 'https://example.com/images/report103_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=103 AND user_id='62fa0954-7e9f-421d-9407-8a3175b80913' LIMIT 1), 'https://example.com/images/report103_2.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=104 AND user_id='62fa0954-7e9f-421d-9407-8a3175b80913' LIMIT 1), 'https://example.com/images/report104_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=105 AND user_id='f9d54d16-dcbb-4d13-ad2b-5582d41c7343' LIMIT 1), 'https://example.com/images/report105_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=105 AND user_id='7e3ebcf0-6995-471c-8928-65e3ce9e1d4e' LIMIT 1), 'https://example.com/images/report105_2.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=106 AND user_id='7e3ebcf0-6995-471c-8928-65e3ce9e1d4e' LIMIT 1), 'https://example.com/images/report106_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=107 AND user_id='eeaa680d-4dc7-46a4-9026-ddc70db72afe' LIMIT 1), 'https://example.com/images/report107_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=107 AND user_id='cff541be-9c8d-4412-ba99-cd5d87c5b982' LIMIT 1), 'https://example.com/images/report107_2.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=108 AND user_id='cff541be-9c8d-4412-ba99-cd5d87c5b982' LIMIT 1), 'https://example.com/images/report108_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=109 AND user_id='62fa0954-7e9f-421d-9407-8a3175b80913' LIMIT 1), 'https://example.com/images/report109_1.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=109 AND user_id='f9d54d16-dcbb-4d13-ad2b-5582d41c7343' LIMIT 1), 'https://example.com/images/report109_2.jpg'),
((SELECT id FROM public.work_reports WHERE job_id=110 AND user_id='f9d54d16-dcbb-4d13-ad2b-5582d41c7343' LIMIT 1), 'https://example.com/images/report110_1.jpg');

-- 3. Checklist hoàn thành
UPDATE public.job_checklist_items
SET completed = true, completed_at = now(), notes = 'Hoàn thành theo kế hoạch'
WHERE job_id BETWEEN 101 AND 110;

-- 4. Cập nhật số lượng vật tư thực tế đã sử dụng
UPDATE public.job_materials
SET actual_quantity = required_quantity
WHERE job_id BETWEEN 101 AND 110;


-- =================
-- JOBS chưa hoàn thành (111-113)
-- =================
INSERT INTO public.jobs (id, customer_id, user_id, job_description, status, scheduled_date, service_type, job_content, scheduled_time, contact_person, contact_phone, special_requests, address, completed)
VALUES
(111, 'c1111111-e29b-41d4-a716-446655440002', 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 
 'Phun thuốc diệt muỗi nhà kho', 'Đã giao', '2025-09-01 08:00+07', 'Diệt côn trùng', 'Phun thuốc muỗi quanh kho', '08:00 - 09:30',
 'Chị Hiền', '0901111002', 'Mang khẩu trang và kính bảo hộ.', '102 Đường Hoa, Q2, TP.HCM', false),

(112, 'c1111111-e29b-41d4-a716-446655440005', 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 
 'Đặt bẫy chuột quán ăn', 'Đã giao', '2025-09-02 14:00+07', 'Diệt côn trùng', 'Đặt bẫy chuột khu bếp và kho', '14:00 - 15:30',
 'Anh Sơn', '0901111005', 'Sử dụng bẫy an toàn cho thú cưng.', '105 Đường Biển, Q5, TP.HCM', false),

(113, 'c1111111-e29b-41d4-a716-446655440010', 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 
 'Xử lý mối tạm thời kho gạo', 'Đã giao', '2025-09-03 09:00+07', 'Diệt côn trùng', 'Kiểm tra và xử lý ổ mối nhỏ', '09:00 - 10:00',
 'Anh Nam', '0901111010', 'Mang thuốc diệt mối và đèn pin.', '110 Đường Kho, Q10, TP.HCM', false);

-- =================
-- JOB_MATERIALS (thiếu actual_quantity)
-- =================
INSERT INTO public.job_materials (job_id, material_id, required_quantity, actual_quantity) VALUES
(111, '660e8400-e29b-41d4-a716-446655440003', 2, 1),
(111, '660e8400-e29b-41d4-a716-446655440005', 1, 0.5),
(112, '660e8400-e29b-41d4-a716-446655440006', 4, 2),
(112, '660e8400-e29b-41d4-a716-446655440003', 1, 0.8),
(113, '660e8400-e29b-41d4-a716-446655440003', 1.5, 0),
(113, '660e8400-e29b-41d4-a716-446655440005', 1, 0);

-- =================
-- JOB_CHECKLIST_ITEMS (một số chưa completed)
-- =================
INSERT INTO public.job_checklist_items (job_id, checklist_id, completed, notes) VALUES
(111, '770e8400-e29b-41d4-a716-446655440004', true, 'Đã phun khu vực chính'),
(111, '770e8400-e29b-41d4-a716-446655440002', false, 'Chưa vệ sinh xong'),
(112, '814e098c-c9ec-4206-aa92-fc9b2bba62f4', true, 'Đặt 2 bẫy'),
(112, '770e8400-e29b-41d4-a716-446655440002', false, 'Chưa vệ sinh cuối ca'),
(113, '96dc9588-1851-4ed3-9f6f-b3d178d3b83d', false, 'Mới xử lý một phần'),
(113, '770e8400-e29b-41d4-a716-446655440006', false, 'Chưa kiểm tra khe hở');

-- =================
-- JOB_ASSIGNMENTS
-- =================
INSERT INTO public.job_assignments (job_id, technician_id, status) VALUES
(111, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'assigned'),
(112, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'assigned'),
(113, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'assigned');

-- =================
-- WORK_REPORTS (có job chỉ check-in mà chưa check-out)
-- =================
INSERT INTO public.work_reports (job_id, user_id, user_email, check_in_time, check_out_time, notes)
VALUES
(111, 'eeaa680d-4dc7-46a4-9026-ddc70db72afe', 'nhanvien2@gmail.com', '2025-09-01 08:05+07', NULL, 'Mới phun được 50% diện tích, khách yêu cầu hoãn do trời mưa.'),
(112, 'f9d54d16-dcbb-4d13-ad2b-5582d41c7343', 'nhanvien5@gmail.com', '2025-09-02 14:05+07', '2025-09-02 14:40+07', 'Đặt bẫy xong nhưng chưa tổng vệ sinh.'),
(113, 'cff541be-9c8d-4412-ba99-cd5d87c5b982', 'nhanvien3@gmail.com', '2025-09-03 09:05+07', NULL, 'Đang làm dở, thiếu vật tư.');

-- =================
-- JOB_REPORT_IMAGES (ít ảnh hoặc không có)
-- =================
INSERT INTO public.job_report_images (report_id, image_url) VALUES
( (SELECT id FROM public.work_reports WHERE job_id=111 LIMIT 1), 'https://example.com/images/job111_partial.jpg' ),
( (SELECT id FROM public.work_reports WHERE job_id=112 LIMIT 1), 'https://example.com/images/job112_trap.jpg' );
