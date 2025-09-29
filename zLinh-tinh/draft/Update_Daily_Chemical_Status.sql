-- Cập nhật bảng daily_chemical_status để hỗ trợ range dates
-- Xóa constraint cũ và thêm trường mới

-- 1. Xóa constraint unique cũ
ALTER TABLE public.daily_chemical_status 
DROP CONSTRAINT IF EXISTS daily_chemical_status_user_date_unique;

-- 2. Thay đổi trường date thành text để có thể chứa cả single date và range
ALTER TABLE public.daily_chemical_status 
ALTER COLUMN date TYPE text USING date::text;

-- 3. Thêm constraint unique mới với text
ALTER TABLE public.daily_chemical_status 
ADD CONSTRAINT daily_chemical_status_user_date_unique UNIQUE (user_id, date);

-- 4. Thêm trường để phân biệt single date vs range
ALTER TABLE public.daily_chemical_status 
ADD COLUMN IF NOT EXISTS date_type text DEFAULT 'single'; -- 'single' hoặc 'range'

-- 5. Thêm trường start_date và end_date để query dễ hơn
ALTER TABLE public.daily_chemical_status 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date;

-- 6. Cập nhật indexes
DROP INDEX IF EXISTS daily_chemical_status_user_date_idx;
CREATE INDEX daily_chemical_status_user_date_idx ON public.daily_chemical_status USING btree (user_id, date);
CREATE INDEX daily_chemical_status_date_range_idx ON public.daily_chemical_status USING btree (start_date, end_date);

-- 7. Cập nhật dữ liệu hiện có (nếu có)
UPDATE public.daily_chemical_status 
SET 
  start_date = date::date,
  end_date = date::date,
  date_type = 'single'
WHERE date_type IS NULL AND date ~ '^\d{4}-\d{2}-\d{2}$';
