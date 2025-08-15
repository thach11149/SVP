-- Fix Technician Data Consistency
-- Đảm bảo data giữa technicians và technician_users đồng bộ

-- 1. Kiểm tra data hiện tại
SELECT 'Current technicians data:' as info;
SELECT id, user_id, tech_code, name, email FROM technicians ORDER BY created_at;

SELECT 'Current technician_users data:' as info;
SELECT technician_id, user_id, tech_code, name, auth_email FROM technician_users ORDER BY technician_id;

SELECT 'Current job_assignments data:' as info;
SELECT id, job_id, technician_id, status FROM job_assignments ORDER BY created_at;

-- 2. Kiểm tra consistency
SELECT 'Inconsistency check:' as info;
SELECT 
  t.id as technicians_id,
  t.user_id as technicians_user_id,
  tu.technician_id as tu_technician_id,
  tu.user_id as tu_user_id,
  CASE 
    WHEN t.id = tu.technician_id AND t.user_id = tu.user_id THEN 'CONSISTENT'
    ELSE 'INCONSISTENT'
  END as status
FROM technicians t
FULL OUTER JOIN technician_users tu ON t.id = tu.technician_id;

-- 3. Check orphaned job assignments
SELECT 'Orphaned job assignments:' as info;
SELECT ja.id, ja.job_id, ja.technician_id, 'NO_TECHNICIAN' as issue
FROM job_assignments ja
LEFT JOIN technicians t ON ja.technician_id = t.id
WHERE t.id IS NULL;

-- 4. Nếu cần, sync technician_users với technicians
-- (Chỉ chạy nếu cần thiết)
/*
INSERT INTO technicians (id, user_id, tech_code, name, email, active, created_at)
SELECT 
  technician_id,
  user_id, 
  tech_code,
  name,
  auth_email,
  active,
  NOW()
FROM technician_users tu
WHERE NOT EXISTS (
  SELECT 1 FROM technicians t WHERE t.id = tu.technician_id
);
*/

-- 5. Hoặc ngược lại, sync technicians với technician_users
-- (Chỉ chạy nếu cần thiết)
/*
INSERT INTO technician_users (technician_id, user_id, tech_code, name, auth_email, active)
SELECT 
  id,
  user_id,
  tech_code,
  name,
  email,
  active
FROM technicians t
WHERE NOT EXISTS (
  SELECT 1 FROM technician_users tu WHERE tu.technician_id = t.id
);
*/

-- 6. Kiểm tra các user có trong auth.users không
SELECT 'Users in auth vs technicians:' as info;
SELECT 
  t.id as technician_id,
  t.user_id,
  t.name,
  t.email,
  au.email as auth_email,
  CASE 
    WHEN au.id IS NOT NULL THEN 'EXISTS_IN_AUTH'
    ELSE 'MISSING_IN_AUTH'
  END as auth_status
FROM technicians t
LEFT JOIN auth.users au ON t.user_id = au.id
ORDER BY t.created_at;
