-- Tạo RLS policies cho bảng daily_chemical_status
-- Đảm bảo users có thể read/write dữ liệu của riêng họ

-- 1. Bật RLS cho bảng
ALTER TABLE public.daily_chemical_status ENABLE ROW LEVEL SECURITY;

-- 2. Policy cho SELECT (đọc dữ liệu của chính user)
CREATE POLICY "Users can view own chemical status" ON public.daily_chemical_status
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Policy cho INSERT (tạo mới dữ liệu cho chính user)
CREATE POLICY "Users can insert own chemical status" ON public.daily_chemical_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Policy cho UPDATE (cập nhật dữ liệu của chính user)
CREATE POLICY "Users can update own chemical status" ON public.daily_chemical_status
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Policy cho DELETE (xóa dữ liệu của chính user)
CREATE POLICY "Users can delete own chemical status" ON public.daily_chemical_status
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Kiểm tra các policies đã tạo
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'daily_chemical_status';
