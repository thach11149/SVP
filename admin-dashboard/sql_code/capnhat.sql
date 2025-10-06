BEGIN;

----------------------------------------------------
-- BƯỚC 1: TẠO BẢNG sites (Địa điểm Dịch vụ)
----------------------------------------------------
CREATE TABLE public.sites (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    customer_id uuid NOT NULL, -- Liên kết 1 Khách hàng có Nhiều Địa điểm
    site_code text NULL, -- Mã địa điểm (có thể dùng sau này)
    site_name text NOT NULL, -- Tên địa điểm (vd: Nhà máy số 1, Chi nhánh Gò Vấp)
    google_map_code text NULL,
    address text NULL,
    ward smallint NULL,
    district smallint NULL,
    province smallint NULL,
    ward_name text NULL,
    district_name text NULL,
    province_name text NULL,
    site_contact_name text NULL,
    site_contact_position text NULL,
    site_contact_phone text NULL,
    notes text NULL, -- Ghi chú riêng cho địa điểm này
    created_at timestamp with time zone NULL DEFAULT timezone ('Asia/Ho_Chi_Minh'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone ('Asia/Ho_Chi_Minh'::text, now()),
    
    CONSTRAINT sites_pkey PRIMARY KEY (id),
    CONSTRAINT sites_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sites_customer_id ON public.sites USING btree (customer_id) TABLESPACE pg_default;


----------------------------------------------------
-- BƯỚC 2: DI CHUYỂN DỮ LIỆU ĐỊA ĐIỂM TỪ customers SANG sites
----------------------------------------------------
INSERT INTO public.sites (
    customer_id,
    site_name,
    google_map_code,
    address,
    ward, district, province,
    ward_name, district_name, province_name,
    site_contact_name,
    site_contact_position,
    site_contact_phone,
    created_at
)
SELECT
    id AS customer_id,
    COALESCE(site_name, name) AS site_name, -- Nếu site_name cũ NULL, dùng Tên KH làm tên địa điểm mặc định
    google_map_code,
    address,
    ward, district, province,
    ward_name, district_name, province_name,
    site_contact_name,
    site_contact_position,
    site_contact_phone,
    created_at
FROM public.customers;


----------------------------------------------------
-- BƯỚC 3: CẬP NHẬT RÀNG BUỘC VÀ XÓA CỘT THỪA
----------------------------------------------------

-- 3a. Thêm cột site_id vào bảng customer_service_plans
ALTER TABLE public.customer_service_plans
ADD COLUMN site_id uuid NULL; 

-- 3b. Cập nhật site_id cho các Kế hoạch dịch vụ đã tồn tại
-- (Vì lúc này mỗi customer_id chỉ tạo ra 1 site_id duy nhất)
UPDATE public.customer_service_plans csp
SET site_id = s.id
FROM public.sites s
WHERE csp.customer_id = s.customer_id;

-- 3c. Thiết lập ràng buộc NOT NULL và Foreign Key cho site_id
ALTER TABLE public.customer_service_plans
ALTER COLUMN site_id SET NOT NULL;

ALTER TABLE public.customer_service_plans
ADD CONSTRAINT customer_service_plans_site_id_fkey
FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_customer_service_plans_site_id ON public.customer_service_plans USING btree (site_id) TABLESPACE pg_default;

-- 3d. Xóa cột customer_id khỏi customer_service_plans (TÙY CHỌN, nhưng nên làm)
-- Trong mô hình mới, customer_service_plans liên kết với sites, và sites liên kết với customers.
-- Giữ lại customer_id ở đây chỉ để tiện truy vấn nhanh. Tùy theo nhu cầu, bạn có thể xóa nó.
-- ALTER TABLE public.customer_service_plans DROP COLUMN customer_id; 

-- 3e. Xóa các cột Địa điểm/Liên hệ thừa khỏi bảng customers
ALTER TABLE public.customers
    DROP COLUMN google_map_code,
    DROP COLUMN address,
    DROP COLUMN ward,
    DROP COLUMN district,
    DROP COLUMN province,
    DROP COLUMN site_contact_name,
    DROP COLUMN site_contact_position,
    DROP COLUMN site_contact_phone,
    DROP COLUMN province_name,
    DROP COLUMN district_name,
    DROP COLUMN ward_name,
    DROP COLUMN site_name;

-- 3f. (Nếu đã thêm ở lần trước) Xóa site_name khỏi customer_service_plans
ALTER TABLE public.customer_service_plans
    DROP COLUMN IF EXISTS site_name;

COMMIT;