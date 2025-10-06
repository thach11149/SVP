-- Tạo bảng inventory cho quản lý tồn kho hóa chất và vật tư
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    chemical_code VARCHAR(20) UNIQUE NOT NULL, -- Mã HC
    chemical_name VARCHAR(255) NOT NULL, -- Tên Hóa Chất
    active_ingredient VARCHAR(255), -- Hoạt Chất
    unit VARCHAR(10) NOT NULL, -- ĐVT
    opening_stock DECIMAL(10,2) DEFAULT 0, -- Tồn Đầu Kỳ
    imported_quantity DECIMAL(10,2) DEFAULT 0, -- Lượng Nhập Thêm
    exported_quantity DECIMAL(10,2) DEFAULT 0, -- Lượng Xuất KTV
    current_stock DECIMAL(10,2) GENERATED ALWAYS AS (opening_stock + imported_quantity - exported_quantity) STORED, -- Tồn Kho Hiện Tại
    min_stock DECIMAL(10,2) DEFAULT 0, -- Min Stock
    expiry_date DATE, -- HSD Gần Nhất
    average_purchase_price DECIMAL(12,2), -- Giá Mua TB
    status VARCHAR(20) DEFAULT 'OK', -- Trạng thái (OK, LOW, MIN_STOCK, EXPIRED)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng technician_inventory cho tồn kho của từng KTV
CREATE TABLE IF NOT EXISTS technician_inventory (
    id SERIAL PRIMARY KEY,
    technician_name VARCHAR(255) NOT NULL, -- Tên KTV
    chemical_code VARCHAR(20) NOT NULL, -- Mã HC
    opening_stock DECIMAL(10,2) DEFAULT 0, -- Tồn Đầu KTV
    received_quantity DECIMAL(10,2) DEFAULT 0, -- Lượng Nhận Thêm
    used_quantity DECIMAL(10,2) DEFAULT 0, -- Lượng Đã Dùng Job
    current_stock DECIMAL(10,2) GENERATED ALWAYS AS (opening_stock + received_quantity - used_quantity) STORED, -- Tồn Kho Hiện Tại KTV
    inventory_value DECIMAL(12,2) DEFAULT 0, -- Giá Trị Tồn
    status VARCHAR(20) DEFAULT 'OK', -- Tình Trạng (OK, SHORTAGE)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (chemical_code) REFERENCES inventory(chemical_code) ON DELETE CASCADE
);

-- Tạo bảng usage_log cho nhật ký sử dụng chi tiết theo job
CREATE TABLE IF NOT EXISTS usage_log (
    id SERIAL PRIMARY KEY,
    usage_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Thời Gian
    technician_name VARCHAR(255) NOT NULL, -- KTV
    customer_name VARCHAR(255) NOT NULL, -- Khách Hàng
    job_code VARCHAR(50), -- Mã Job
    chemical_code VARCHAR(20) NOT NULL, -- Mã HC
    chemical_name VARCHAR(255) NOT NULL, -- Tên Hóa Chất
    usage_quantity DECIMAL(10,2) NOT NULL, -- Lượng Sử Dụng
    purpose VARCHAR(255), -- Mục Đích
    report_status VARCHAR(20) DEFAULT 'Chờ duyệt', -- Trạng Thái BCCT (Chờ duyệt, Đã ký)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (chemical_code) REFERENCES inventory(chemical_code) ON DELETE CASCADE
);

-- Thêm dữ liệu demo vào bảng inventory
INSERT INTO inventory (chemical_code, chemical_name, active_ingredient, unit, opening_stock, imported_quantity, exported_quantity, min_stock, expiry_date, average_purchase_price, status) VALUES
('AZD240SC', 'AZENDA', 'Fipronil 2.9%', 'Lít', 50, 100, 45, 30, '2026-06-10', 850000, 'OK'),
('FEN120SC', 'FEN USD', 'Permethrin 12%', 'Lít', 20, 0, 30, 10, '2025-11-25', 450000, 'LOW'),
('BRD1KG', 'Bả Chuột', 'Brodifacoum', 'Kg', 15, 50, 10, 20, '2026-01-15', 120000, 'MIN_STOCK'),
('GLTRP', 'Bẫy Keo Chuột', NULL, 'Hộp', 150, 200, 80, 50, NULL, 25000, 'OK'),
('CYP250', 'CYP USA', 'Cypermethrin', 'Lít', 5, 0, 5, 5, '2025-01-01', 300000, 'EXPIRED');

-- Thêm dữ liệu demo vào bảng technician_inventory
INSERT INTO technician_inventory (technician_name, chemical_code, opening_stock, received_quantity, used_quantity, inventory_value, status) VALUES
('Nguyễn Văn A', 'AZD240SC', 10, 5, 3.5, 12750000, 'OK'),
('Nguyễn Văn A', 'FEN120SC', 5, 10, 8.0, 3150000, 'OK'),
('Trần Thị B', 'AZD240SC', 5, 0, 6.0, 0, 'SHORTAGE'),
('Lê Văn C', 'BRD1KG', 8, 5, 1.5, 1380000, 'OK');

-- Thêm dữ liệu demo vào bảng usage_log
INSERT INTO usage_log (usage_time, technician_name, customer_name, job_code, chemical_code, chemical_name, usage_quantity, purpose, report_status) VALUES
('2025-10-05 10:30:00+07', 'Nguyễn Văn A', 'Vincom Plaza', 'VP2025', 'AZD240SC', 'AZENDA', 0.5, 'Bơm Tổng Thể', 'Đã ký'),
('2025-10-04 15:45:00+07', 'Trần Thị B', 'Mega Mall', 'MM1120', 'FEN120SC', 'FEN USD', 1.2, 'Diệt Muỗi SOS', 'Chờ duyệt'),
('2025-10-03 09:00:00+07', 'Nguyễn Văn A', 'Techlink', 'TL998', 'BRD1KG', 'Bả Chuột', 0.2, 'Đặt Bả Chuột', 'Đã ký'),
('2025-10-02 11:15:00+07', 'Lê Văn C', 'Hoa Lan Hotel', 'HL001', 'AZD240SC', 'AZENDA', 0.8, 'Kiểm Soát Gián', 'Đã ký');

-- Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_inventory_chemical_code ON inventory(chemical_code);
CREATE INDEX IF NOT EXISTS idx_technician_inventory_technician ON technician_inventory(technician_name);
CREATE INDEX IF NOT EXISTS idx_technician_inventory_chemical ON technician_inventory(chemical_code);
CREATE INDEX IF NOT EXISTS idx_usage_log_time ON usage_log(usage_time);
CREATE INDEX IF NOT EXISTS idx_usage_log_technician ON usage_log(technician_name);
CREATE INDEX IF NOT EXISTS idx_usage_log_chemical ON usage_log(chemical_code);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technician_inventory_updated_at BEFORE UPDATE ON technician_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();