-- Code để lấy danh sách Customer ID thực tế từ database
SELECT 
    id as customer_id,
    customer_code,
    name,
    customer_type,
    primary_contact_name,
    primary_contact_phone,
    primary_contact_email
FROM public.customers 
ORDER BY customer_code;

-- Nếu muốn lấy với format để copy-paste
SELECT 
    'Customer ID: ' || id || ' - Code: ' || customer_code || ' - Name: ' || name as customer_info
FROM public.customers 
ORDER BY customer_code;

-- Lấy chỉ ID và tên để dễ map
SELECT 
    id,
    customer_code,
    name
FROM public.customers 
ORDER BY customer_code;
