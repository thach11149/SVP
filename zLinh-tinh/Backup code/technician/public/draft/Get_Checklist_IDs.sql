-- Code để lấy danh sách Checklist ID thực tế từ database
-- 1. Lấy tất cả checklist ID và thông tin cơ bản
SELECT 
    id as checklist_id,
    item_name,
    category,
    description,
    is_required
FROM public.checklist 
ORDER BY category, item_name;

-- 2. Lấy checklist ID với format dễ copy-paste
SELECT 
    'Checklist ID: ' || id || ' - Name: ' || item_name || ' - Category: ' || category as checklist_info
FROM public.checklist 
ORDER BY category, item_name;

-- 3. Lấy chỉ ID và tên để dễ map
SELECT 
    id,
    item_name,
    category,
    is_required
FROM public.checklist 
ORDER BY category, item_name;

-- 4. Đếm số lượng checklist hiện có
SELECT 
    COUNT(*) as total_checklist_items,
    category,
    COUNT(*) as count_by_category
FROM public.checklist 
GROUP BY category
ORDER BY category;

-- 5. Lấy checklist theo category phổ biến
SELECT 
    id,
    item_name,
    category,
    description,
    is_required
FROM public.checklist 
WHERE category IN ('An toàn', 'Kỹ thuật', 'Vệ sinh', 'Kiểm tra')
ORDER BY category, item_name;
