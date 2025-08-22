# Hướng dẫn sử dụng cấu trúc báo cáo

## Cấu trúc thư mục
```
Bao-cao/
├── bao-cao-complete.html       # File báo cáo hoàn chỉnh (KHUYÊN DÙNG)
├── index.html                  # File chính kết hợp tất cả sections (cần server)
├── bao-cao.html               # File báo cáo gốc (backup)
├── start-server.bat           # Script khởi động server (Windows)
├── start-server.sh            # Script khởi động server (Mac/Linux)
├── README.md                  # Hướng dẫn này
├── assets/
│   └── styles.css             # CSS chung cho toàn bộ báo cáo
└── sections/
    ├── header.html                     # Header của báo cáo
    ├── section1-hinh-thuc.html         # 1. Hình thức trình bày
    ├── section2.1-gioi-thieu.html      # 2.1. Giới thiệu bài toán
    ├── section2.2-yeu-cau.html         # 2.2. Yêu cầu phần mềm
    ├── section2.3-thiet-ke-he-thong.html    # 2.3. Thiết kế hệ thống
    ├── section2.4-thiet-ke-du-lieu.html     # 2.4. Thiết kế dữ liệu
    ├── section2.4.4-mo-ta-bang.html         # 2.4.4. Mô tả bảng
    ├── section2.5-thiet-ke-giao-dien.html   # 2.5. Thiết kế giao diện
    ├── section2.5.3-mo-ta-man-hinh.html     # 2.5.3. Mô tả màn hình
    ├── section2.6-cai-dat-thu-nghiem.html   # 2.6. Cài đặt và thử nghiệm
    ├── section2.7-2.10-ket-luan.html        # 2.7-2.10. Kết luận
    ├── section2.11-phan-cong.html           # 2.11. Phân công công việc
    └── section3-thoi-gian.html              # 3. Thời gian thực hiện
```

## Cách sử dụng

### 1. Xem báo cáo hoàn chỉnh (Khuyên dùng)
- Mở file `bao-cao-complete.html` trong trình duyệt
- Tất cả nội dung đã được tích hợp sẵn

### 2. Sử dụng cấu trúc modular (Cần local server)
- **Cách A:** Double-click file `start-server.bat` (Windows) hoặc `start-server.sh` (Mac/Linux)
- **Cách B:** Mở terminal và chạy: `python -m http.server 8000`
- Sau đó mở trình duyệt và vào: `http://localhost:8000`
- Click vào `index.html` để xem báo cáo modular

### 3. Chỉnh sửa từng phần riêng biệt
- Để sửa phần nào, chỉ cần mở file tương ứng trong thư mục `sections/`
- Ví dụ: 
  - Sửa phần giới thiệu → mở `sections/section2.1-gioi-thieu.html`
  - Sửa phần thiết kế DB → mở `sections/section2.4-thiet-ke-du-lieu.html`

### 3. Thêm nội dung mới
- Thêm text, table, hình ảnh vào file section tương ứng
- Sử dụng các class CSS có sẵn: `.highlight`, `.note`, `.algorithm`, v.v.

### 4. Thay đổi style
- Sửa file `assets/styles.css` để thay đổi giao diện chung
- Style sẽ áp dụng cho toàn bộ báo cáo

## Ưu điểm của cấu trúc này

### ✅ Dễ quản lý
- Mỗi section là 1 file riêng → chỉ sửa phần cần thiết
- Không cần scroll qua toàn bộ file dài

### ✅ Hiệu suất tốt hơn
- Chỉ load section đang sửa
- Giảm thời gian mở file trong editor

### ✅ Làm việc nhóm hiệu quả
- Mỗi thành viên có thể sửa section riêng
- Tránh conflict khi merge code

### ✅ Backup an toàn
- File gốc được giữ nguyên
- Có thể rollback dễ dàng

### ✅ Tái sử dụng
- CSS và header có thể dùng cho các báo cáo khác
- Template sections có thể copy cho project mới

## Lưu ý khi sử dụng

1. **Khi thêm hình ảnh:** Tạo thư mục `assets/images/` và tham chiếu đúng đường dẫn
2. **Khi in PDF:** Mở `index.html` và dùng Print → Save as PDF
3. **Khi chia sẻ:** Có thể zip toàn bộ thư mục Bao-cao hoặc chỉ gửi file cần sửa
4. **Backup:** Thường xuyên backup thư mục `sections/` vào Git

## Mẹo sử dụng

- Dùng VS Code với Live Server extension để xem preview realtime
- Sử dụng Git để theo dõi thay đổi từng section
- Tạo branch riêng cho mỗi section lớn
- Comment code HTML để dễ tìm vị trí cần sửa
