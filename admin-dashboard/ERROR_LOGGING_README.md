# Hệ Thống Nhật Ký Lỗi

Hệ thống nhật ký lỗi giúp theo dõi và quản lý các lỗi xảy ra trong ứng dụng, cung cấp cái nhìn tổng quan về tình trạng hoạt động của phần mềm.

## Tính Năng

- **Ghi nhận lỗi tự động**: Tự động bắt và ghi nhận các lỗi JavaScript chưa được xử lý
- **Phân loại lỗi**: Hỗ trợ 3 mức độ: Error (Lỗi), Warning (Cảnh báo), Info (Thông tin)
- **Thông tin chi tiết**: Ghi nhận stack trace, URL, user agent, dữ liệu request/response
- **Giao diện quản lý**: Trang web để xem, lọc và quản lý các logs
- **Đánh dấu đã xử lý**: Theo dõi trạng thái xử lý của từng lỗi

## Cấu Trúc Database

Bảng `error_logs` chứa các trường:
- `id`: UUID tự động
- `level`: Mức độ ('error', 'warning', 'info')
- `message`: Thông điệp lỗi
- `stack_trace`: Stack trace chi tiết
- `user_id`: ID người dùng (nếu có)
- `user_agent`: Thông tin trình duyệt
- `url`: URL nơi xảy ra lỗi
- `method`: Phương thức HTTP (nếu có)
- `ip_address`: Địa chỉ IP
- `request_data`: Dữ liệu request (JSON)
- `response_data`: Dữ liệu response (JSON)
- `timestamp`: Thời gian xảy ra
- `resolved`: Đã xử lý chưa
- `resolved_at`: Thời gian xử lý
- `resolved_by`: Người xử lý
- `notes`: Ghi chú

## Cách Sử Dung

### 1. Ghi Lỗi Thủ Công

```javascript
import ErrorLogger from '../utils/ErrorLogger';

// Ghi lỗi
try {
  // Code có thể gây lỗi
} catch (error) {
  ErrorLogger.logError(error, {
    component: 'MyComponent',
    action: 'someAction',
    userId: currentUser?.id
  });
}

// Ghi cảnh báo
ErrorLogger.logWarning('Cảnh báo về validation', {
  field: 'email',
  reason: 'Invalid format'
});

// Ghi thông tin
ErrorLogger.logInfo('User logged in', {
  userId: user.id,
  loginMethod: 'email'
});
```

### 2. Tích Hợp Với API Calls

```javascript
import ErrorLogger from '../utils/ErrorLogger';

// Trong service/api file
const apiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    ErrorLogger.logError(error, {
      url: url,
      method: options?.method || 'GET',
      requestData: options?.body,
      userId: currentUser?.id
    });
    throw error;
  }
};
```

### 3. Xem Nhật Ký Lỗi

Truy cập trang `/error-logs` trong ứng dụng để:
- Xem danh sách tất cả logs
- Lọc theo mức độ, trạng thái, thời gian
- Tìm kiếm theo từ khóa
- Xem chi tiết từng log
- Đánh dấu đã xử lý

## Khởi Tạo Hệ Thống

Hệ thống tự động khởi tạo trong `App.js`:

```javascript
import ErrorLogger from './utils/ErrorLogger';

// Trong useEffect
ErrorLogger.setupGlobalErrorHandler();
```

Điều này sẽ:
- Bắt các lỗi JavaScript chưa được xử lý
- Bắt các promise rejection chưa được xử lý
- Gửi logs về server

## Lưu Ý Bảo Mật

- Không ghi nhận thông tin nhạy cảm trong logs
- Xem xét quyền truy cập trang error logs (chỉ admin)
- Định kỳ dọn dẹp logs cũ để tiết kiệm dung lượng

## Mở Rộng

Có thể mở rộng hệ thống bằng cách:
- Thêm tích hợp với các dịch vụ monitoring bên ngoài (Sentry, LogRocket)
- Gửi thông báo real-time khi có lỗi nghiêm trọng
- Phân tích logs để tạo báo cáo
- Tự động tạo ticket support từ logs
