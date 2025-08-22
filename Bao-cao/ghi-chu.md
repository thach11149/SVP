🔗 Tổng Quan Hệ Thống Sao Việt Pest
🏢 Phần mềm 1: Admin Dashboard (Quản lý)
Đối tượng sử dụng: Quản lý, Admin Chức năng chính:

✅ Quản lý khách hàng (CRUD)
📅 Lập kế hoạch & phân công công việc
👥 Quản lý nhân viên kỹ thuật
📊 Theo dõi lịch làm việc trên calendar
✅ Tạo checklist mẫu
📦 Quản lý vật tư/hóa chất
📋 Xem danh sách tất cả công việc và trạng thái
📱 Phần mềm 2: Technician App (Kỹ thuật viên)
Đối tượng sử dụng: Kỹ thuật viên tại hiện trường Chức năng chính:

📋 Xem danh sách công việc được giao
🔍 Chi tiết từng công việc (khách hàng, địa chỉ, yêu cầu)
📞 Liên hệ khách hàng (gọi điện, Zalo)
🧪 Quản lý hóa chất hàng ngày
⏰ Check-in/Check-out tại hiện trường
✅ Thực hiện checklist công việc
📝 Báo cáo hiện trường (ghi chú, hình ảnh)
📦 Báo cáo vật tư sử dụng
🔄 Luồng Thông Tin Giữa Hai Hệ Thống
1. Luồng Phân Công Công Việc:
2. Luồng Quản Lý Hóa Chất:
3. Luồng Thực Hiện Công Việc:
4. Cơ Sở Dữ Liệu Chung (Supabase):
🎯 Điểm Mạnh Của Hệ Thống
Từ góc độ Quản lý:
📊 Theo dõi real-time tiến độ công việc
👥 Phân công linh hoạt (cá nhân/nhóm)
📅 Quản lý lịch trình trực quan
📈 Báo cáo tổng hợp từ hiện trường
Từ góc độ Kỹ thuật viên:
📱 Giao diện di động thân thiện
🧪 Quản lý hóa chất thông minh
✅ Checklist số hóa
📞 Liên hệ khách hàng tiện lợi
🔍 Thông tin chi tiết đầy đủ
Tính năng nổi bật:
🤝 Team Work Management: Phân biệt rõ vai trò Team Lead/Member
🧪 Smart Chemical Management: Tự động tính toán theo nhóm/cá nhân
📍 GPS Tracking: Check-in/out với tọa độ
📱 Offline-ready: Có thể hoạt động khi mất mạng
🔄 Real-time Sync: Đồng bộ dữ liệu tức thời


📊 BIỂU ĐỒ CẦN VẼ (DIAGRAMS)
1. Section 2.2 - Yêu cầu phần mềm:
5 DFD (Data Flow Diagrams):
✅ DFD cho Leader giao việc
✅ DFD cho KTV xác nhận và cập nhật báo cáo
✅ DFD cho chức năng "Quản lý Kho"
✅ DFD cho chức năng "Quản lý Công tác phí"
✅ DFD cho chức năng "Báo cáo và Thống kê"
2. Section 2.3 - Thiết kế hệ thống:
Sơ đồ Kiến trúc hệ thống:
✅ Architecture Diagram - Mô hình 3 lớp (3-tier architecture)
Hiển thị Presentation Layer, Application Layer, Data Layer
Kết nối giữa Frontend Admin Dashboard, Frontend Technician App
API Gateway, Authentication Service, Database, External APIs
3. Section 2.4 - Thiết kế dữ liệu:
ERD (Entity Relationship Diagram):
✅ Sơ đồ ERD hoàn chỉnh với 10 bảng chính
Các thực thể: NHANVIEN, KHACHHANG, CONGVIEC, BAOCAOCONGVIEC, VATTU, v.v.
Mối quan hệ 1:1, 1:N, N:M giữa các bảng
Primary Key, Foreign Key, attributes
4. Section 2.5 - Thiết kế giao diện:
Sơ đồ liên kết màn hình:
✅ Screen Flow Diagram cho Admin Dashboard
✅ Screen Flow Diagram cho Technician App
Luồng điều hướng giữa các màn hình
Wireframes/Mockups:
✅ Screenshot màn hình Lập kế hoạch và Phân công
✅ Screenshot màn hình Báo cáo Công tác Hiện trường
5. Section 2.6 - Cài đặt và thử nghiệm:
Biểu đồ tiến độ:
✅ Progress Chart - Biểu đồ % hoàn thành các chức năng
📋 BẢNG ĐÃ CÓ (TABLES)
Section 2.2:
✅ Bảng trách nhiệm cho từng loại yêu cầu (3 rows)
Section 2.3:
✅ Bảng mô tả các thành phần trong hệ thống (9 components)
Section 2.4:
✅ Bảng danh sách các bảng dữ liệu (10 tables)
✅ Bảng mô tả chi tiết từng bảng dữ liệu (4 bảng chính)
Section 2.5:
✅ Bảng danh sách các màn hình (10 screens)
✅ Bảng mô tả đối tượng trên màn hình (2 màn hình)
✅ Bảng biến cố và xử lý (2 màn hình)
Section 2.6:
✅ Bảng tiến độ cài đặt các chức năng (12 functions)
Section 2.11:
✅ Bảng phân công công việc (4 thành viên x 12 tasks)