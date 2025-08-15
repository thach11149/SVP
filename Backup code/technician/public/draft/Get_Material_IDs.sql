-- Code để lấy danh sách Material ID thực tế từ database
-- 1. Lấy tất cả material ID và thông tin cơ bản
SELECT 
    id as material_id,
    name,
    category,
    unit,
    price_per_unit,
    description
FROM public.materials 
ORDER BY category, name;

-- 2. Lấy material ID với format dễ copy-paste
SELECT 
    'Material ID: ' || id || ' - Name: ' || name || ' - Category: ' || category || ' - Unit: ' || unit as material_info
FROM public.materials 
ORDER BY category, name;

-- 3. Lấy chỉ ID và tên để dễ map
SELECT 
    id,
    name,
    category,
    unit
FROM public.materials 
ORDER BY category, name;

-- 4. Đếm số lượng materials hiện có
SELECT 
    COUNT(*) as total_materials,
    category,
    COUNT(*) as count_by_category
FROM public.materials 
GROUP BY category
ORDER BY category;

-- 5. Lấy materials theo category phổ biến
SELECT 
    id,
    name,
    category,
    unit,
    description
FROM public.materials 
WHERE category IN ('Hóa chất', 'Thuốc trừ sâu', 'Dụng cụ', 'Thiết bị')
ORDER BY category, name;
