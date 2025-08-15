-- Code để lấy danh sách User ID thực tế từ database
-- 1. Lấy tất cả user ID và thông tin cơ bản
SELECT 
    id as user_id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users 
ORDER BY created_at;

-- 2. Lấy user ID với format dễ copy-paste
SELECT 
    'User ID: ' || id || ' - Email: ' || email || ' - Name: ' || COALESCE(raw_user_meta_data->>'full_name', 'N/A') as user_info
FROM auth.users 
ORDER BY created_at;

-- 3. Lấy chỉ ID và email để dễ map
SELECT 
    id,
    email
FROM auth.users 
ORDER BY email;

-- 4. Kiểm tra users trong bảng profiles (nếu có)
SELECT 
    id,
    email,
    full_name,
    role
FROM public.profiles 
ORDER BY email;

-- 5. Lấy danh sách technicians (kỹ thuật viên) nếu có bảng riêng
SELECT 
    id,
    name,
    email,
    phone
FROM public.technicians 
ORDER BY name;
