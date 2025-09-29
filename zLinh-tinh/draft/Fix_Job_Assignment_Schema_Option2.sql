-- ===========================
-- CÁCH 2: SỬ DỤNG TECHNICIANS TABLE (Alternative approach)
-- ===========================

-- Nếu muốn giữ nguyên foreign key đến technicians table,
-- thì cần đảm bảo có records trong technicians table

-- Bước 1: Tạo technician records cho các auth users chưa có
INSERT INTO technicians (user_id, tech_code, name, email, active)
SELECT 
  au.id as user_id,
  'TECH_' || SUBSTRING(au.id::text, 1, 8) as tech_code,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as name,
  au.email,
  true as active
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM technicians t WHERE t.user_id = au.id
)
AND au.email IS NOT NULL;

-- Bước 2: Tạo function để tự động tạo technician record khi user đăng ký
CREATE OR REPLACE FUNCTION create_technician_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.technicians (user_id, tech_code, name, email, active)
  VALUES (
    NEW.id,
    'TECH_' || SUBSTRING(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    true
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bước 3: Tạo trigger để tự động tạo technician profile
DROP TRIGGER IF EXISTS trigger_create_technician_profile ON auth.users;
CREATE TRIGGER trigger_create_technician_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_technician_profile();

-- Bước 4: View để map giữa auth.users và technicians
CREATE OR REPLACE VIEW technician_users AS
SELECT 
  t.id as technician_id,
  t.user_id,
  t.tech_code,
  t.name,
  t.email,
  t.phone,
  t.active,
  au.email as auth_email,
  au.raw_user_meta_data->>'full_name' as full_name
FROM technicians t
JOIN auth.users au ON t.user_id = au.id
WHERE t.active = true;

-- ===========================
-- DONE!
-- ===========================

SELECT 'Technician setup completed!' as status;
