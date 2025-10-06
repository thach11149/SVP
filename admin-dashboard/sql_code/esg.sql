-- 1. Bảng cơ sở: Thông tin Khách hàng/Địa điểm Dịch vụ (Site)
CREATE TABLE sites (
    site_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    service_area_m2 NUMERIC, -- Diện tích phục vụ (để tính cường độ)
    industry VARCHAR(100), -- Ngành nghề (Nhà máy, Khách sạn, Nhà hàng,...)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng cơ sở: Thông tin Nhân viên (Bao gồm Kỹ thuật viên)
CREATE TABLE employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL, -- Chức vụ (Kỹ thuật viên, Quản lý,...)
    hire_date DATE NOT NULL,
    gender VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    license_expiry_date DATE, -- Ngày hết hạn giấy phép Kỹ thuật viên (cho KPI G7)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng cơ sở: Nhật ký Công việc Dịch vụ (Job)
CREATE TABLE jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(site_id),
    technician_id UUID REFERENCES employees(employee_id),
    service_date TIMESTAMP WITH TIME ZONE NOT NULL,
    job_description TEXT,
    is_ipm_applied BOOLEAN DEFAULT FALSE, -- KPI E2: Tỷ lệ áp dụng IPM
    service_duration_hours NUMERIC,
    is_rework_needed BOOLEAN DEFAULT FALSE, -- Để tính Tỷ lệ Thành công lần đầu (KPI S6)
    customer_signature_method VARCHAR(50), -- Phương thức ký (Điện tử/Giấy/Không ký - cho KPI G8)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------------
-- A. TRỤ CỘT MÔI TRƯỜNG (E)
-----------------------------------------------------------

-- 4. KPI E1: Cường độ sử dụng Hóa chất
CREATE TABLE e_chemical_usage (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(job_id),
    chemical_name VARCHAR(255) NOT NULL,
    active_ingredient_mass_kg NUMERIC NOT NULL, -- Khối lượng hoạt chất chính (KPI E1)
    quantity_liters NUMERIC,
    impact_level VARCHAR(50), -- Mức độ độc hại (Cao/Trung bình/Thấp)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. KPI E3, E4: Phát thải, Nhiên liệu tiêu thụ (Logistics)
CREATE TABLE e_logistics_fuel (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES employees(employee_id),
    log_date DATE NOT NULL,
    distance_km NUMERIC NOT NULL,
    fuel_consumed_liters NUMERIC NOT NULL,
    vehicle_type VARCHAR(100),
    co2e_tons NUMERIC, -- Lượng CO2e tính toán (tấn) (KPI E3)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. KPI E5: Quản lý Chất thải Nguy hại
CREATE TABLE e_waste_management (
    waste_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES sites(site_id), -- Địa điểm phát sinh (kho/văn phòng)
    report_date DATE NOT NULL,
    waste_type VARCHAR(100) NOT NULL, -- Ví dụ: Hazardous Chemical Waste, Non-Hazardous Office Waste
    mass_kg NUMERIC NOT NULL,
    is_recycled BOOLEAN DEFAULT FALSE, -- Được tái chế/xử lý hợp pháp (KPI E5)
    treatment_partner VARCHAR(255), -- Đơn vị xử lý
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------------
-- B. TRỤ CỘT XÃ HỘI (S)
-----------------------------------------------------------

-- 7. KPI S6: An toàn Lao động (LTIFR/TRIR)
CREATE TABLE s_hse_incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id),
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_type VARCHAR(100), -- Ví dụ: Tai nạn hóa chất, Tai nạn trượt ngã
    is_lost_time BOOLEAN DEFAULT FALSE, -- Có gây mất thời gian làm việc không (cho LTIFR/TRIR)
    lost_days NUMERIC DEFAULT 0, -- Số ngày nghỉ do tai nạn
    is_fatality BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. KPI S7: Giờ Đào tạo Nhân viên
CREATE TABLE s_training_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id),
    training_date DATE NOT NULL,
    training_topic VARCHAR(255) NOT NULL, -- Ví dụ: An toàn Hóa chất, Kỹ thuật IPM
    hours NUMERIC NOT NULL, -- Số giờ đào tạo (KPI S7)
    completion_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. KPI S8: Khiếu nại Dịch vụ/Cộng đồng
CREATE TABLE s_grievances (
    grievance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(site_id),
    reported_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(100), -- Ví dụ: An toàn Hóa chất, Chất lượng Dịch vụ, Tiếng ồn
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------------
-- C. TRỤ CỘT QUẢN TRỊ (G)
-----------------------------------------------------------

-- 10. KPI G10: Vi phạm Pháp luật Môi trường/Tuân thủ (GRI 307-1)
CREATE TABLE g_compliance_violations (
    violation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_date DATE NOT NULL,
    regulation_type VARCHAR(100), -- Ví dụ: Môi trường, Lao động, Thuế
    description TEXT,
    fine_amount_vnd NUMERIC, -- Số tiền phạt (nếu có)
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. KPI G11: Chứng nhận Hệ thống Quản lý
CREATE TABLE g_certifications (
    cert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_type VARCHAR(100) NOT NULL, -- Ví dụ: ISO 14001, ISO 45001, ISO 9001
    status VARCHAR(50) NOT NULL, -- Ví dụ: Certified, In Progress, Expired
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. KPI G12: Phân tích Rủi ro Khách hàng (IFS Guideline)
CREATE TABLE g_risk_assessments (
    ra_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(site_id),
    assessment_date DATE NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE, -- Đã hoàn thành phân tích rủi ro IPM (KPI G12)
    next_review_date DATE,
    assessor_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. KPI G13: Liêm chính và Chống Tham nhũng (GRI 205-3)
CREATE TABLE g_anti_corruption_incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_date DATE NOT NULL,
    incident_type VARCHAR(100), -- Ví dụ: Bribery, Conflict of Interest
    is_confirmed BOOLEAN DEFAULT FALSE, -- Vụ việc đã được xác nhận
    resolution_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);